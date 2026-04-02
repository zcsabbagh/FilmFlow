import { useCurrentFrame, useVideoConfig, interpolate, spring, Audio, Img, staticFile } from "remotion";
import { tokens } from "../tokens";

/**
 * Scene 08 — Closing with collage images
 * "10,000 boomers retire every day. Half aren't ready. For millennials, even worse."
 * Duration: 165 frames (5.5s) — narration is 4.5s + buffer
 */

// Word timing (1.35x speed)
const W = {
  ten: 0.0,
  thousand: 0.24,
  boomers: 0.57,
  retire: 0.85,
  every: 1.20,
  day: 1.40,
  half: 1.82,
  arent: 2.08,
  ready: 2.27,
  and: 2.80,
  millennials: 3.00,
  worse: 3.95,
};

export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // "10,000" ticker
  const tenKP = spring({ frame, fps, config: { damping: 25, stiffness: 40 } });

  // "Half aren't ready" punch
  const halfFrame = Math.round(W.half * fps);
  const halfOp = interpolate(frame, [halfFrame, halfFrame + 10], [0, 1], { extrapolateRight: "clamp" });
  const halfScale = spring({ frame: frame - halfFrame, fps, config: { damping: 12, stiffness: 100 } });

  // "For millennials" fade
  const milFrame = Math.round(W.millennials * fps);
  const milOp = interpolate(frame, [milFrame, milFrame + 12], [0, 1], { extrapolateRight: "clamp" });

  // Collage background
  const bgOp = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div style={{ width: tokens.layout.width, height: tokens.layout.height, backgroundColor: tokens.colors.background, position: "relative", overflow: "hidden" }}>
      <Audio src={staticFile("audio/close.mp3")} />

      {/* Collage images — tilted, overlapping background */}
      <Img
        src={staticFile("images/senior-retail.jpg")}
        style={{
          position: "absolute", left: -30, top: -20,
          width: 600, height: 420, objectFit: "cover",
          borderRadius: 14, transform: "rotate(-3deg)",
          boxShadow: "0 8px 28px rgba(0,0,0,0.2)",
          opacity: bgOp * 0.2,
          filter: "grayscale(60%)",
          border: "3px solid rgba(255,255,255,0.2)",
        }}
      />
      <Img
        src={staticFile("images/elderly-working.jpg")}
        style={{
          position: "absolute", right: -20, top: 100,
          width: 560, height: 400, objectFit: "cover",
          borderRadius: 14, transform: "rotate(4deg)",
          boxShadow: "0 8px 28px rgba(0,0,0,0.2)",
          opacity: bgOp * 0.18,
          filter: "grayscale(60%)",
          border: "3px solid rgba(255,255,255,0.2)",
        }}
      />
      <Img
        src={staticFile("images/stock-chart.jpg")}
        style={{
          position: "absolute", left: 200, bottom: -20,
          width: 500, height: 360, objectFit: "cover",
          borderRadius: 14, transform: "rotate(2deg)",
          boxShadow: "0 8px 28px rgba(0,0,0,0.2)",
          opacity: bgOp * 0.15,
          filter: "grayscale(60%)",
          border: "3px solid rgba(255,255,255,0.2)",
        }}
      />

      {/* Content — centered */}
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        {/* "10,000" */}
        <div style={{ fontFamily: tokens.fonts.heading, fontSize: 140, fontWeight: 900, color: tokens.colors.text, lineHeight: 1 }}>
          {Math.round(10000 * Math.min(tenKP, 1)).toLocaleString()}
        </div>
        <div style={{ fontFamily: tokens.fonts.body, fontSize: 26, color: tokens.colors.textMuted, marginTop: 12 }}>
          boomers retire every day
        </div>

        {/* "Half aren't ready" */}
        {t >= W.half && (
          <div style={{
            fontFamily: tokens.fonts.heading, fontSize: 60, fontWeight: 900,
            color: tokens.colors.accent, marginTop: 40,
            opacity: halfOp, transform: `scale(${Math.min(halfScale, 1)})`,
          }}>
            Half aren&apos;t ready.
          </div>
        )}

        {/* "For millennials..." */}
        {t >= W.millennials && (
          <div style={{
            fontFamily: tokens.fonts.body, fontSize: 24,
            color: tokens.colors.textMuted, marginTop: 28,
            opacity: milOp,
          }}>
            For millennials, it may be even worse.
          </div>
        )}
      </div>

      <div style={{ position: "absolute", bottom: 60, left: 100, fontFamily: tokens.fonts.body, fontSize: 14, color: tokens.colors.textLight }}>
        Source: Pew Research, AARP
      </div>
    </div>
  );
};
