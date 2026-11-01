import type { ResumeType } from "@/data/profile";

/**
 * Called every time someone downloads a resume. Intentionally a no-op.
 * Wire it to analytics later, e.g.
 *   import { track } from "@vercel/analytics";  track("resume_download", { type });
 *   window.gtag?.("event", "resume_download", { type });
 */
export function onResumeDownload(type: ResumeType): void {
  void type;
}
