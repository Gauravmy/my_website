"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EVT, emit, safeStorage, toast } from "@/lib/client";
import { MusicIcon } from "./Icons";

/**
 * Ambient music, off by default, starts only after a click.
 *
 * TRACK: drop a royalty-free loop at /public/audio/ambient.mp3.
 *   Licence: note the track's licence here, e.g.
 *   "<Title>" by <Artist>, <source URL>, licensed under <licence> (e.g. Pixabay Content License / CC0).
 *
 * If that file is missing, a generative pad is synthesised live with the Web Audio API instead,
 * so there is never a licensing question for the fallback: it is generated in your browser.
 */
const TRACK = "/audio/ambient.mp3";
const VOLUME = 0.35;
const store = safeStorage("local");

type Engine = { start: () => Promise<void>; stop: () => void };

function fileEngine(): Engine & { audio: HTMLAudioElement } {
  const audio = new Audio(TRACK);
  audio.loop = true;
  audio.volume = VOLUME;
  audio.preload = "none";
  return {
    audio,
    start: () => audio.play(),
    stop: () => audio.pause(),
  };
}

function synthEngine(): Engine {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  const start = async () => {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 900;
      filter.Q.value = 0.4;
      // Soft feedback delay for space.
      const delay = ctx.createDelay(2);
      delay.delayTime.value = 0.55;
      const fb = ctx.createGain();
      fb.gain.value = 0.35;
      delay.connect(fb).connect(delay);
      filter.connect(master);
      filter.connect(delay);
      delay.connect(master);
      master.connect(ctx.destination);
      // A calm Amaj9-ish voicing, each voice drifting slightly.
      [110, 164.81, 207.65, 246.94, 277.18].forEach((f, i) => {
        const o = ctx!.createOscillator();
        o.type = i % 2 ? "sine" : "triangle";
        o.frequency.value = f;
        o.detune.value = (i - 2) * 3;
        const g = ctx!.createGain();
        g.gain.value = 0.05;
        const lfo = ctx!.createOscillator();
        lfo.frequency.value = 0.05 + i * 0.023;
        const lfoGain = ctx!.createGain();
        lfoGain.gain.value = 0.035;
        lfo.connect(lfoGain).connect(g.gain);
        o.connect(g).connect(filter);
        o.start();
        lfo.start();
      });
    }
    await ctx.resume();
    master!.gain.cancelScheduledValues(ctx.currentTime);
    master!.gain.setTargetAtTime(VOLUME * 0.9, ctx.currentTime, 0.8);
  };
  const stop = () => {
    if (!ctx || !master) return;
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
    window.setTimeout(() => ctx?.suspend(), 1200);
  };
  return { start, stop };
}

export function MusicToggle() {
  const [playing, setPlaying] = useState(false);
  // Stay out of the way of the hero's buttons: appear once the visitor scrolls (or while playing).
  const [scrolled, setScrolled] = useState(false);
  const engine = useRef<Engine | null>(null);

  const getEngine = useCallback(async (): Promise<Engine> => {
    if (engine.current) return engine.current;
    // Check the file exists before committing to it.
    try {
      const res = await fetch(TRACK, { method: "HEAD" });
      engine.current = res.ok ? fileEngine() : synthEngine();
    } catch {
      engine.current = synthEngine();
    }
    return engine.current;
  }, []);

  const play = useCallback(async () => {
    const e = await getEngine();
    try {
      await e.start();
      setPlaying(true);
      store.set("gd-music", "on");
    } catch {
      toast("Your browser blocked audio. Tap the music button again.");
    }
  }, [getEngine]);

  const pause = useCallback(() => {
    engine.current?.stop();
    setPlaying(false);
    store.set("gd-music", "off");
  }, []);

  const toggle = useCallback(() => (playing ? pause() : play()), [playing, pause, play]);

  // If the visitor turned music on last time, resume on their first interaction (browsers forbid autoplay).
  useEffect(() => {
    if (store.get("gd-music") !== "on") return;
    const resume = (ev: Event) => {
      if ((ev.target as Element | null)?.closest?.("[data-music-toggle]")) return;
      play();
      cleanup();
    };
    const cleanup = () => {
      window.removeEventListener("pointerdown", resume);
      window.removeEventListener("keydown", resume);
    };
    window.addEventListener("pointerdown", resume, { once: true });
    window.addEventListener("keydown", resume, { once: true });
    return cleanup;
  }, []);

  useEffect(() => {
    const on = () => toggle();
    window.addEventListener(EVT.music, on);
    return () => window.removeEventListener(EVT.music, on);
  }, [toggle]);

  useEffect(() => emit(EVT.musicState, playing), [playing]);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > window.innerHeight * 0.5);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const visible = scrolled || playing;

  return (
    <button
      data-music-toggle
      onClick={toggle}
      aria-pressed={playing}
      aria-label={playing ? "Pause ambient music" : "Play ambient music"}
      title={playing ? "Pause ambient music" : "Play ambient music"}
      tabIndex={visible ? 0 : -1}
      aria-hidden={visible ? undefined : true}
      className={`fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-[max(1rem,env(safe-area-inset-left))] z-[70] tap gap-2 border border-line bg-bg px-2.5 text-fg transition-[opacity,transform,border-color] duration-300 hover:border-fg ${
        visible ? "opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      {playing ? (
        <span className="flex h-4 items-end gap-[3px]" aria-hidden>
          {[0, 0.2, 0.4, 0.1].map((d, i) => (
            <span key={i} className="eq-bar block w-[3px] bg-accent" style={{ height: "100%", animationDelay: `${d}s` }} />
          ))}
        </span>
      ) : (
        <MusicIcon size={16} />
      )}
      <span className="t-mono hidden sm:inline">{playing ? "sound on" : "sound off"}</span>
    </button>
  );
}
