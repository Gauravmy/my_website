"use client";

import { useEffect, useState } from "react";
import { EVT } from "@/lib/client";

export function Toaster() {
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let timer = 0;
    const on = (e: Event) => {
      setMsg(String((e as CustomEvent).detail));
      clearTimeout(timer);
      timer = window.setTimeout(() => setMsg(null), 2800);
    };
    window.addEventListener(EVT.toast, on);
    return () => {
      window.removeEventListener(EVT.toast, on);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[80] flex justify-center px-4" role="status" aria-live="polite">
      {msg && <div className="bg-acid px-4 py-2.5 text-sm font-semibold text-on-acid">{msg}</div>}
    </div>
  );
}
