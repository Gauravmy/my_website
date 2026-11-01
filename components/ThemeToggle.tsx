"use client";

import { useEffect, useState } from "react";
import { EVT, toggleTheme } from "@/lib/client";
import { MoonIcon, SunIcon } from "./Icons";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("light");

  useEffect(() => {
    setTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light");
    const onTheme = (e: Event) => setTheme((e as CustomEvent).detail);
    window.addEventListener(EVT.theme, onTheme);
    return () => window.removeEventListener(EVT.theme, onTheme);
  }, []);

  const label = theme === "dark" ? "Switch to light theme" : "Switch to dark theme";
  return (
    <button onClick={() => toggleTheme()} className="nav-btn opacity-80 transition-opacity hover:opacity-100" aria-label={label} title={label}>
      {theme === "dark" ? <SunIcon size={17} /> : <MoonIcon size={17} />}
    </button>
  );
}
