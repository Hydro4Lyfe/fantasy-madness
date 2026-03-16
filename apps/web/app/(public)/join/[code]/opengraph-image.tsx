import { ImageResponse } from "next/og";
import { getDraftByInviteCode } from "@/server/dal";
import { getLeagueByInviteCode } from "@/server/dal";

export const runtime = "nodejs";
export const alt = "Fantasy Madness Invite";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  // Try draft first, then league
  const draft = await getDraftByInviteCode({ inviteCode: code.trim() });
  const league = !draft
    ? await getLeagueByInviteCode({ inviteCode: code.trim() })
    : null;

  const isDraft = !!draft;
  const name = draft?.name ?? league?.name ?? "Fantasy Madness";
  const hostName = draft?.hostName ?? league?.hostName;
  const tournament = draft?.tournamentName ?? league?.tournamentName ?? "";
  const playerCount = draft?.participantCount ?? league?.participantCount ?? 0;
  const maxPlayers = isDraft
    ? draft?.rosterSize
    : league?.maxParticipants;
  const accentColor = isDraft ? "#f97316" : "#3b82f6";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #0d1117 0%, #161b22 50%, #0d1117 100%)",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
          padding: "60px",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            top: "-200px",
            right: "-200px",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${accentColor}15 0%, transparent 70%)`,
            display: "flex",
          }}
        />

        {/* Top accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: `linear-gradient(90deg, ${accentColor}, ${isDraft ? "#eab308" : "#06b6d4"}, ${accentColor})`,
            display: "flex",
          }}
        />

        {/* Top row: branding + badge */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "auto",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                fontSize: "24px",
                fontWeight: 700,
                color: "#e6edf3",
                letterSpacing: "-0.5px",
              }}
            >
              Fantasy
            </span>
            <span
              style={{
                fontSize: "24px",
                fontWeight: 700,
                color: "#3b82f6",
                letterSpacing: "-0.5px",
              }}
            >
              Madness
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "999px",
              border: `1px solid ${accentColor}40`,
              background: `${accentColor}10`,
            }}
          >
            <span
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: accentColor,
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              {isDraft ? "Draft Invite" : "League Invite"}
            </span>
          </div>
        </div>

        {/* Center: invite details */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "16px",
          }}
        >
          {hostName && (
            <span style={{ fontSize: "20px", color: "#8b949e" }}>
              {hostName} invited you to join
            </span>
          )}

          <span
            style={{
              fontSize: "56px",
              fontWeight: 800,
              color: "#e6edf3",
              letterSpacing: "-2px",
              lineHeight: 1.1,
              maxWidth: "900px",
            }}
          >
            {name}
          </span>

          <span style={{ fontSize: "20px", color: "#8b949e" }}>
            {tournament}
          </span>
        </div>

        {/* Bottom row: stats */}
        <div
          style={{
            display: "flex",
            gap: "32px",
            marginTop: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 20px",
              borderRadius: "12px",
              border: "1px solid #30363d",
              background: "#161b2280",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#8b949e"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span style={{ fontSize: "18px", color: "#e6edf3", fontWeight: 600 }}>
              {playerCount}{maxPlayers ? `/${maxPlayers}` : ""} players
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 20px",
              borderRadius: "12px",
              border: `1px solid ${accentColor}40`,
              background: `${accentColor}10`,
            }}
          >
            <span style={{ fontSize: "18px", color: accentColor, fontWeight: 600 }}>
              Join Now
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
