import Link from "next/link";
import { sections } from "@/data/misc";
import { profile } from "@/data/profile";
import { SocialLinks } from "./SocialLinks";

export function Footer() {
  return (
    <footer className="sheet border-t border-line">
      <div className="wrap grid gap-x-8 gap-y-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-8 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="font-bold tracking-tight">{profile.name}</p>
          <p className="muted text-sm">{profile.title}</p>
          <SocialLinks className="mt-3 -ml-2.5" />
        </div>
        <nav aria-label="Footer" className="md:col-span-3">
          <ul className="grid grid-cols-2 gap-x-6 text-sm">
            {sections.map((s) => (
              <li key={s.id}>
                <Link href={`/#${s.id}`} className="tap muted transition-colors hover:text-fg">
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="t-mono muted md:col-span-4">
          <p>
            Set in Schibsted Grotesk, Newsreader and IBM Plex Mono. The opening is real gradient descent, drawn with three.js.
            <span className="kbd-hint">
              {" "}
              Press <kbd className="border border-line px-1">Ctrl K</kbd> to get around.
            </span>
          </p>
          <p className="mt-2">© {new Date().getFullYear()} {profile.name}</p>
        </div>
      </div>
    </footer>
  );
}
