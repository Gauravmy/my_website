import type { CSSProperties, ReactNode } from "react";

/**
 * Scroll reveal as plain markup; one shared observer in RevealObserver.tsx adds the `in` class.
 * Content stays visible without JavaScript and under reduced motion.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  wipe,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  /** Wipe open from the top (for images) instead of fading up. */
  wipe?: boolean;
}) {
  return (
    <div data-reveal={wipe ? "wipe" : ""} className={className} style={{ "--reveal-delay": `${delay}s` } as CSSProperties}>
      {children}
    </div>
  );
}
