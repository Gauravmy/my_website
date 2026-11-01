// Coding profiles. Stats are hard-coded on purpose: update them by hand, nothing is scraped at runtime.
export type ProfileLink = {
  id: "github" | "linkedin" | "leetcode" | "gfg";
  label: string;
  handle: string;
  href: string;
  /** Screenshot of the real profile page. Without one, a brand panel with my photo is shown. */
  image?: string;
  stats: { value: string; label: string }[];
};

export const statsCheckedOn = "October 2026";

export const social = {
  github: "https://github.com/Gauravmy",
  linkedin: "https://www.linkedin.com/in/gaurav-dhakad-b7ba642a6/",
  leetcode: "https://leetcode.com/u/g4777636",
  gfg: "https://www.geeksforgeeks.org/profile/g4777sov1",
};

export const profileLinks: ProfileLink[] = [
  {
    id: "leetcode",
    label: "LeetCode",
    handle: "g4777636",
    href: social.leetcode,
    image: "/profiles/leetcode.webp",
    stats: [
      { value: "1,103", label: "solved (283 easy, 616 medium, 204 hard)" },
      { value: "25,901", label: "global rank" },
      { value: "365", label: "day max streak, 500 Days badge" },
    ],
  },
  {
    id: "github",
    label: "GitHub",
    handle: "@Gauravmy",
    href: social.github,
    image: "/profiles/github.webp",
    stats: [
      { value: "79", label: "public repositories" },
      { value: "8", label: "projects on this site" },
    ],
  },
  {
    id: "gfg",
    label: "GeeksforGeeks",
    handle: "g4777sov1",
    href: social.gfg,
    // Add a screenshot once the page's experience section is filled in: it currently says "0 years".
    stats: [{ value: "1700", label: "coding score" }],
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    handle: "gaurav-dhakad-b7ba642a6",
    href: social.linkedin,
    stats: [
      { value: "300+", label: "students mentored" },
      { value: "15+", label: "workshops" },
    ],
  },
];
