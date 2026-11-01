// The WebGL scene: one point cloud that first trains into the name, then re-forms as real data.
//
// The opening is genuine gradient descent. Each point p minimises ||p - target||² with learning
// rate lr, which has the closed form p(t) = target + (p0 - target)·(1 - 2·lr)^t. The vertex shader
// evaluates that per point on the GPU, and the loss in the readout is measured from the same formula.
import { BufferAttribute, BufferGeometry, LinearSRGBColorSpace, PerspectiveCamera, Points, Scene, ShaderMaterial, WebGLRenderer } from "three";
import { rng, type Shape } from "./shapes";

const VERT = /* glsl */ `
  attribute vec3 aFrom, aTo, aColFrom, aColTo;
  attribute vec4 aRnd; // lr, stagger, phase, size
  uniform float uEpoch, uMix, uTime, uPx, uCamZ, uMouseK, uRad, uPush, uJit, uTrain;
  uniform vec2 uMouse;
  varying vec3 vCol;
  void main() {
    float m;
    if (uTrain > 0.5) {
      m = 1.0 - pow(1.0 - 2.0 * aRnd.x, uEpoch);
    } else {
      float st = aRnd.y * 0.35;
      m = smoothstep(st, st + 0.65, uMix);
    }
    vec3 p = mix(aFrom, aTo, m);
    if (uTrain < 0.5) {
      float flight = sin(m * 3.14159265);
      p += flight * vec3(sin(aRnd.z * 6.283), cos(aRnd.z * 9.1), sin(aRnd.z * 3.7)) * 70.0;
    }
    p.xy += vec2(sin(uTime * 0.7 + aRnd.z * 40.0), cos(uTime * 0.6 + aRnd.z * 31.0)) * uJit;
    vec2 d = p.xy - uMouse;
    float f = exp(-dot(d, d) / (uRad * uRad)) * uMouseK;
    p.xy += normalize(d + 0.0001) * f * uPush;
    p.z += f * uPush * 1.4;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uPx * aRnd.w * (uCamZ / -mv.z);
    vCol = mix(aColFrom, aColTo, m);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  varying vec3 vCol;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    gl_FragColor = vec4(vCol, smoothstep(0.5, 0.32, d));
  }
`;

export type Progress = { epoch: number; total: number; loss: number; done: boolean };

export type EngineOptions = {
  canvas: HTMLCanvasElement;
  count: number;
  pixelSize: number;
  animate: boolean;
  dpr: number;
  onProgress: (p: Progress) => void;
  /** Even with reduced detail this device can't keep up. */
  onTooSlow: () => void;
};

const EPOCHS = 160;
const EPOCHS_PER_SEC = 62;

export function createEngine(opts: EngineOptions) {
  const { canvas, count: N, animate } = opts;
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "high-performance" });
  renderer.outputColorSpace = LinearSRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  let dpr = opts.dpr;
  renderer.setPixelRatio(dpr);

  const camera = new PerspectiveCamera(35, 1, 1, 8000);
  const scene = new Scene();

  // Per-point constants. Learning rates differ, so points arrive at different times.
  const rnd = new Float32Array(N * 4);
  const r = rng(3);
  for (let i = 0; i < N; i++) {
    rnd[i * 4] = 0.018 + r() * 0.03;
    rnd[i * 4 + 1] = r();
    rnd[i * 4 + 2] = r();
    rnd[i * 4 + 3] = 0.72 + r() * 0.56;
  }

  const geo = new BufferGeometry();
  const attr = (a: Float32Array, n: number) => new BufferAttribute(a, n);
  const aFrom = attr(new Float32Array(N * 3), 3);
  const aTo = attr(new Float32Array(N * 3), 3);
  const aColFrom = attr(new Float32Array(N * 3), 3);
  const aColTo = attr(new Float32Array(N * 3), 3);
  geo.setAttribute("position", aFrom); // three needs a position attribute for the draw count
  geo.setAttribute("aFrom", aFrom);
  geo.setAttribute("aTo", aTo);
  geo.setAttribute("aColFrom", aColFrom);
  geo.setAttribute("aColTo", aColTo);
  geo.setAttribute("aRnd", attr(rnd, 4));

  const uniforms = {
    uEpoch: { value: 0 },
    uMix: { value: 0 },
    uTrain: { value: 1 },
    uTime: { value: 0 },
    uPx: { value: opts.pixelSize * dpr },
    uCamZ: { value: 1000 },
    uMouse: { value: { x: 99999, y: 99999 } },
    uMouseK: { value: 0 },
    uRad: { value: 130 },
    uPush: { value: 46 },
    uJit: { value: animate ? 0.55 : 0 },
  };
  const mat = new ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms, transparent: true, depthTest: false, depthWrite: false });
  const points = new Points(geo, mat);
  points.frustumCulled = false;
  scene.add(points);

  let W = 1;
  let H = 1;
  function resize(w: number, h: number) {
    W = w;
    H = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Put the camera so one world unit is one CSS pixel at z = 0.
    const z = h / 2 / Math.tan((camera.fov * Math.PI) / 360);
    camera.position.z = z;
    uniforms.uCamZ.value = z;
    camera.updateProjectionMatrix();
    dirty = true;
  }

  function setPair(a: Shape, b: Shape) {
    (aFrom.array as Float32Array).set(a.pos);
    (aColFrom.array as Float32Array).set(a.col);
    (aTo.array as Float32Array).set(b.pos);
    (aColTo.array as Float32Array).set(b.col);
    aFrom.needsUpdate = aColFrom.needsUpdate = aTo.needsUpdate = aColTo.needsUpdate = true;
    dirty = true;
  }

  // --- Training (the opening) ---
  let training = false;
  let epoch = 0;
  let speed = 1;
  const sample: { lr: number; d2: number }[] = [];
  function startTraining(noise: Shape, target: Shape, fast: boolean) {
    setPair(noise, target);
    sample.length = 0;
    const step = Math.max(1, Math.floor(N / 900));
    for (let i = 0; i < N; i += step) {
      const dx = target.pos[i * 3] - noise.pos[i * 3];
      const dy = target.pos[i * 3 + 1] - noise.pos[i * 3 + 1];
      const dz = target.pos[i * 3 + 2] - noise.pos[i * 3 + 2];
      sample.push({ lr: rnd[i * 4], d2: dx * dx + dy * dy + dz * dz });
    }
    epoch = fast ? EPOCHS * 0.5 : 0;
    speed = fast ? 2 : 1;
    training = true;
    uniforms.uTrain.value = 1;
    uniforms.uEpoch.value = epoch;
  }
  function measureLoss() {
    let sum = 0;
    let base = 0;
    for (const s of sample) {
      const k = Math.pow(1 - 2 * s.lr, epoch);
      sum += k * k * s.d2;
      base += s.d2;
    }
    return base ? sum / base : 0;
  }
  function finishTraining(final: Shape) {
    training = false;
    uniforms.uTrain.value = 0;
    seq = [final];
    seqIndex = -1;
    current = target = 0;
    setPair(final, final);
    uniforms.uMix.value = 0;
    opts.onProgress({ epoch: EPOCHS, total: EPOCHS, loss: measureLoss(), done: true });
  }
  let trainFinal: Shape | null = null;

  // --- Scroll-driven morphing through a sequence of shapes ---
  let seq: Shape[] = [];
  let seqIndex = -1;
  let current = 0;
  let target = 0;
  function setSequence(shapes: Shape[], at: number) {
    seq = shapes;
    seqIndex = -1;
    current = target = at;
    dirty = true;
  }
  function setTarget(p: number) {
    target = p;
    dirty = true;
  }
  function applySequence() {
    if (!seq.length) return;
    const clamped = Math.max(0, Math.min(seq.length - 1, current));
    const i = Math.min(seq.length - 2, Math.floor(clamped));
    if (seq.length === 1) {
      if (seqIndex !== 0) {
        setPair(seq[0], seq[0]);
        seqIndex = 0;
      }
      uniforms.uMix.value = 0;
      return;
    }
    if (i !== seqIndex) {
      setPair(seq[i], seq[i + 1]);
      seqIndex = i;
    }
    uniforms.uMix.value = clamped - i;
  }

  // --- Pointer ---
  const mouse = { x: 99999, y: 99999, tx: 99999, ty: 99999, k: 0, tk: 0 };
  let lastMove = 0;
  function pointer(clientX: number, clientY: number) {
    mouse.tx = clientX - W / 2;
    mouse.ty = H / 2 - clientY;
    if (mouse.k < 0.01) {
      mouse.x = mouse.tx;
      mouse.y = mouse.ty;
    }
    mouse.tk = 1;
    lastMove = performance.now();
    dirty = true;
  }

  // --- Loop ---
  let raf = 0;
  let running = false;
  let dirty = true;
  let prev = 0;
  let scrollY = 0;
  let px = 0;
  let py = 0;
  let frames = 0;
  let frameTime = 0;
  let downgraded = false;

  function frame(now: number) {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    // The first frame's timestamp can predate start(), so never let time run backwards.
    const rawDt = Math.max(0, now - prev) / 1000 || 0.016;
    const dt = Math.min(0.05, rawDt);
    prev = now;
    uniforms.uTime.value += dt;

    if (training) {
      epoch += dt * EPOCHS_PER_SEC * speed;
      uniforms.uEpoch.value = epoch;
      opts.onProgress({ epoch: Math.min(EPOCHS, Math.round(epoch)), total: EPOCHS, loss: measureLoss(), done: false });
      if (epoch >= EPOCHS && trainFinal) finishTraining(trainFinal);
      dirty = true;
    } else if (Math.abs(target - current) > 0.0005) {
      current += (target - current) * Math.min(1, dt * 7);
      applySequence();
      dirty = true;
    } else {
      current = target;
      applySequence();
    }

    // Smoothed pointer, fading out shortly after it stops.
    if (now - lastMove > 900) mouse.tk = 0;
    if (Math.abs(mouse.k - mouse.tk) > 0.002 || mouse.k > 0.002) {
      mouse.x += (mouse.tx - mouse.x) * Math.min(1, dt * 9);
      mouse.y += (mouse.ty - mouse.y) * Math.min(1, dt * 9);
      mouse.k += (mouse.tk - mouse.k) * Math.min(1, dt * 5);
      uniforms.uMouse.value = { x: mouse.x, y: mouse.y - scrollY };
      uniforms.uMouseK.value = mouse.k;
      dirty = true;
    }

    // A slight tilt toward the pointer gives depth without losing the alignment of the letters.
    const gx = mouse.tk ? mouse.tx / W : 0;
    const gy = mouse.tk ? mouse.ty / H : 0;
    px += (gx - px) * Math.min(1, dt * 2.5);
    py += (gy - py) * Math.min(1, dt * 2.5);
    points.rotation.y = px * 0.035;
    points.rotation.x = -py * 0.025;
    points.position.y = scrollY;

    if (animate) dirty = true;
    if (dirty) {
      renderer.render(scene, camera);
      dirty = false;
    }

    // If this device can't hold frame rate, trade detail for smoothness once; if that isn't enough, step aside.
    if (frames < 90) {
      frames++;
      // Measured uncapped: dt above is clamped, and a clamped number can't show how slow a frame was.
      frameTime += rawDt;
      if (frames === 90) {
        const avg = frameTime / frames;
        if (!downgraded && avg > 1 / 28) {
          downgraded = true;
          frames = 0;
          frameTime = 0;
          dpr = 1;
          renderer.setPixelRatio(1);
          renderer.setSize(W, H, false);
          uniforms.uPx.value = opts.pixelSize;
          geo.setDrawRange(0, Math.floor(N * 0.6));
        } else if (downgraded && avg > 1 / 12) {
          opts.onTooSlow();
        }
      }
    }
  }

  return {
    resize,
    startTraining(noise: Shape, final: Shape, fast: boolean) {
      trainFinal = final;
      startTraining(noise, final, fast);
    },
    /** Jump the opening to its last moments. */
    hurry() {
      if (training) speed = Math.max(speed, 5);
    },
    showStatic(shape: Shape) {
      training = false;
      uniforms.uTrain.value = 0;
      seq = [shape];
      seqIndex = -1;
      current = target = 0;
      setPair(shape, shape);
      uniforms.uMix.value = 0;
      points.position.y = scrollY;
      renderer.render(scene, camera);
    },
    get training() {
      return training;
    },
    setSequence,
    setTarget,
    setScroll(y: number) {
      scrollY = y;
      dirty = true;
    },
    pointer,
    start() {
      if (running) return;
      running = true;
      prev = performance.now();
      dirty = true;
      raf = requestAnimationFrame(frame);
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
    },
    destroy() {
      running = false;
      cancelAnimationFrame(raf);
      geo.dispose();
      mat.dispose();
      renderer.dispose();
    },
  };
}

export type Engine = ReturnType<typeof createEngine>;
