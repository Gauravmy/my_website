"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { getProject, projects, type Project, type ProjectTag } from "@/data/projects";
import { fitStore } from "@/lib/fit";
import { ArrowLeft, ArrowRight, CloseIcon } from "./Icons";

type Filter = "All" | ProjectTag;
const filters: { id: Filter; label: string }[] = [
  { id: "All", label: "All" },
  { id: "AI/ML", label: "AI / ML" },
  { id: "Full-Stack", label: "Full-Stack" },
];
const defaultOrder = projects.map((p) => p.slug);

/** Filter tabs and the "ordered for your job" note. The project blocks are static HTML, so this moves them directly. */
export function WorkControls() {
  const [filter, setFilter] = useState<Filter>("All");
  const order = useSyncExternalStore(fitStore.subscribe, fitStore.get, fitStore.server);

  useEffect(() => {
    const list = document.getElementById("work-list");
    if (!list) return;
    for (const slug of order?.slugs ?? defaultOrder) {
      const el = list.querySelector<HTMLElement>(`[data-project="${slug}"]`);
      if (!el) continue;
      list.appendChild(el); // real DOM order, so keyboard order follows what's on screen
      el.hidden = filter !== "All" && !(el.dataset.tags ?? "").split(",").includes(filter);
    }
  }, [filter, order]);

  return (
    <div className="flex flex-col items-start gap-2 md:items-end">
      <div role="group" aria-label="Filter projects" className="flex items-baseline gap-4">
        {filters.map((f) => {
          const count = projects.filter((p) => f.id === "All" || p.tags.includes(f.id as ProjectTag)).length;
          return (
            <button key={f.id} onClick={() => setFilter(f.id)} aria-pressed={filter === f.id} className="tap text-[0.95rem] font-semibold">
              <span className={filter === f.id ? "mark" : "muted hover:text-fg"}>
                {f.label}
                <sup className="t-mono ml-0.5 font-normal">{count}</sup>
              </span>
            </button>
          );
        })}
      </div>
      {order && (
        <p className="flex flex-wrap items-center gap-3 border border-fg px-3 py-1.5 text-sm" role="status">
          <span>
            Ordered by similarity to <strong>{order.label}</strong>.
          </span>
          <button type="button" className="link tap font-semibold" onClick={() => fitStore.set(null)}>
            Reset
          </button>
        </p>
      )}
    </div>
  );
}

/** Full-size screenshot viewer. Opens from any button with data-view="slug:index". */
export function Lightbox() {
  const [view, setView] = useState<{ p: Project; i: number } | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const current = view?.p.shots?.[view.i];

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element).closest<HTMLElement>("[data-view]");
      if (!el) return;
      const [slug, i] = (el.dataset.view ?? "").split(":");
      const p = getProject(slug);
      if (!p) return;
      setView({ p, i: Number(i) });
      dialog.current?.showModal();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const close = () => dialog.current?.close();
  const step = (d: 1 | -1) => setView((v) => (v ? { ...v, i: (v.i + d + v.p.shots!.length) % v.p.shots!.length } : v));

  return (
    <dialog
      ref={dialog}
      onClick={(e) => e.target === dialog.current && close()}
      onClose={() => setView(null)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") step(1);
        if (e.key === "ArrowLeft") step(-1);
      }}
      aria-label="Screenshot viewer"
      className="m-auto w-[min(93.75rem,calc(100vw-1.5rem))] max-w-none overflow-visible bg-transparent p-0"
    >
      {view && current && (
        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-3 text-white">
            <p className="text-sm">
              <span className="font-semibold">{view.p.title}</span>
              <span className="text-white/75"> · {current.caption}</span>
              <span className="t-mono ml-2 text-white/60">
                {view.i + 1}/{view.p.shots!.length}
              </span>
            </p>
            <div className="flex gap-1">
              <button onClick={() => step(-1)} className="nav-btn border border-white/30 text-white hover:bg-white/10" aria-label="Previous screenshot">
                <ArrowLeft size={17} />
              </button>
              <button onClick={() => step(1)} className="nav-btn border border-white/30 text-white hover:bg-white/10" aria-label="Next screenshot">
                <ArrowRight size={17} />
              </button>
              <button onClick={close} autoFocus className="nav-btn border border-white/30 text-white hover:bg-white/10" aria-label="Close viewer">
                <CloseIcon size={17} />
              </button>
            </div>
          </div>
          <Image src={current.src} alt={current.alt} width={current.w} height={current.h} sizes="100vw" className="block h-auto max-h-[84dvh] w-full object-contain" />
        </div>
      )}
    </dialog>
  );
}
