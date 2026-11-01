"use client";

import dynamic from "next/dynamic";

// Interactive extras that aren't needed for first paint: loaded after hydration, client-only.
const MusicToggle = dynamic(() => import("./MusicToggle").then((m) => m.MusicToggle), { ssr: false });
const CommandPalette = dynamic(() => import("./CommandPalette").then((m) => m.CommandPalette), { ssr: false });
const Toaster = dynamic(() => import("./Toaster").then((m) => m.Toaster), { ssr: false });
const Konami = dynamic(() => import("./Konami").then((m) => m.Konami), { ssr: false });

export function Widgets() {
  return (
    <>
      <MusicToggle />
      <CommandPalette />
      <Toaster />
      <Konami />
    </>
  );
}
