"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { sections } from "@/data/misc";
import { profile, type ResumeType } from "@/data/profile";
import { onResumeDownload } from "@/lib/analytics";
import { EVT, emit } from "@/lib/client";
import { ChevronDown, CloseIcon, DownloadIcon, MenuIcon, SearchIcon } from "./Icons";
import { ResumeLink } from "./ResumeLinks";
import { SocialLinks } from "./SocialLinks";
import { ThemeToggle } from "./ThemeToggle";

const primary = ["work", "process", "experience", "skills", "profiles", "contact"];
const navLinks = sections.filter((s) => primary.includes(s.id));

/** Both resumes behind one button, each with a one-line note on when to pick it. */
function ResumeMenu({ onBlue }: { onBlue: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls="resume-menu"
        className={`nav-btn !inline-flex items-center gap-1.5 border px-2.5 text-sm font-semibold transition-colors ${
          onBlue ? "border-acid bg-acid text-on-acid hover:bg-on-blue hover:border-on-blue" : "border-accent bg-accent text-on-accent"
        }`}
      >
        Resume <ChevronDown size={15} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div id="resume-menu" className="absolute right-0 top-full z-50 mt-1 w-72 border border-fg bg-bg text-fg">
          <p className="t-mono muted px-3 pb-1 pt-2.5">Which one should I pick?</p>
          {(["aiml", "fullstack"] as ResumeType[]).map((t) => {
            const r = profile.resumes[t];
            return (
              <a
                key={t}
                href={r.href}
                download
                onClick={() => {
                  onResumeDownload(t);
                  setOpen(false);
                }}
                className="flex items-start gap-3 border-t border-line p-3 transition-colors hover:bg-bg-2"
              >
                <DownloadIcon size={16} className="mt-0.5 shrink-0" />
                <span>
                  <span className="block text-sm font-semibold">{r.long}</span>
                  <span className="block text-xs leading-snug text-muted">{r.hint}</span>
                </span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Nav() {
  const pathname = usePathname();
  const home = pathname === "/";
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  const [onBlue, setOnBlue] = useState(home);
  const hash = (id: string) => (home ? `#${id}` : `/#${id}`);

  useEffect(() => {
    if (!home) {
      setOnBlue(false);
      return;
    }
    // The bar takes the colour of whatever section is directly under it.
    const update = () => {
      const blue = Array.from(document.querySelectorAll("[data-blue]"));
      setOnBlue(
        blue.some((el) => {
          const b = el.getBoundingClientRect();
          return b.top <= 32 && b.bottom > 32;
        }),
      );
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const io = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)), {
      rootMargin: "-45% 0px -50% 0px",
    });
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      io.disconnect();
    };
  }, [home]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={`site-nav fixed inset-x-0 top-0 z-50 border-b transition-colors duration-200 ${
        onBlue ? "border-line-blue bg-blue text-on-blue" : "border-line bg-bg text-fg"
      }`}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:bg-acid focus:px-3 focus:py-2 focus:text-on-acid"
      >
        Skip to content
      </a>
      <div className="page flex h-14 items-center gap-4 px-[var(--pad)]">
        <Link href="/" className="tap min-w-0 text-[0.98rem] font-bold tracking-tight">
          Gaurav Dhakad
        </Link>

        <nav aria-label="Primary" className="mx-auto hidden lg:block">
          <ul className="flex items-center gap-5">
            {navLinks.map((s) => (
              <li key={s.id}>
                <Link
                  href={hash(s.id)}
                  aria-current={active === s.id ? "true" : undefined}
                  className={`tap whitespace-nowrap text-sm font-medium transition-opacity hover:opacity-100 ${active === s.id ? "opacity-100 underline underline-offset-4" : "opacity-80"}`}
                >
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1.5 lg:ml-0">
          <button onClick={() => emit(EVT.palette)} className="nav-btn !hidden items-center gap-1.5 px-2 text-sm font-medium opacity-80 hover:opacity-100 md:!inline-flex" title="Command palette">
            <SearchIcon size={16} />
            <kbd className="kbd-hint t-mono whitespace-nowrap">Ctrl K</kbd>
            <span className="sr-only">Open command palette</span>
          </button>
          <ThemeToggle />
          <div className="hidden sm:block">
            <ResumeMenu onBlue={onBlue} />
          </div>
          <button className="nav-btn lg:!hidden" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open} aria-controls="mobile-menu">
            <MenuIcon />
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu" className="on-blue fixed inset-0 z-[60] flex h-[100dvh] flex-col overflow-y-auto px-[var(--pad)] pb-8">
          <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between bg-blue pb-1 pt-3">
            <span className="font-bold tracking-tight">Gaurav Dhakad</span>
            <button autoFocus onClick={() => setOpen(false)} className="nav-btn" aria-label="Close menu">
              <CloseIcon />
            </button>
          </div>
          <ul className="mt-6 flex flex-col border-t border-line-blue">
            {sections.map((s) => (
              <li key={s.id} className="border-b border-line-blue">
                <Link href={hash(s.id)} onClick={() => setOpen(false)} className="block py-3 text-[clamp(1.4rem,1rem+2.4vh,1.875rem)] font-bold tracking-tight">
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col gap-2">
            <ResumeLink type="aiml" solid long />
            <ResumeLink type="fullstack" long />
          </div>
          <SocialLinks className="mt-5 -ml-2.5" dark />
        </div>
      )}
    </header>
  );
}
