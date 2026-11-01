import Image from "next/image";
import type { ComponentType, SVGProps } from "react";
import { profileLinks, statsCheckedOn, type ProfileLink } from "@/data/links";
import { certifications, contributions } from "@/data/misc";
import { profile } from "@/data/profile";
import { ArrowUpRight, GfgIcon, GitHubIcon, LeetCodeIcon, LinkedInIcon } from "./Icons";
import { Reveal } from "./Reveal";

type IconT = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;
const icons: Record<ProfileLink["id"], { Icon: IconT; color: string }> = {
  github: { Icon: GitHubIcon, color: "bg-fg text-bg" },
  linkedin: { Icon: LinkedInIcon, color: "bg-[#0a66c2] text-white" },
  leetcode: { Icon: LeetCodeIcon, color: "bg-[#ffa116] text-[#1a1a1a]" },
  gfg: { Icon: GfgIcon, color: "bg-[#2f8d46] text-white" },
};

function Picture({ p }: { p: ProfileLink }) {
  if (p.image) {
    return (
      <span className="shot">
        <Image src={p.image} alt={`${p.label} profile page of ${profile.name}`} width={1200} height={750} sizes="(min-width: 1024px) 45vw, 100vw" />
      </span>
    );
  }
  // LinkedIn doesn't show profiles to logged-out visitors, so that one can't be a screenshot.
  const panel = p.id === "gfg" ? "bg-[#1f7337]" : "bg-[#0a66c2]";
  return (
    <span className={`grid aspect-[8/5] place-items-center border border-line p-4 text-white sm:p-6 ${panel}`}>
      <span className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
        <Image src="/profiles/avatar.webp" alt={`Photo of ${profile.name}`} width={154} height={154} className="h-[clamp(5rem,9vw,10rem)] w-[clamp(5rem,9vw,10rem)] object-cover" />
        <span className="min-w-0">
          <span className="block text-[clamp(1.4rem,1rem+1.6vw,3.2rem)] font-bold leading-tight tracking-tight">{profile.name}</span>
          <span className="mt-1 block text-[clamp(0.95rem,0.7rem+0.5vw,1.35rem)] text-white/90">{profile.title}</span>
          <span className="t-mono mt-2 block text-white/90">{p.id === "gfg" ? "Coding score 1700" : profile.location}</span>
        </span>
      </span>
    </span>
  );
}

export function Profiles() {
  return (
    <section id="profiles" aria-labelledby="profiles-title" className="sheet lazy-block border-t border-line">
      <div className="wrap py-16 md:py-24">
        <h2 id="profiles-title" className="t-h2">
          Coding profiles
        </h2>
        <p className="t-read muted mt-2 max-w-2xl">Screens of the real pages. Numbers checked in {statsCheckedOn}; click through for today&apos;s.</p>

        <ul className="mt-10 grid gap-x-6 gap-y-12 md:grid-cols-2">
          {profileLinks.map((p, i) => {
            const { Icon, color } = icons[p.id];
            return (
              <li key={p.id} className={i % 2 === 1 ? "md:mt-16" : ""}>
                <Reveal wipe>
                  <a href={p.href} target="_blank" rel="noopener noreferrer" className="group block">
                    <Picture p={p} />
                    <span className="mt-3 flex items-center gap-3">
                      <span className={`grid h-11 w-11 shrink-0 place-items-center ${color}`} aria-hidden>
                        <Icon size={24} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="t-h4 block !text-[1.3rem] group-hover:underline">{p.label}</span>
                        <span className="t-mono muted block truncate">{p.handle}</span>
                      </span>
                      <ArrowUpRight size={20} className="shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </Reveal>
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-2 sm:grid-cols-3">
                  {p.stats.map((s) => (
                    <div key={s.label} className="flex flex-col gap-0.5">
                      <dt className="t-mono muted order-2">{s.label}</dt>
                      <dd className="order-1 text-[clamp(1.25rem,1.1rem+0.7vw,1.75rem)] font-extrabold tracking-[-0.03em]">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </li>
            );
          })}
        </ul>

        <div className="mt-20 grid gap-x-8 gap-y-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h3 className="t-h3">Open-source pull requests</h3>
            <p className="t-read muted mt-1">Reading other people&apos;s code, and sending fixes upstream. Status as shown on GitHub.</p>
            <ul className="mt-5 border-b border-line">
              {contributions.map((c) => (
                <li key={c.href} className="border-t border-line">
                  <a href={c.href} target="_blank" rel="noopener noreferrer" className="group grid items-baseline gap-x-4 gap-y-0.5 py-3 sm:grid-cols-[9rem_1fr_auto]">
                    <span className="font-semibold">{c.project}</span>
                    <span className="muted text-[0.95rem] leading-snug group-hover:text-fg">
                      {c.title} <span className="t-mono whitespace-nowrap">#{c.number}</span>
                    </span>
                    <span className="t-mono muted inline-flex items-center gap-1 whitespace-nowrap">
                      {c.status === "In review" ? <span className="mark text-[0.78rem]">In review</span> : c.status}
                      <ArrowUpRight size={13} />
                    </span>
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-5">
            <h3 className="t-h3">Certifications</h3>
            <ul className="mt-5 border-b border-line lg:mt-[3.6rem]">
              {certifications.map((c) => (
                <li key={c.name} className="flex flex-wrap items-baseline justify-between gap-x-4 border-t border-line py-3">
                  {c.href ? (
                    <a href={c.href} target="_blank" rel="noopener noreferrer" className="link font-semibold">
                      {c.name}
                    </a>
                  ) : (
                    <span className="font-semibold">{c.name}</span>
                  )}
                  <span className="t-mono muted">{c.issuer}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
