"use client";

import { useMemo, useState } from "react";
import { profile } from "@/data/profile";
import { SAMPLES, fitStore, runFit } from "@/lib/fit";
import { ArrowDownIcon } from "./Icons";
import { ResumeLink } from "./ResumeLinks";

/**
 * Paste a job description; my work is ranked against it with TF-IDF, in the browser.
 * The ranking also reorders the Work section below.
 */
export function FitCheck() {
  const [sample, setSample] = useState<string | null>(SAMPLES[0].id);
  const [text, setText] = useState(SAMPLES[0].text);
  const result = useMemo(() => runFit(text), [text]);
  const top = result.ranked.filter((r) => r.score > 0).slice(0, 4);
  const best = top[0]?.score || 1;
  const hasInput = result.words >= 5;

  const applyOrder = () => {
    const order = result.ranked.map((r) => r.slug);
    fitStore.set({ slugs: order, label: sample ? SAMPLES.find((s) => s.id === sample)!.label : "your job description" });
    document.getElementById("work")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  return (
    <section id="fit" aria-labelledby="fit-title" className="sheet border-b border-line">
      <div className="wrap py-16 md:py-24">
        <div className="grid gap-x-10 gap-y-5 lg:grid-cols-12">
          <h2 id="fit-title" className="t-h2 lg:col-span-7">
            Hiring? Paste the job description.
          </h2>
          <p className="t-read muted self-end lg:col-span-5">
            At my NLP internship I built a screener that ranks resumes against a job description. This is its TF-IDF idea, pointed at my own work. Your text
            stays in your browser.
          </p>
        </div>

        <div className="mt-10 grid gap-px border border-line bg-line lg:grid-cols-12">
          {/* Input */}
          <div className="flex flex-col bg-bg p-5 sm:p-7 lg:col-span-5">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <label htmlFor="jd" className="t-h4">
                Job description
              </label>
              <span className="t-mono muted">try:</span>
              <ul className="flex flex-wrap gap-x-3 gap-y-1">
                {SAMPLES.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      aria-pressed={sample === s.id}
                      onClick={() => {
                        setSample(s.id);
                        setText(s.text);
                      }}
                      className="tap text-sm font-medium"
                    >
                      <span className={sample === s.id ? "mark" : "link"}>{s.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <textarea
              id="jd"
              rows={11}
              value={text}
              onChange={(e) => {
                setSample(null);
                setText(e.target.value);
              }}
              placeholder="Paste the job description here…"
              className="field mt-4 flex-1 resize-y font-serif !text-[1.02rem] leading-relaxed"
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <p className="t-mono muted">{result.words} words · nothing is sent anywhere</p>
              {!sample && (
                <button
                  type="button"
                  className="t-mono link tap"
                  onClick={() => {
                    setText("");
                  }}
                >
                  clear
                </button>
              )}
            </div>
          </div>

          {/* Result */}
          <div className="bg-bg p-5 sm:p-7 lg:col-span-7" aria-live="polite">
            {!hasInput ? (
              <p className="t-read muted">Paste a few lines and the result appears here.</p>
            ) : (
              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <p className="t-mono muted">Skills it asks for that I can show</p>
                  {result.coverage === null ? (
                    <p className="t-read mt-2">
                      No technical skills I recognise in this text, so the ranking is by word overlap only.
                    </p>
                  ) : (
                    <p className="mt-1 font-extrabold tracking-[-0.04em] [font-size:clamp(3.5rem,3rem+3vw,6rem)] [line-height:1]">
                      <span className="mark">
                        {result.have.length}/{result.have.length + result.missing.length}
                      </span>
                    </p>
                  )}
                  {result.have.length > 0 && (
                    <ul className="mt-4 flex flex-wrap gap-1.5">
                      {result.have.map((s) => (
                        <li key={s.label} className="tag" title={s.where ? `Used in ${s.where}` : undefined}>
                          {s.label}
                        </li>
                      ))}
                    </ul>
                  )}
                  {result.missing.length > 0 && (
                    <p className="mt-4 text-sm">
                      <span className="muted">Not on my list yet: </span>
                      {result.missing.join(", ")}
                    </p>
                  )}
                </div>

                <div>
                  <p className="t-mono muted">My closest work, by TF-IDF similarity</p>
                  {top.length === 0 ? (
                    <p className="t-read mt-2">Nothing in my projects overlaps with this text.</p>
                  ) : (
                    <ol className="mt-3 space-y-3">
                      {top.map((r, i) => (
                        <li key={r.slug}>
                          <a href={`#work-${r.slug}`} className="group block min-h-11">
                            <span className="flex items-baseline justify-between gap-3">
                              <span className="font-semibold tracking-tight group-hover:underline">
                                <span className="t-mono muted mr-2">{i + 1}</span>
                                {r.title}
                              </span>
                              <span className="t-mono">{r.score.toFixed(2)}</span>
                            </span>
                            <span className="mt-1 block h-1.5 bg-bg-2">
                              <span className="block h-full bg-accent transition-[width] duration-500" style={{ width: `${Math.round((r.score / best) * 100)}%` }} />
                            </span>
                          </a>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>

                <div className="flex flex-wrap items-end justify-between gap-4 border-t border-line pt-5 md:col-span-2">
                  <div>
                    <p className="t-mono muted">Send this one: {result.resumeReason}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <ResumeLink type={result.resume} solid long />
                      <a href={`mailto:${profile.email}?subject=${encodeURIComponent("About a role")}`} className="btn">
                        Email me
                      </a>
                    </div>
                  </div>
                  {top.length > 0 && (
                    <button type="button" onClick={applyOrder} className="link tap gap-1.5 text-sm font-semibold">
                      Order my work for this role <ArrowDownIcon size={15} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="t-mono muted mt-3 max-w-3xl">
          A similarity score over my own project descriptions, not a hiring decision. It can miss synonyms; that&apos;s why the real screener also has BERT.
        </p>
      </div>
    </section>
  );
}
