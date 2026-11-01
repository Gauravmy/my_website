import raw from "./testimonials.json";

/**
 * Real recommendations only. Paste them into testimonials.json.
 * An entry with an empty "quote" renders as an "Add a real recommendation" placeholder card.
 */
export type Testimonial = { quote: string; name: string; role: string; relation: string; href: string };

export const testimonials: Testimonial[] = raw as Testimonial[];

/** Entries with an actual quote. */
export const realTestimonials = testimonials.filter((t) => t.quote.trim().length > 0);

/**
 * Placeholders are only shown while developing (npm run dev). In production the section
 * is hidden until at least one real recommendation exists, so visitors never see a placeholder.
 */
export const showRecommendations = realTestimonials.length > 0 || process.env.NODE_ENV !== "production";
