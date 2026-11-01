/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { HoldoutFigure } from "./Figures";
import { ArrowUpRight } from "./Icons";

const steps = [
  {
    n: "1",
    title: "Start with the data, not the model.",
    body: "Before anything trains, a CSV goes through a dry run: ISO dates only, no future dates, no negative quantities, same-day rows summed, and every rejected row listed by line number with the reason.",
    fig: "Every dot is one day of sales for SKU-1001. 547 days, synthetic sample data.",
  },
  {
    n: "2",
    title: "Beat a baseline, or ship the baseline.",
    body: "On a 28-day holdout, random forest got an MAE of 4.13 against the moving average's 6.57. But across seven products the baseline won three times. So the app picks per product, and says why.",
    fig: "Actual demand in white, the baseline dashed, random forest in yellow. These are the real 28 holdout days.",
  },
  {
    n: "3",
    title: "Then make it hard to break.",
    body: "94 backend tests and 11 frontend tests. With fewer than 14 days of history it refuses to forecast. From 14 to 55 days it falls back to a low-confidence estimate, with no metrics to hide behind.",
    fig: "One square per test: 94 backend, 11 frontend.",
  },
  {
    n: "4",
    title: "Ship it so someone can act on it.",
    body: "FastAPI, Next.js, five pages. Reorder point, order quantity, days until stockout, and a plain-language explanation of each recommendation.",
    fig: "The points resolve into the real forecasting page.",
  },
];

/**
 * "How I work": one real project, start to finish. On a WebGL device the points on the right form each
 * figure from the project's actual numbers as you scroll (see gl/Stage.tsx).
 */
export function Process() {
  return (
    <section id="process" data-blue aria-labelledby="process-title" className="on-blue-clear relative z-[1]">
      <div className="wrap process-head pt-20 md:pt-28">
        <p className="t-mono text-on-blue-2">How I work, using one real project: StockWise AI</p>
        <h2 id="process-title" className="t-display mt-3 max-w-[14ch]">
          Four habits, shown with real numbers.
        </h2>
      </div>
      <div className="wrap grid gap-x-12 lg:grid-cols-12">
        <ol className="relative z-[2] lg:col-span-5">
          {steps.map((s) => (
            <li key={s.n} data-step className="process-step">
              <div>
                <p className="t-mono text-acid">Habit {s.n}</p>
                <h3 className="t-h3 mt-2">{s.title}</h3>
                <p className="t-read mt-3">{s.body}</p>
                {/* Figure text lives here on small screens, where the scene sits above. */}
                <p className="t-mono text-on-blue-2 mt-4 lg:hidden">{s.fig}</p>
                {s.n === "2" && (
                  <div className="process-fallback mt-5">
                    <HoldoutFigure />
                  </div>
                )}
                {s.n === "4" && (
                  <Link href="/work/stockwise" className="btn btn-solid mt-5">
                    Read the case study
                    <ArrowUpRight size={16} />
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ol>

        <div className="pointer-events-none lg:col-span-7" aria-hidden>
          <div id="gl-region" className="gl-region">
            {/* The real screenshot fades in over the points at the end. */}
            <img
              id="process-shot"
              src="/projects/stockwise/2.webp"
              alt=""
              loading="lazy"
              className="absolute inset-0 m-auto max-h-full w-full border border-line-blue object-contain opacity-0 transition-opacity duration-500"
            />
            {steps.map((s, i) => (
              <p
                key={s.n}
                data-legend={i}
                className="t-mono absolute inset-x-0 bottom-0 hidden text-on-blue-2 opacity-0 transition-opacity duration-300 lg:block"
              >
                Fig. {s.n}. {s.fig}
              </p>
            ))}
          </div>
        </div>
      </div>
      <div className="h-20" />
    </section>
  );
}
