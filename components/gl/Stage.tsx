"use client";

import { useEffect, useRef } from "react";
import sku from "@/data/stockwise-sku1001.json";
import { safeStorage } from "@/lib/client";
import type { Engine } from "./engine";
import type { Rect, Shape, TextLine } from "./shapes";

/**
 * The fixed WebGL layer behind the hero and "How I work".
 * Loads three.js only when it can run; without WebGL or with reduced motion the page is complete without it.
 */
export function Stage() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const state = root.getAttribute("data-gl");
    if (state === "off" || !state || !canvas.current) return;

    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    // A phone in either orientation is still a phone.
    const small = Math.min(window.innerWidth, window.innerHeight) < 600;
    // More points on bigger screens, and larger ones, so the letters stay just as solid on a 4K monitor.
    const scale = window.innerWidth / 1440;
    const maxPoints = coarse ? 30000 : 90000;
    const count = small ? 12000 : Math.round(Math.min(maxPoints, 42000 * Math.max(0.7, scale)));
    const pixelSize = small ? 1.7 : 1.85 * Math.max(1, Math.sqrt((scale * scale) / (count / 42000)));

    let engine: Engine | null = null;
    let disposed = false;
    let W = 0;
    let H = 0;
    let hero: Shape | null = null;
    let noise: Shape | null = null;
    let processShapes: Shape[] | null = null;
    let mode: "hero" | "process" | "none" = "none";
    let cleanup: (() => void) | undefined;

    const ready = () => {
      safeStorage("session").set("gd-intro", "1");
      root.setAttribute("data-gl", "ready");
    };

    const setReadout = (epoch: number, total: number, loss: number, done: boolean) => {
      const el = document.getElementById("gl-readout");
      if (!el) return;
      el.style.setProperty("--p", String(Math.min(1, epoch / total)));
      const text = el.querySelector("[data-text]");
      if (text) {
        // One line only: a wrap here would move the heading away from the particles.
        const w = window.innerWidth;
        const ep = String(epoch).padStart(3, "0");
        text.textContent = done
          ? `${w >= 340 ? "trained · " : ""}${total} epochs · loss ${loss.toFixed(5)}${w >= 700 ? " · real gradient descent, running in your browser" : ""}`
          : `${w >= 360 ? "training · " : ""}epoch ${ep}/${total} · loss ${loss.toFixed(5)}`;
      }
    };

    function nameLines(): { lines: TextLine[]; extent: Rect } | null {
      const h1 = document.getElementById("hero-name");
      if (!h1) return null;
      const spans = Array.from(h1.querySelectorAll<HTMLElement>(".line"));
      const cs = getComputedStyle(h1);
      const font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const m = document.createElement("canvas").getContext("2d")!;
      m.font = font;
      const metrics = m.measureText("Gg");
      const asc = metrics.fontBoundingBoxAscent;
      const desc = metrics.fontBoundingBoxDescent;
      const lines = spans.map((s) => {
        const range = document.createRange();
        range.selectNodeContents(s);
        const b = range.getBoundingClientRect();
        return {
          text: s.textContent ?? "",
          font,
          letterSpacing: cs.letterSpacing,
          left: b.left,
          // Text is vertically centred in its line box, so derive the baseline from the font's metrics.
          baseline: b.top + window.scrollY + (b.height - (asc + desc)) / 2 + asc,
        };
      });
      const box = h1.getBoundingClientRect();
      return {
        lines,
        extent: { x: 0, y: box.top + window.scrollY - 40, w: window.innerWidth, h: box.height + 80 },
      };
    }

    /** The sticky element in "How I work" says where the figures should be drawn. */
    function regionRect(): Rect {
      const el = document.getElementById("gl-region");
      const fallback = { x: W * 0.05, y: -H * 0.3, w: W * 0.4, h: H * 0.6 };
      if (!el) return fallback;
      const cs = getComputedStyle(el);
      const fixed = cs.position === "fixed";
      const b = el.getBoundingClientRect();
      const top = fixed ? b.top : parseFloat(cs.top) || 0;
      const inset = Math.min(b.width, b.height) * 0.06;
      return {
        x: b.left + inset - W / 2,
        y: H / 2 - (top + b.height) + inset * 2.4,
        w: b.width - inset * 2,
        h: b.height - inset * 4.2,
      };
    }

    async function build() {
      const shapes = await import("./shapes");
      W = canvas.current!.clientWidth;
      H = canvas.current!.clientHeight;
      engine!.resize(W, H);
      noise = shapes.noiseShape(count, W, H);
      const name = nameLines();
      if (name) hero = shapes.textShape(count, W, H, name.lines, name.extent);
      processShapes = null;
      const rect = regionRect();
      // Built lazily after the hero is on screen; the screenshot needs to download.
      const data = shapes.scatterShape(count, W, H, rect, sku.history);
      const lines = shapes.linesShape(count, W, H, rect, sku.actual, sku.baseline, sku.rf);
      const tests = shapes.testsShape(count, W, H, rect);
      const shots = await shapes.imageShape(count, W, H, rect, "/projects/stockwise/2.webp").catch(() => tests);
      processShapes = [noise, data, lines, tests, shots];
      syncScroll();
    }

    function syncScroll() {
      if (!engine || !hero || !noise) return;
      const y = window.scrollY;
      const heroEl = document.getElementById("top");
      const heroH = heroEl?.offsetHeight ?? H;
      const steps = Array.from(document.querySelectorAll<HTMLElement>("[data-step]"));
      const process = document.getElementById("process");
      const pr = process?.getBoundingClientRect();
      const inProcess = !!pr && pr.top < H * 0.75 && pr.bottom > H * 0.25;

      if (inProcess && processShapes && steps.length) {
        if (mode !== "process") {
          mode = "process";
          engine.setScroll(0);
          engine.setSequence(processShapes, 0);
        }
        // Morph between figures as each step's centre crosses the middle of the screen.
        const centres = steps.map((s) => {
          const b = s.getBoundingClientRect();
          return b.top + b.height / 2 - H / 2;
        });
        let p = 0;
        if (centres[0] > 0) p = Math.max(0, 1 - centres[0] / (H * 0.7));
        else {
          p = 1;
          for (let i = 0; i < centres.length - 1; i++) {
            if (centres[i] <= 0 && centres[i + 1] > 0) {
              const t = -centres[i] / (centres[i + 1] - centres[i]);
              // Hold on each figure; only move in the middle of the gap between steps.
              const eased = Math.min(1, Math.max(0, (t - 0.28) / 0.44));
              p = i + 1 + eased;
              break;
            }
            if (i === centres.length - 2 && centres[i + 1] <= 0) p = centres.length;
          }
        }
        engine.setTarget(p);
        const shot = document.getElementById("process-shot");
        if (shot) shot.style.opacity = p > 3.82 ? "1" : "0";
        const active = Math.min(steps.length - 1, Math.max(0, Math.round(p) - 1));
        document.querySelectorAll<HTMLElement>("[data-legend]").forEach((el) => {
          el.style.opacity = Number(el.dataset.legend) === active && Math.abs(p - Math.round(p)) < 0.3 && p > 0.6 ? "1" : "0";
        });
      } else if (y < heroH + 200) {
        hideProcessShot();
        if (mode !== "hero" && !engine.training) {
          mode = "hero";
          engine.setSequence([hero, noise], 0);
        }
        engine.setScroll(y);
        if (!engine.training) engine.setTarget(Math.min(1, Math.max(0, (y - heroH * 0.12) / (heroH * 0.7))));
      } else {
        hideProcessShot();
      }
    }

    // On phones this screenshot is position: fixed, so it mustn't stay lit after leaving the section.
    function hideProcessShot() {
      const shot = document.getElementById("process-shot");
      if (shot) shot.style.opacity = "0";
    }

    async function init() {
      const { createEngine } = await import("./engine");
      if (disposed || !canvas.current) return;
      const shapes = await import("./shapes");
      await document.fonts.ready;
      if (disposed || !canvas.current) return;
      engine = createEngine({
        canvas: canvas.current,
        count,
        pixelSize,
        animate: !calm && !coarse,
        dpr: Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2),
        onTooSlow: () => {
          if (location.search.includes("gl=force")) return;
          safeStorage("session").set("gd-intro", "1");
          engine?.stop();
          root.setAttribute("data-gl", "off");
          setReadout(1, 1, 0, true);
        },
        onProgress: (p) => {
          setReadout(p.epoch, p.total, p.loss, p.done);
          if (p.done) {
            mode = "hero";
            engine?.setSequence([hero!, noise!], 0);
            syncScroll();
          } else if (p.epoch >= p.total - 45) {
            // Reveal the page while the last of the loss is still falling.
            ready();
          }
        },
      });
      W = canvas.current.clientWidth;
      H = canvas.current.clientHeight;
      engine.resize(W, H);
      noise = shapes.noiseShape(count, W, H);
      const name = nameLines();
      if (!name) return;
      hero = shapes.textShape(count, W, H, name.lines, name.extent);
      engine.setScroll(window.scrollY);

      const hidden = () => document.hidden;
      if (calm) {
        engine.showStatic(hero);
        setReadout(160, 160, 0, true);
        ready();
      } else {
        engine.startTraining(noise, hero, state === "seen");
        engine.start();
        if (state === "seen") ready();
      }

      // Any interaction hurries the opening along.
      const hurry = () => {
        engine?.hurry();
        ready();
      };
      window.addEventListener("pointerdown", hurry, { once: true });
      window.addEventListener("keydown", hurry, { once: true });
      window.addEventListener("wheel", hurry, { once: true, passive: true });

      const onScroll = () => {
        syncScroll();
        if (calm) engine?.setScroll(window.scrollY);
      };
      const onPointer = (e: PointerEvent) => engine?.pointer(e.clientX, e.clientY);
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("pointermove", onPointer, { passive: true });

      // Only draw while the stage is actually visible.
      const visible = new Set<Element>();
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
        if (root.getAttribute("data-gl") === "off") return;
        if (visible.size && !hidden() && !calm) engine?.start();
        else if (!calm) engine?.stop();
      });
      ["top", "process"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) io.observe(el);
      });
      const onVis = () => {
        if (root.getAttribute("data-gl") === "off") return;
        if (hidden()) engine?.stop();
        else if (visible.size && !calm) engine?.start();
      };
      document.addEventListener("visibilitychange", onVis);

      // Rebuild on real size changes, not on a mobile toolbar sliding away.
      let lastW = window.innerWidth;
      let lastH = window.innerHeight;
      let t = 0;
      const onResize = () => {
        if (window.innerWidth === lastW && Math.abs(window.innerHeight - lastH) < 140) return;
        lastW = window.innerWidth;
        lastH = window.innerHeight;
        clearTimeout(t);
        t = window.setTimeout(async () => {
          mode = "none";
          await build();
          if (calm && hero) engine?.showStatic(hero);
        }, 200);
      };
      window.addEventListener("resize", onResize);

      // The process figures need a screenshot download, so they wait until the opening is done.
      const later = (cb: () => void) => (typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(cb, { timeout: 3500 }) : setTimeout(cb, 2500));
      later(async () => {
        if (disposed) return;
        const rect = regionRect();
        const data = shapes.scatterShape(count, W, H, rect, sku.history);
        const lines = shapes.linesShape(count, W, H, rect, sku.actual, sku.baseline, sku.rf);
        const tests = shapes.testsShape(count, W, H, rect);
        const shots = await shapes.imageShape(count, W, H, rect, "/projects/stockwise/2.webp").catch(() => tests);
        if (disposed) return;
        processShapes = [noise!, data, lines, tests, shots];
        syncScroll();
      });

      cleanup = () => {
        io.disconnect();
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("pointermove", onPointer);
        window.removeEventListener("resize", onResize);
        window.removeEventListener("pointerdown", hurry);
        window.removeEventListener("keydown", hurry);
        window.removeEventListener("wheel", hurry);
        document.removeEventListener("visibilitychange", onVis);
      };
    }

    init().catch(() => {
      // WebGL failed after all: fall back to the plain page.
      root.setAttribute("data-gl", "off");
    });

    return () => {
      disposed = true;
      cleanup?.();
      engine?.destroy();
    };
  }, []);

  return (
    <div className="gl-stage" aria-hidden>
      <canvas ref={canvas} />
    </div>
  );
}
