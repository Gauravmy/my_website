"use client";

import { useEffect, useState } from "react";

/** Window events used to talk between independent widgets (palette, music, toast, theme). */
export const EVT = {
  palette: "gd:palette",
  music: "gd:music-toggle",
  musicState: "gd:music-state",
  toast: "gd:toast",
  theme: "gd:theme",
} as const;

export function emit(name: string, detail?: unknown) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

export function toast(message: string) {
  emit(EVT.toast, message);
}

export function useMediaQuery(query: string, initial = false) {
  const [match, setMatch] = useState(initial);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatch(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return match;
}

export function safeStorage(kind: "local" | "session") {
  return {
    get(key: string) {
      try {
        return (kind === "local" ? localStorage : sessionStorage).getItem(key);
      } catch {
        return null;
      }
    },
    set(key: string, value: string) {
      try {
        (kind === "local" ? localStorage : sessionStorage).setItem(key, value);
      } catch {
        /* storage blocked: fine, the site still works */
      }
    },
  };
}

export function toggleTheme() {
  const d = document.documentElement;
  const next = d.getAttribute("data-theme") === "light" ? "dark" : "light";
  d.setAttribute("data-theme", next);
  safeStorage("local").set("gd-theme", next);
  emit(EVT.theme, next);
  return next;
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  history.replaceState(null, "", `#${id}`);
}
