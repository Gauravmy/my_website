import { realTestimonials, showRecommendations, testimonials } from "@/data/testimonials";
import { ArrowUpRight } from "./Icons";

/**
 * Recommendations from data/testimonials.json.
 * Production: hidden until there's at least one real quote. Development: shows placeholders too.
 */
export function Recommendations() {
  if (!showRecommendations) return null;
  const items = realTestimonials.length > 0 ? realTestimonials : testimonials;

  return (
    <section id="recommendations" aria-labelledby="recommendations-title" className="sheet border-t border-line">
      <div className="wrap py-16 md:py-24">
        <h2 id="recommendations-title" className="t-h2">
          What people I&apos;ve worked with say
        </h2>
        <ul className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2" aria-label="Recommendations" tabIndex={0}>
          {items.map((t, i) => (
            <li key={i} className="w-[88%] shrink-0 snap-start border-t border-fg pt-4 sm:w-[46%] lg:w-[31%]">
              {t.quote ? (
                <figure>
                  <blockquote className="t-read">{t.quote}</blockquote>
                  <figcaption className="mt-4">
                    {t.href ? (
                      <a href={t.href} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-1 font-semibold">
                        {t.name} <ArrowUpRight size={14} />
                      </a>
                    ) : (
                      <span className="font-semibold">{t.name}</span>
                    )}
                    <span className="t-mono muted mt-0.5 block">
                      {t.role}
                      {t.relation && `, ${t.relation}`}
                    </span>
                  </figcaption>
                </figure>
              ) : (
                <div className="muted">
                  <p className="t-h4 text-fg">Add a real recommendation</p>
                  <p className="mt-1 text-sm">Placeholder {i + 1}, visible in development only. Paste a LinkedIn recommendation or mentor feedback into data/testimonials.json.</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
