import { ImageResponse } from "next/og";

// Edge runtime: renders on-demand (and avoids a Windows-only build-time bug in
// @vercel/og's font loader). Standard setup for OG image routes.
export const runtime = "edge";

export const alt = "MySkinSync — find your perfect skincare routine in 60 seconds";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Note: this renders with Satori, which is strict — use backgroundColor +
// backgroundImage (not the `background` shorthand), give every box with >1 child
// display:flex, and avoid emoji/exotic glyphs.
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          backgroundColor: "#FBF7F2",
          backgroundImage:
            "linear-gradient(135deg, rgba(244,199,195,0.55), rgba(251,247,242,0) 55%), linear-gradient(300deg, rgba(156,175,136,0.35), rgba(251,247,242,0) 50%)",
          color: "#211D18",
          fontFamily: "sans-serif",
        }}
      >
        {/* Wordmark lockup */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              backgroundColor: "#211D18",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: 22, height: 28, borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%", backgroundColor: "#C97D60" }} />
          </div>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 600 }}>
            <span>My</span>
            <span style={{ color: "#C97D60" }}>Skin</span>
            <span>Sync</span>
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.02em", maxWidth: 960 }}>
            Find your perfect skincare routine
          </div>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, color: "#C97D60" }}>
            in 60 seconds.
          </div>
          <div style={{ fontSize: 32, color: "#6E665A", maxWidth: 880, marginTop: 22 }}>
            Take the free quiz, get a personalized AM/PM routine matched to your skin.
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", backgroundColor: "#211D18", color: "#FBF7F2", fontSize: 26, fontWeight: 600, padding: "14px 30px", borderRadius: 999 }}>
            myskinsync.com
          </div>
          <div style={{ display: "flex", fontSize: 24, color: "#6E665A" }}>Free · no email required</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
