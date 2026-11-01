import { social } from "@/data/links";
import { profile } from "@/data/profile";
import { GfgIcon, GitHubIcon, LeetCodeIcon, LinkedInIcon, MailIcon } from "./Icons";

const items = [
  { label: "GitHub", href: social.github, Icon: GitHubIcon },
  { label: "LinkedIn", href: social.linkedin, Icon: LinkedInIcon },
  { label: "LeetCode", href: social.leetcode, Icon: LeetCodeIcon },
  { label: "GeeksforGeeks", href: social.gfg, Icon: GfgIcon },
];

/** Icon links with their names written out on wider screens. */
export function SocialLinks({ className, dark }: { className?: string; dark?: boolean }) {
  const hover = dark ? "hover:text-acid" : "hover:text-accent";
  return (
    <ul className={`flex flex-wrap items-center gap-x-1 gap-y-1 ${className ?? ""}`}>
      {items.map(({ label, href, Icon }) => (
        <li key={label}>
          <a href={href} target="_blank" rel="noopener noreferrer" className={`tap gap-2 px-2.5 text-sm font-medium transition-colors ${hover}`}>
            <Icon size={18} />
            <span>{label}</span>
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </li>
      ))}
      <li>
        <a href={`mailto:${profile.email}`} className={`tap gap-2 px-2.5 text-sm font-medium transition-colors ${hover}`}>
          <MailIcon size={18} />
          <span>Email</span>
        </a>
      </li>
    </ul>
  );
}
