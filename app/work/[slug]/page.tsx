import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ScreenerFigure } from "@/components/Figures";
import { Footer } from "@/components/Footer";
import { ArrowLeft, ArrowRight } from "@/components/Icons";
import { Nav } from "@/components/Nav";
import { Reveal } from "@/components/Reveal";
import { RevealObserver } from "@/components/RevealObserver";
import { Widgets } from "@/components/Widgets";
import { CodeFigure, ProjectLinks } from "@/components/Work";
import { getProject, projects } from "@/data/projects";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  return {
    title: p.title,
    description: `${p.title}: ${p.subtitle}. ${p.problem}`,
    alternates: { canonical: `/work/${p.slug}` },
  };
}

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="t-mono muted md:col-span-3">{children}</h2>;
}

export default async function CaseStudy({ params }: Params) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();
  const i = projects.indexOf(p);
  const next = projects[(i + 1) % projects.length];
  const row = "grid gap-x-8 gap-y-3 border-t border-line py-7 md:grid-cols-12";

  return (
    <>
      <Nav />
      <main id="main">
        <header className="on-blue pt-14">
          <div className="wrap pb-8 pt-8 md:pb-12 md:pt-14">
            <Link href="/#work" className="t-mono link tap gap-1.5">
              <ArrowLeft size={14} /> All work
            </Link>
            <h1 className="t-display mt-6 !text-[clamp(2.15rem,0.6rem+9vw,8rem)]">{p.title}</h1>
            <p className="t-lead mt-3 max-w-3xl">{p.subtitle}</p>
            <div className="mt-6">
              <ProjectLinks p={p} more={false} />
            </div>
          </div>
        </header>

        <div className="wrap py-10 md:py-14">
          {p.results.length > 0 && (
            <dl className="mb-10 grid gap-x-8 gap-y-4 sm:grid-cols-3">
              {p.results.map((r, k) => (
                <div key={r.label} className="flex flex-col-reverse gap-1 border-t border-fg pt-2">
                  <dt className="t-mono muted">{r.label}</dt>
                  <dd className="t-stat">{k === 0 ? <span className="mark">{r.value}</span> : r.value}</dd>
                </div>
              ))}
            </dl>
          )}

          {p.shots && (
            <Reveal wipe>
              <figure>
                <span className="shot">
                  <Image src={p.shots[0].src} alt={p.shots[0].alt} width={p.shots[0].w} height={p.shots[0].h} sizes="100vw" priority />
                </span>
                <figcaption className="t-mono muted mt-1.5">Fig. 1. {p.shots[0].caption}</figcaption>
              </figure>
            </Reveal>
          )}
          {p.figure === "screener" && <ScreenerFigure />}
          {p.code && <CodeFigure p={p} />}

          <div className="mt-10">
            <section className={row}>
              <H>The problem</H>
              <p className="t-lead md:col-span-8">{p.problem}</p>
            </section>
            <section className={row}>
              <H>What I built</H>
              <ul className="t-read space-y-3 md:col-span-8">
                {p.built.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </section>
            {p.table && (
              <section className={row}>
                <H>Results</H>
                <div className="min-w-0 md:col-span-9">
                  <div className="no-scrollbar overflow-x-auto" tabIndex={0} role="region" aria-label="Results table, scrollable">
                    <table className="w-full min-w-[620px] border-collapse text-[0.95rem]">
                      <caption className="t-mono muted mb-2 text-left">{p.table.caption}</caption>
                      <thead>
                        <tr className="border-b border-fg text-left">
                          {p.table.head.map((h) => (
                            <th key={h} scope="col" className="py-1.5 pr-4 font-semibold">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {p.table.rows.map((r) => (
                          <tr key={r[0]} className="border-b border-line">
                            {r.map((c, k) => (
                              <td key={k} className={`py-1.5 pr-4 ${k === 0 ? "font-semibold" : k === r.length - 1 ? "" : "font-mono text-[0.84rem]"}`}>
                                {k === r.length - 1 && c.startsWith("Moving") ? <span className="mark">{c}</span> : c}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {p.slug === "stockwise" && <p className="t-read mt-3">The highlighted rows are where the baseline won. A more complex model isn&apos;t automatically better.</p>}
                </div>
              </section>
            )}
            {p.decisions && (
              <section className={row}>
                <H>Decisions</H>
                <div className="space-y-5 md:col-span-8">
                  {p.decisions.map((d) => (
                    <div key={d.title}>
                      <h3 className="t-h4 !text-[1.25rem]">{d.title}</h3>
                      <p className="t-read mt-1">{d.body}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
            {p.limits && (
              <section className={row}>
                <H>What it doesn&apos;t do</H>
                <ul className="t-read muted space-y-2 md:col-span-8">
                  {p.limits.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
              </section>
            )}
            <section className={row}>
              <H>Stack</H>
              <p className="flex flex-wrap gap-1.5 md:col-span-8">
                {p.stack.map((s) => (
                  <span key={s} className="tag">
                    {s}
                  </span>
                ))}
              </p>
            </section>
            {p.note && (
              <section className={row}>
                <H>Note</H>
                <p className="t-read md:col-span-8">{p.note}</p>
              </section>
            )}
          </div>

          {p.shots && p.shots.length > 1 && (
            <div className="mt-6 grid gap-x-5 gap-y-8 md:grid-cols-2">
              {p.shots.slice(1).map((s, k) => (
                <Reveal key={s.src} wipe>
                  <figure>
                    <span className="shot">
                      <Image src={s.src} alt={s.alt} width={s.w} height={s.h} sizes="(min-width: 768px) 50vw, 100vw" />
                    </span>
                    <figcaption className="t-mono muted mt-1.5">
                      Fig. {k + 2}. {s.caption}
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          )}
        </div>

        <Link href={`/work/${next.slug}`} className="on-blue group block">
          <span className="wrap flex items-end justify-between gap-6 py-10 md:py-16">
            <span className="min-w-0">
              <span className="t-mono text-on-blue-2 block">Next project</span>
              <span className="t-display mt-2 block !text-[clamp(2rem,1.2rem+4vw,6rem)] group-hover:text-acid">{next.title}</span>
            </span>
            <ArrowRight size={40} className="mb-2 hidden shrink-0 transition-transform group-hover:translate-x-1 group-hover:text-acid min-[360px]:block" />
          </span>
        </Link>
      </main>
      <Footer />
      <RevealObserver />
      <Widgets />
    </>
  );
}
