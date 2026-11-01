import type { MetadataRoute } from "next";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: profile.siteUrl, lastModified: now, changeFrequency: "monthly", priority: 1 },
    ...projects.map((p) => ({ url: `${profile.siteUrl}/work/${p.slug}`, lastModified: now, changeFrequency: "yearly" as const, priority: 0.7 })),
  ];
}
