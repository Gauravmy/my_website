"use client";

import { useEffect } from "react";

/** One IntersectionObserver for every [data-reveal] element, including ones mounted later. */
export function RevealObserver() {
  useEffect(() => {
    const show = (el: Element) => el.classList.add("in");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      document.querySelectorAll("[data-reveal]").forEach(show);
      document.documentElement.removeAttribute("data-js");
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            show(e.target);
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px" },
    );
    const scan = (root: ParentNode) => root.querySelectorAll("[data-reveal]:not(.in)").forEach((el) => io.observe(el));
    scan(document);
    const mo = new MutationObserver((records) => {
      for (const r of records)
        r.addedNodes.forEach((n) => {
          if (!(n instanceof Element)) return;
          if (n.matches("[data-reveal]:not(.in)")) io.observe(n);
          scan(n);
        });
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
  return null;
}
