import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Fantasy Madness — March Madness Fantasy Basketball";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0d1117 0%, #161b22 50%, #0d1117 100%)",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background decorative elements */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-150px",
            left: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Top border accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, #3b82f6 0%, #f97316 50%, #3b82f6 100%)",
            display: "flex",
          }}
        />

        {/* Basketball icon */}
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            border: "3px solid #f97316",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "24px",
            background: "rgba(249,115,22,0.1)",
          }}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#f97316"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <span
            style={{
              fontSize: "64px",
              fontWeight: 800,
              color: "#e6edf3",
              letterSpacing: "-2px",
              lineHeight: 1,
              textTransform: "uppercase",
            }}
          >
            Fantasy
          </span>
          <span
            style={{
              fontSize: "64px",
              fontWeight: 800,
              color: "#3b82f6",
              letterSpacing: "-2px",
              lineHeight: 1,
              textTransform: "uppercase",
            }}
          >
            Madness
          </span>
        </div>

        {/* Tagline */}
        <p
          style={{
            fontSize: "22px",
            color: "#8b949e",
            marginTop: "20px",
            maxWidth: "600px",
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          Draft bracket slots. Score big on upsets. Free March Madness fantasy basketball.
        </p>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            gap: "48px",
            marginTop: "36px",
          }}
        >
          {[
            { value: "64", label: "Bracket Slots" },
            { value: "seed × wins", label: "Scoring Formula" },
            { value: "16×", label: "Upset Bonus" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span
                style={{
                  fontSize: "28px",
                  fontWeight: 700,
                  color: "#e6edf3",
                  fontFamily: "monospace",
                }}
              >
                {stat.value}
              </span>
              <span style={{ fontSize: "14px", color: "#8b949e" }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
