import results from "@/data/screener-results.json";
import sku from "@/data/stockwise-sku1001.json";

const pretty = (s: string) => (s === "HR" ? "HR" : s.replace(/-/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase()));

/** Real output: how often the repo's TF-IDF scorer put the right job category in its top 10. */
export function ScreenerFigure() {
  const total = results.runs.reduce((n, r) => n + r.hits, 0);
  return (
    <figure className="border border-line bg-bg-2 p-5 sm:p-7">
      <figcaption className="t-h4">
        Top-10 resumes in the right job category: <span className="mark">{total} of {results.runs.length * 10}</span>
      </figcaption>
      <p className="t-mono muted mt-1">
        TF-IDF scorer from the repo, {results.resumes.toLocaleString("en-US")} resumes, {results.categories} categories. One job description per row.
      </p>
      <ul className="mt-6 space-y-3">
        {results.runs.map((r) => (
          <li key={r.expected} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 sm:grid-cols-[9.5rem_1fr_auto]">
            <span className="text-sm">{pretty(r.expected)}</span>
            <span className="order-3 col-span-2 grid grid-cols-10 gap-0.5 sm:order-none sm:col-span-1" aria-hidden>
              {Array.from({ length: 10 }).map((_, i) => (
                <span key={i} className={`h-5 ${i < r.hits ? "bg-accent" : "bg-line"}`} />
              ))}
            </span>
            <span className="t-mono w-10 text-right">{r.hits}/10</span>
          </li>
        ))}
      </ul>
      <p className="t-mono muted mt-5">Measured while building this site. I wrote the six job descriptions for this test.</p>
    </figure>
  );
}

/** The holdout chart as plain SVG, for anyone without WebGL. */
export function HoldoutFigure() {
  const W = 640;
  const H = 280;
  const all = [...sku.actual, ...sku.baseline, ...sku.rf];
  const min = Math.min(...all) * 0.85;
  const max = Math.max(...all) * 1.05;
  const x = (i: number) => (i / (sku.actual.length - 1)) * W;
  const y = (v: number) => H - ((v - min) / (max - min)) * H;
  const path = (v: number[]) => v.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(p).toFixed(1)}`).join("");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Actual demand against random forest and baseline forecasts on 28 holdout days">
      <path d={path(sku.baseline)} fill="none" stroke="#8f98de" strokeWidth="2" strokeDasharray="6 6" />
      <path d={path(sku.actual)} fill="none" stroke="#f2eee3" strokeWidth="2" />
      <path d={path(sku.rf)} fill="none" stroke="#d7f24a" strokeWidth="2.5" />
    </svg>
  );
}
