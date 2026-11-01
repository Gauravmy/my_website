import { ImageResponse } from "next/og";

export const alt = "Gaurav Dhakad · AI/ML Engineer & Full-Stack Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Generated social preview (Open Graph + Twitter). Rendered at build time.
export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", background: "#0a1b94", color: "#f2eee3", padding: "56px 60px", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", fontSize: 150, fontWeight: 800, letterSpacing: -7, lineHeight: 0.95 }}>Gaurav</div>
        <div style={{ display: "flex", fontSize: 150, fontWeight: 800, letterSpacing: -7, lineHeight: 0.95 }}>Dhakad</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 34, borderTop: "1px solid rgba(242,238,227,0.3)", paddingTop: 20, fontSize: 30 }}>
          <span>AI/ML Engineer &amp; Full-Stack Developer</span>
          <span style={{ background: "#d7f24a", color: "#0d1020", padding: "4px 12px", fontWeight: 700 }}>MAE 6.57 → 4.13</span>
        </div>
      </div>
    ),
    size,
  );
}
