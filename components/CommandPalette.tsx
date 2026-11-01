"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { social } from "@/data/links";
import { sections } from "@/data/misc";
import { profile } from "@/data/profile";
import { onResumeDownload } from "@/lib/analytics";
import { EVT, copyText, emit, scrollToId, toast, toggleTheme } from "@/lib/client";
import { SearchIcon } from "./Icons";

type Cmd = { id: string; group: string; label: string; hint?: string; run: () => void };

function download(href: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = "";
  document.body.appendChild(a);
  a.click();
  a.remove();
}
const open = (href: string) => window.open(href, "_blank", "noopener,noreferrer");

export function CommandPalette() {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);

  const commands = useMemo<Cmd[]>(
    () => [
      { id: "top", group: "Jump to", label: "Top", run: () => scrollToId("top") },
      ...sections.map((s) => ({ id: s.id, group: "Jump to", label: s.label, run: () => scrollToId(s.id) })),
      {
        id: "cv-ml",
        group: "Resumes",
        label: profile.resumes.aiml.long,
        hint: "PDF",
        run: () => {
          onResumeDownload("aiml");
          download(profile.resumes.aiml.href);
        },
      },
      {
        id: "cv-fs",
        group: "Resumes",
        label: profile.resumes.fullstack.long,
        hint: "PDF",
        run: () => {
          onResumeDownload("fullstack");
          download(profile.resumes.fullstack.href);
        },
      },
      { id: "gh", group: "Open", label: "GitHub", hint: "↗", run: () => open(social.github) },
      { id: "li", group: "Open", label: "LinkedIn", hint: "↗", run: () => open(social.linkedin) },
      { id: "lc", group: "Open", label: "LeetCode", hint: "↗", run: () => open(social.leetcode) },
      { id: "gfg", group: "Open", label: "GeeksforGeeks", hint: "↗", run: () => open(social.gfg) },
      {
        id: "copy",
        group: "Actions",
        label: "Copy email address",
        run: async () => toast((await copyText(profile.email)) ? `Copied ${profile.email}` : "Couldn't copy"),
      },
      { id: "mail", group: "Actions", label: "Write an email", run: () => (window.location.href = `mailto:${profile.email}`) },
      { id: "theme", group: "Actions", label: "Toggle light / dark theme", run: () => toggleTheme() },
      { id: "music", group: "Actions", label: "Toggle ambient music", run: () => emit(EVT.music) },
    ],
    [],
  );

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return commands;
    return commands.filter((c) => `${c.group} ${c.label}`.toLowerCase().includes(t));
  }, [q, commands]);

  const show = () => {
    if (!dialog.current || dialog.current.open) return;
    setQ("");
    setIdx(0);
    dialog.current.showModal();
    requestAnimationFrame(() => input.current?.focus());
  };
  const hide = () => dialog.current?.close();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (dialog.current?.open) hide();
        else show();
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(EVT.palette, show);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(EVT.palette, show);
    };
  }, []);

  useEffect(() => setIdx(0), [q]);

  const run = (c: Cmd) => {
    hide();
    // Let the dialog close before scrolling or opening tabs.
    setTimeout(() => c.run(), 10);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIdx((i) => (i + 1) % Math.max(1, results.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIdx((i) => (i - 1 + results.length) % Math.max(1, results.length));
    } else if (e.key === "Enter" && results[idx]) {
      e.preventDefault();
      run(results[idx]);
    }
  };

  useEffect(() => {
    document.getElementById(`cmd-${results[idx]?.id}`)?.scrollIntoView({ block: "nearest" });
  }, [idx, results]);

  let lastGroup = "";
  return (
    <dialog
      ref={dialog}
      onClick={(e) => e.target === dialog.current && hide()}
      aria-label="Command palette"
      className="mx-auto mt-[12vh] w-[min(38.75rem,calc(100vw-2rem))] overflow-hidden border border-line bg-bg-2 p-0"
    >
      <div className="flex items-center gap-3 border-b border-line px-4">
        <SearchIcon className="text-muted" />
        <input
          ref={input}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Jump to a section, grab a resume, open GitHub…"
          className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-muted"
          role="combobox"
          aria-expanded="true"
          aria-controls="cmd-list"
          aria-activedescendant={results[idx] ? `cmd-${results[idx].id}` : undefined}
          aria-label="Search commands"
        />
        <kbd className="t-mono muted border border-line px-1.5 py-0.5">Esc</kbd>
      </div>
      <ul id="cmd-list" role="listbox" className="max-h-[50vh] overflow-y-auto p-2">
        {results.length === 0 && <li className="p-4 font-mono text-sm text-muted">No match. Try &quot;resume&quot; or &quot;github&quot;.</li>}
        {results.map((c, i) => {
          const header = c.group !== lastGroup ? c.group : null;
          lastGroup = c.group;
          return (
            <li key={c.id} role="none">
              {header && <div className="t-mono muted px-3 pb-1 pt-3">{header}</div>}
              <div
                id={`cmd-${c.id}`}
                role="option"
                aria-selected={i === idx}
                onMouseMove={() => setIdx(i)}
                onClick={() => run(c)}
                className={`flex cursor-pointer items-center justify-between px-3 py-2.5 ${
                  i === idx ? "bg-accent text-on-accent" : ""
                }`}
              >
                <span>{c.label}</span>
                {c.hint && <span className="font-mono text-xs opacity-70">{c.hint}</span>}
              </div>
            </li>
          );
        })}
      </ul>
      <div className="t-mono muted flex gap-4 border-t border-line px-4 py-2.5">
        <span>↑↓ move</span>
        <span>↵ run</span>
        <span>esc close</span>
      </div>
    </dialog>
  );
}
