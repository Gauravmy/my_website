// Open source, certifications and in-page navigation.
import { showRecommendations } from "./testimonials";

export type Contribution = {
  project: string;
  number: number;
  title: string;
  href: string;
  /** Status on GitHub when last checked. Keep this true: a recruiter will click it. */
  status: "In review" | "Closed, not merged" | "Merged";
};

export const contributions: Contribution[] = [
  {
    project: "Open Food Facts",
    number: 13129,
    title: "Improve Search API documentation for filters and pagination",
    href: "https://github.com/openfoodfacts/openfoodfacts-server/pull/13129",
    status: "In review",
  },
  {
    project: "Joplin",
    number: 14601,
    title: "Prevent duplicate tags when tagging a note with an existing tag",
    href: "https://github.com/laurent22/joplin/pull/14601",
    status: "Closed, not merged",
  },
  {
    project: "Submitty",
    number: 12473,
    title: "Improve clarity of rubric cancel dialog buttons",
    href: "https://github.com/Submitty/Submitty/pull/12473",
    status: "Closed, not merged",
  },
  {
    project: "CircuitVerse",
    number: 7024,
    title: "Correct horizontal rule placement between mentors and members",
    href: "https://github.com/CircuitVerse/CircuitVerse/pull/7024",
    status: "Closed, not merged",
  },
];

export type Certification = { name: string; issuer: string; href?: string };

// Add `href` with a certificate's verification URL when you have it.
export const certifications: Certification[] = [
  { name: "Machine Learning Specialization", issuer: "Coursera, Andrew Ng" },
  { name: "AI Fundamentals", issuer: "Microsoft" },
  { name: "Python for Data Science", issuer: "Great Learning" },
  { name: "Database Certification", issuer: "UT" },
];

const allSections = [
  { id: "fit", label: "Fit check" },
  { id: "work", label: "Work" },
  { id: "process", label: "How I work" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "profiles", label: "Profiles" },
  { id: "about", label: "About" },
  { id: "recommendations", label: "Recommendations" },
  { id: "contact", label: "Contact" },
];

/** In-page sections. Recommendations is left out until there's a real one. */
export const sections = allSections.filter((s) => s.id !== "recommendations" || showRecommendations);
