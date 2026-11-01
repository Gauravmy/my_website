import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Newsreader, Schibsted_Grotesk } from "next/font/google";
import { social } from "@/data/links";
import { profile } from "@/data/profile";
import "./globals.css";

// Schibsted Grotesk was drawn for a Norwegian news group; Newsreader for long reading on screens.
// Static weights rather than the variable files: about a third of the download.
const grotesk = Schibsted_Grotesk({ subsets: ["latin"], variable: "--font-grotesk", display: "swap", weight: ["400", "600", "800", "900"] });
const news = Newsreader({ subsets: ["latin"], variable: "--font-news", display: "swap", weight: ["400"], style: ["normal", "italic"], preload: false });
const code = IBM_Plex_Mono({ subsets: ["latin"], variable: "--font-code", display: "swap", weight: ["400"], preload: false });

const description =
  "Gaurav Dhakad: final-year B.Tech CSE (AI & ML) student. AI/ML engineer who ships full-stack products, with models checked against baselines, covered by tests and deployed as working apps.";

export const metadata: Metadata = {
  metadataBase: new URL(profile.siteUrl),
  title: { default: "Gaurav Dhakad · AI/ML Engineer & Full-Stack Developer", template: "%s · Gaurav Dhakad" },
  description,
  authors: [{ name: profile.name, url: profile.siteUrl }],
  keywords: ["Gaurav Dhakad", "AI/ML engineer", "full-stack developer", "computer vision", "NLP", "portfolio", "Next.js", "FastAPI"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    url: profile.siteUrl,
    title: "Gaurav Dhakad · AI/ML Engineer & Full-Stack Developer",
    description,
    siteName: "Gaurav Dhakad",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gaurav Dhakad · AI/ML Engineer & Full-Stack Developer",
    description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0a1b94",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Runs before paint: theme with no flash, and whether this visit plays the opening.
// Software WebGL (no GPU), very low memory and data-saver mode all get the plain text hero instead.
const bootScript = `(function(){try{var d=document.documentElement;d.setAttribute('data-js','');var t=localStorage.getItem('gd-theme');d.setAttribute('data-theme',t==='dark'?'dark':'light');var home=location.pathname==='/';var calm=window.matchMedia('(prefers-reduced-motion: reduce)').matches;var seen=sessionStorage.getItem('gd-intro');var c=document.createElement('canvas');var gl=c.getContext&&(c.getContext('webgl2')||c.getContext('webgl'));if(gl&&location.search.indexOf('gl=force')<0){var i=gl.getExtension('WEBGL_debug_renderer_info');if(i&&/swiftshader|llvmpipe|software|basic render/i.test(gl.getParameter(i.UNMASKED_RENDERER_WEBGL)))gl=null}var n=navigator;if(gl&&location.search.indexOf('gl=force')<0&&((n.deviceMemory&&n.deviceMemory<=2)||(n.connection&&n.connection.saveData)))gl=null;if(home&&gl&&!calm&&!seen){d.setAttribute('data-gl','boot')}else if(home&&gl){d.setAttribute('data-gl','seen')}else if(home){d.setAttribute('data-gl','off')}}catch(e){}})();`;

const personLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  url: profile.siteUrl,
  email: `mailto:${profile.email}`,
  telephone: profile.phone,
  jobTitle: "AI/ML Engineer & Full-Stack Developer",
  address: { "@type": "PostalAddress", addressLocality: "Mathura", addressCountry: "IN" },
  alumniOf: { "@type": "CollegeOrUniversity", name: "Sanskriti University" },
  sameAs: [social.github, social.linkedin, social.leetcode, social.gfg],
  knowsAbout: ["Machine Learning", "Computer Vision", "NLP", "Full-Stack Development", "Python", "TypeScript", "React", "FastAPI"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning className={`${grotesk.variable} ${news.variable} ${code.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
