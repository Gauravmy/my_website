import { profile } from "@/data/profile";
import { Reveal } from "./Reveal";

const facts: [string, string][] = [
  ["Degree", "B.Tech CSE, AI & ML major"],
  ["University", "Sanskriti University, Mathura"],
  ["Graduating", "June 2027"],
  ["CGPA", "8.50 / 10"],
  ["Leadership", "President, Technical Club"],
  ["Teaching", "300+ students, 15+ workshops"],
];

export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="sheet border-t border-line">
      <div className="wrap grid gap-x-10 gap-y-8 py-16 md:py-24 lg:grid-cols-12">
        <Reveal className="lg:col-span-7">
          <h2 id="about-title" className="t-mono muted">
            About
          </h2>
          <p className="t-lead mt-3 !text-[clamp(1.6rem,1.2rem+1.6vw,2.75rem)] !leading-[1.14]">{profile.about[0]}</p>
          <p className="t-read muted mt-5 max-w-2xl">{profile.about[1]}</p>
        </Reveal>
        <Reveal delay={0.06} className="lg:col-span-4 lg:col-start-9">
          <dl className="border-b border-line">
            {facts.map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-6 border-t border-line py-2.5">
                <dt className="t-mono muted">{k}</dt>
                <dd className="text-right text-[0.95rem] font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
