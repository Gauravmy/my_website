import { profile, proof } from "@/data/profile";
import { ArrowDownIcon } from "./Icons";
import { ResumeLink } from "./ResumeLinks";
import { SocialLinks } from "./SocialLinks";

export function Hero() {
  return (
    <>
      <section id="top" aria-label="Introduction" data-blue className="on-blue-clear relative z-[1]">
        <div className="hero-inner">
          {/* Live readout from the WebGL opening; filled in by Stage.tsx. */}
          <div id="gl-readout" aria-hidden className="mb-3 max-w-2xl overflow-hidden">
            <p data-text className="t-mono whitespace-nowrap text-on-blue-2">
              &nbsp;
            </p>
            <div className="readout-bar mt-1.5">
              <i />
            </div>
          </div>

          <h1 id="hero-name" className="hero-name">
            <span className="line">{profile.firstName}</span> <span className="line">{profile.lastName}</span>
          </h1>

          <div className="hero-rest hero-grid">
            <p className="hero-lead t-lead">{profile.heroLine}</p>

            <div className="hero-actions">
              <ResumeLink type="aiml" solid />
              <ResumeLink type="fullstack" />
              <a href="#fit" className="btn hero-fit">
                Check my fit for a role
                <ArrowDownIcon size={16} />
              </a>
            </div>

            <div className="hero-facts t-mono text-on-blue-2">
              <p className="text-on-blue">AI/ML Engineer &amp; Full-Stack Developer</p>
              <p className="mt-1.5">
                {profile.education.year} B.Tech CSE (AI &amp; ML)
                <br />
                Sanskriti University · CGPA {profile.education.cgpa}
                <br />
                {profile.location}
              </p>
              <p className="mt-1.5 text-acid">{profile.status}</p>
            </div>
          </div>
          <SocialLinks className="hero-rest mt-3 -ml-2.5" dark />
        </div>
      </section>

      {/* The evidence strip. Every number jumps to where it comes from. */}
      <section aria-label="Results at a glance" className="sheet border-b border-line">
        <ul className="page grid grid-cols-2 gap-px bg-line md:grid-cols-3 xl:grid-cols-6">
          {proof.map((p) => (
            <li key={p.value} className="bg-bg">
              <a href={p.href} className="group flex h-full flex-col justify-between gap-4 p-3 transition-colors hover:bg-bg-2 min-[360px]:p-4 sm:gap-5 sm:p-5">
                <span className="t-mono muted">{p.label}</span>
                <span className="t-stat whitespace-nowrap !text-[clamp(1.15rem,0.65rem+2.5vw,2.4rem)] md:!text-[clamp(1.45rem,1.05rem+1.05vw,2.4rem)]">
                  <span className="mark-swipe">{p.value}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
