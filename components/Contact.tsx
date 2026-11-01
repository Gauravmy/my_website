"use client";

import { useState } from "react";
import { social } from "@/data/links";
import { profile } from "@/data/profile";
import { copyText, toast } from "@/lib/client";
import { ArrowUpRight, CheckIcon, CopyIcon, MailIcon } from "./Icons";
import { ResumeLink } from "./ResumeLinks";

// Set NEXT_PUBLIC_FORMSPREE_ID in .env.local / Vercel. Without it the form opens a pre-filled email instead.
const FORMSPREE_ID = process.env.NEXT_PUBLIC_FORMSPREE_ID;

type Fields = { name: string; email: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;

function validate(f: Fields): Errors {
  const e: Errors = {};
  if (f.name.trim().length < 2) e.name = "Tell me your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = "That email doesn't look right.";
  if (f.message.trim().length < 10) e.message = "A little more detail, please (10+ characters).";
  return e;
}

export function Contact() {
  const [fields, setFields] = useState<Fields>({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const onCopy = async () => {
    const ok = await copyText(profile.email);
    toast(ok ? `Copied ${profile.email}` : "Couldn't copy. Select the address instead.");
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs = validate(fields);
    setErrors(errs);
    if (Object.keys(errs).length) {
      document.getElementById(`cf-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    // Honeypot: bots fill hidden fields.
    if ((e.currentTarget.elements.namedItem("_gotcha") as HTMLInputElement)?.value) return;

    if (!FORMSPREE_ID) {
      const body = `${fields.message}\n\n${fields.name} · ${fields.email}`;
      window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(`Portfolio: hello from ${fields.name}`)}&body=${encodeURIComponent(body)}`;
      setStatus("sent");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(fields),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("sent");
      setFields({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  const field = (k: keyof Fields) => ({
    id: `cf-${k}`,
    name: k,
    value: fields[k],
    onChange: (ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFields((f) => ({ ...f, [k]: ev.target.value }));
      if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
    },
    "aria-invalid": Boolean(errors[k]),
    "aria-describedby": errors[k] ? `cf-${k}-err` : undefined,
  });

  return (
    <section id="contact" data-blue aria-labelledby="contact-title" className="on-blue relative z-[1]">
      <div className="wrap py-16 md:py-24">
        <h2 id="contact-title" className="t-display">
          Let&apos;s talk.
        </h2>
        <a
          href={`mailto:${profile.email}`}
          className="mt-5 block min-h-11 w-fit max-w-full break-all font-extrabold tracking-[-0.04em] text-acid [font-size:clamp(1.65rem,0.8rem+4.4vw,5.5rem)] [line-height:1.02] hover:underline hover:decoration-[0.05em] hover:underline-offset-[0.1em]"
        >
          {profile.email}
        </a>

        <div className="mt-10 grid gap-x-10 gap-y-10 border-t border-line-blue pt-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="t-read">{profile.status}. Email is the fastest way to reach me.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <a href={`mailto:${profile.email}`} className="btn btn-solid">
                Write an email <MailIcon size={16} />
              </a>
              <button onClick={onCopy} className="btn">
                Copy address <CopyIcon size={16} />
              </button>
            </div>
            <dl className="mt-8 border-b border-line-blue">
              <div className="flex items-baseline justify-between gap-4 border-t border-line-blue py-2.5">
                <dt className="t-mono text-on-blue-2">Phone</dt>
                <dd>
                  <a href={profile.phoneHref} className="link tap font-semibold">
                    {profile.phone}
                  </a>
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-t border-line-blue py-2.5">
                <dt className="t-mono text-on-blue-2">LinkedIn</dt>
                <dd>
                  <a href={social.linkedin} target="_blank" rel="noopener noreferrer" className="link tap gap-1 font-semibold">
                    Gaurav Dhakad <ArrowUpRight size={14} />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-t border-line-blue py-2.5">
                <dt className="t-mono text-on-blue-2">Based in</dt>
                <dd className="font-semibold">{profile.location} (IST)</dd>
              </div>
            </dl>
            <div className="mt-6 flex flex-wrap gap-2">
              <ResumeLink type="aiml" long />
              <ResumeLink type="fullstack" long />
            </div>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            {status === "sent" ? (
              <div className="flex min-h-[320px] flex-col items-start justify-center" role="status">
                <CheckIcon size={36} className="text-acid" />
                <p className="t-h3 mt-3">{FORMSPREE_ID ? "Message sent." : "Your email app should be open."}</p>
                <p className="t-read mt-2 text-on-blue-2">{FORMSPREE_ID ? "Thanks. I'll get back to you soon." : `If nothing opened, write to ${profile.email} directly.`}</p>
                <button onClick={() => setStatus("idle")} className="btn btn-sm mt-5">
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="space-y-4" aria-label="Contact form">
                <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
                <div className="grid gap-4 sm:grid-cols-2">
                  {(
                    [
                      ["name", "Your name", "text", "name"],
                      ["email", "Your email", "email", "email"],
                    ] as const
                  ).map(([k, label, type, ac]) => (
                    <div key={k}>
                      <label htmlFor={`cf-${k}`} className="text-sm font-semibold">
                        {label}
                      </label>
                      <input type={type} autoComplete={ac} className="field mt-1" {...field(k)} />
                      {errors[k] && (
                        <p id={`cf-${k}-err`} className="mt-1 text-sm font-medium text-acid">
                          {errors[k]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                <div>
                  <label htmlFor="cf-message" className="text-sm font-semibold">
                    What are you hiring for, or building?
                  </label>
                  <textarea rows={6} className="field mt-1 resize-y" {...field("message")} />
                  {errors.message && (
                    <p id="cf-message-err" className="mt-1 text-sm font-medium text-acid">
                      {errors.message}
                    </p>
                  )}
                </div>
                {status === "error" && (
                  <p className="text-sm font-medium text-acid" role="alert">
                    Something went wrong sending that. Email me directly at {profile.email}.
                  </p>
                )}
                <button type="submit" disabled={status === "sending"} className="btn btn-solid disabled:opacity-60">
                  {status === "sending" ? "Sending…" : "Send message"} <ArrowUpRight size={16} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
