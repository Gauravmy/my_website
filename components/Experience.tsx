import { timeline } from "@/data/timeline";
import { ArrowUpRight } from "./Icons";
import { Reveal } from "./Reveal";

const years = Array.from(new Set(timeline.map((t) => t.year)));

/** A vertical CV: the year stays pinned while its roles scroll past. */
export function Experience() {
  return (
    <section id="experience" aria-labelledby="experience-title" className="sheet lazy-block border-t border-line">
      <div className="wrap py-16 md:py-24">
        <h2 id="experience-title" className="t-h2">
          Experience
        </h2>
        <p className="t-read muted mt-2 max-w-2xl">Six internships since 2025 across computer vision, NLP and machine learning, plus a teaching community I co-founded.</p>

        <div className="mt-10 md:mt-14">
          {years.map((year) => (
            <div key={year} className="grid gap-x-8 border-t border-fg pt-3 pb-10 md:grid-cols-12">
              <div className="md:col-span-3">
                <p className="t-stat md:sticky md:top-20">{year === "2023" ? "2023 →" : year}</p>
              </div>
              <ol className="md:col-span-9">
                {timeline
                  .filter((t) => t.year === year)
                  .map((t) => (
                    <li key={t.role + t.org} className="border-t border-line py-4 first:border-t-0 first:pt-3 md:first:pt-1">
                      <Reveal className="grid gap-x-8 gap-y-2 lg:grid-cols-9">
                        <div className="lg:col-span-4">
                          <h3 className="t-h4 !text-[1.25rem]">{t.role}</h3>
                          <p className="muted">{t.org}</p>
                          <p className="t-mono muted mt-1">{t.period}</p>
                        </div>
                        <div className="lg:col-span-5">
                          <ul className="t-read !text-[1.05rem] space-y-1">
                            {t.details.map((d) => (
                              <li key={d}>{d}</li>
                            ))}
                          </ul>
                          <p className="mt-2 flex flex-wrap items-center gap-3">
                            {t.metric && <span className="mark font-bold tracking-tight">{t.metric}</span>}
                            {t.link && (
                              <a href={t.link.href} target="_blank" rel="noopener noreferrer" className="link tap gap-1 text-sm font-semibold">
                                {t.link.label} <ArrowUpRight size={13} />
                                <span className="sr-only">(opens in a new tab)</span>
                              </a>
                            )}
                          </p>
                        </div>
                      </Reveal>
                    </li>
                  ))}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
