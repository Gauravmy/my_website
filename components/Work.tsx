import Image from "next/image";
import Link from "next/link";
import { projects, type Project, type Shot } from "@/data/projects";
import { ScreenerFigure } from "./Figures";
import { ArrowRight, ArrowUpRight, GitHubIcon } from "./Icons";
import { Reveal } from "./Reveal";
import { Lightbox, WorkControls } from "./WorkClient";

// Everything here renders on the server, so phones don't re-run it. The filter, the
// Fit Check ordering and the screenshot viewer are small islands in WorkClient.tsx.

export function ProjectLinks({ p, more = true }: { p: Project; more?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {more && (
        <Link href={`/work/${p.slug}`} className="btn btn-solid btn-sm">
          Case study
          <ArrowRight size={14} />
        </Link>
      )}
      {p.live && (
        <a href={p.live} target="_blank" rel="noopener noreferrer" className="btn btn-sm">
          {p.liveLabel ?? "Live"}
          <ArrowUpRight size={14} />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      )}
      <a href={p.github} target="_blank" rel="noopener noreferrer" className="btn btn-sm">
        <GitHubIcon size={14} />
        Code
        <span className="sr-only">for {p.title} on GitHub (opens in a new tab)</span>
      </a>
    </div>
  );
}

export function CodeFigure({ p }: { p: Project }) {
  const code = p.code!;
  return (
    <figure className="border border-line bg-[#0b0e1c] text-[#e6e3d8]">
      <figcaption className="t-mono flex justify-between border-b border-white/15 px-4 py-2 text-white/70">
        <span>{code.file}</span>
        <span>{code.lang}</span>
      </figcaption>
      <pre className="overflow-x-auto p-4 font-mono text-[0.78rem] leading-relaxed sm:text-[0.84rem]">
        <code>{code.source}</code>
      </pre>
    </figure>
  );
}

/** A screenshot with its figure caption. The viewer in WorkClient opens it by data attribute. */
function Fig({ p, shot, i, n, sizes }: { p: Project; shot: Shot; i: number; n: number; sizes: string }) {
  return (
    <figure>
      <Reveal wipe>
        <button type="button" data-view={`${p.slug}:${i}`} className="shot text-left">
          <Image src={shot.src} alt={shot.alt} width={shot.w} height={shot.h} sizes={sizes} />
          <span className="sr-only">Enlarge</span>
        </button>
      </Reveal>
      <figcaption className="t-mono muted mt-1.5">
        Fig. {n}
        {"abcde"[i]}. {shot.caption}
      </figcaption>
    </figure>
  );
}

function Results({ p }: { p: Project }) {
  if (!p.results.length) return null;
  return (
    <dl className="flex flex-wrap gap-x-6 gap-y-3">
      {p.results.map((r, i) => (
        <div key={r.label} className="flex flex-[1_1_8rem] flex-col gap-1 border-t border-line pt-2">
          <dt className="t-mono muted order-2">{r.label}</dt>
          <dd className="t-stat order-1 whitespace-nowrap !text-[min(clamp(1.4rem,1.2rem+0.8vw,2.1rem),10vw)]">{i === 0 ? <span className="mark">{r.value}</span> : r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Copy({ p }: { p: Project }) {
  return (
    <>
      <p className="t-read">{p.problem}</p>
      <ul className="mt-4 space-y-2 text-[0.96rem] leading-snug">
        {p.bullets.map((b) => (
          <li key={b} className="muted border-l-2 border-line pl-3">
            {b}
          </li>
        ))}
      </ul>
      <p className="t-mono muted mt-4">{p.stack.join(" / ")}</p>
      {p.note && <p className="muted mt-3 font-serif text-[0.98rem] italic leading-snug">{p.note}</p>}
      <div className="mt-5">
        <ProjectLinks p={p} />
      </div>
    </>
  );
}

function Head({ p, n }: { p: Project; n: number }) {
  return (
    <header className="grid items-end gap-x-8 gap-y-2 border-t border-fg pt-3 xl:grid-cols-12">
      <div className="xl:col-span-7">
        <p className="t-mono muted">
          {String(n).padStart(2, "0")} · {p.tags.join(" + ")}
        </p>
        <h3 className="t-display mt-2 !text-[clamp(2.05rem,1.3rem+3.8vw,5rem)]">
          <Link href={`/work/${p.slug}`} className="inline-block min-h-11 hover:underline hover:decoration-[0.06em] hover:underline-offset-[0.1em]">
            {p.title}
          </Link>
        </h3>
        <p className="t-h4 muted mt-1 !font-medium">{p.subtitle}</p>
      </div>
      <div className="mt-2 xl:col-span-5 xl:mt-0">
        <Results p={p} />
      </div>
    </header>
  );
}

/** Three hand-set compositions, so the page doesn't read as one card repeated. */
function Block({ p, n }: { p: Project; n: number }) {
  const s = p.shots;
  const v = (n - 1) % 3;
  const small = (i: number) => s?.[i] && <Fig p={p} shot={s[i]} i={i} n={n} sizes="(min-width: 1024px) 30vw, 50vw" />;
  const main = s && <Fig p={p} shot={s[0]} i={0} n={n} sizes="(min-width: 1024px) 66vw, 100vw" />;

  let body;
  if (p.figure === "screener") {
    body = (
      <div className="mt-6 grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <ScreenerFigure />
        </div>
        <div className="lg:col-span-5">
          <Copy p={p} />
        </div>
      </div>
    );
  } else if (p.code || !s) {
    body = (
      <div className="mt-6 grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Copy p={p} />
        </div>
        <div className="min-w-0 lg:col-span-7">{p.code && <CodeFigure p={p} />}</div>
      </div>
    );
  } else if (v === 0) {
    // Large image with two stacked beside it, text below on the right.
    body = (
      <div className="mt-6 grid gap-x-5 gap-y-6 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-8">{main}</div>
        <div className="grid min-w-0 grid-cols-2 gap-5 self-start lg:col-span-4 lg:grid-cols-1">
          {small(1)}
          {small(2)}
        </div>
        <div className="hidden lg:col-span-4 lg:block" />
        <div className="lg:col-span-8">
          <Copy p={p} />
        </div>
      </div>
    );
  } else if (v === 1) {
    // Text column on the left, images step down on the right.
    body = (
      <div className="mt-6 grid gap-x-8 gap-y-6 lg:grid-cols-12">
        <div className="lg:sticky lg:top-20 lg:col-span-4 lg:self-start">
          <Copy p={p} />
        </div>
        <div className="min-w-0 lg:col-span-8">
          {main}
          <div className="mt-5 grid grid-cols-2 gap-5">
            {small(1)}
            {small(2)}
          </div>
        </div>
      </div>
    );
  } else {
    // Images in a row; the first is wider.
    body = (
      <div className="mt-6 grid gap-x-5 gap-y-6 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-7">{main}</div>
        <div className="min-w-0 lg:col-span-5">
          {small(1)}
          <div className="mt-6">
            <Copy p={p} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <article id={`work-${p.slug}`} data-project={p.slug} data-tags={p.tags.join(",")} className="lazy-block scroll-mt-20">
      <Head p={p} n={n} />
      {body}
    </article>
  );
}

export function Work() {
  return (
    <section id="work" aria-labelledby="work-title" className="sheet">
      <div className="wrap py-16 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div>
            <h2 id="work-title" className="t-h2">
              Selected work
            </h2>
            <p className="t-read muted mt-2 max-w-2xl">Screens from the real apps and numbers from real runs, including the ones that didn&apos;t flatter me.</p>
          </div>
          <WorkControls />
        </div>

        <div id="work-list" className="mt-10 space-y-20 md:mt-14 md:space-y-28">
          {projects.map((p, i) => (
            <Block key={p.slug} p={p} n={i + 1} />
          ))}
        </div>
      </div>
      <Lightbox />
    </section>
  );
}
