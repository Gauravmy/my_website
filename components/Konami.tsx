"use client";

import { useEffect } from "react";
import { toast } from "@/lib/client";

const CODE = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

/** ↑↑↓↓←→←→BA toggles "terminal mode": everything goes monospace with CRT scanlines. */
export function Konami() {
  useEffect(() => {
    let pos = 0;
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      pos = key === CODE[pos] ? pos + 1 : key === CODE[0] ? 1 : 0;
      if (pos === CODE.length) {
        pos = 0;
        const root = document.documentElement;
        const on = root.getAttribute("data-konami") !== "on";
        if (on) root.setAttribute("data-konami", "on");
        else root.removeAttribute("data-konami");
        toast(on ? "Achievement unlocked: terminal mode. Enter the code again to exit." : "Terminal mode off. Welcome back.");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return null;
}
