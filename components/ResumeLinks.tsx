"use client";

import { profile, type ResumeType } from "@/data/profile";
import { onResumeDownload } from "@/lib/analytics";
import { DownloadIcon } from "./Icons";

export function ResumeLink({ type, solid, small, long }: { type: ResumeType; solid?: boolean; small?: boolean; long?: boolean }) {
  const r = profile.resumes[type];
  return (
    <a
      href={r.href}
      download
      data-down
      title={r.hint}
      onClick={() => onResumeDownload(type)}
      className={`btn ${solid ? "btn-solid" : ""} ${small ? "btn-sm" : ""}`}
    >
      {long ? r.long : r.label}
      <DownloadIcon size={small ? 14 : 16} />
    </a>
  );
}
