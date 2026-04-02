import { useCurrentFrame, useVideoConfig, interpolate, spring, Audio, Img, staticFile, Easing } from "remotion";
import { tokens } from "../tokens";

// "10,000 boomers retire every day. Half aren't ready."
const T = { tenK: 20, half: 130, millennials: 200 };

export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const tenKP = spring({ frame: frame - T.tenK, fps, config: { damping: 25, stiffness: 40 } });
  const halfOp = interpolate(frame, [T.half, T.half + 12], [0, 1], { extrapolateRight: "clamp" });
  const halfScale = spring({ frame: frame - T.half, fps, config: { damping: 12, stiffness: 100 } });
  const milOp = interpolate(frame, [T.millennials, T.millennials + 15], [0, 1], { extrapolateRight: "clamp" });

  // Background image fades in
  const bgOp = interpolate(frame, [0, 30], [0, 0.15], { extrapolateRight: "clamp" });

  return (
    <div style={{ width: tokens.layout.width, height: tokens.layout.height, backgroundColor: tokens.colors.background, position: "relative", overflow: "hidden" }}>
      <Audio src={staticFile("audio/close.mp3")} />

      <Img src={staticFile("images/senior-working.jpg")} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", opacity: bgOp, filter: "grayscale(70%)" }} />

      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        {/* "10,000" */}
        <div style={{ fontFamily: tokens.fonts.heading, fontSize: 140, fontWeight: 900, color: tokens.colors.text, lineHeight: 1 }}>
          {Math.round(10000 * Math.min(tenKP, 1)).toLocaleString()}
        </div>
        <div style={{ fontFamily: tokens.fonts.body, fontSize: 26, color: tokens.colors.textMuted, marginTop: 12 }}>
          boomers retire every day
        </div>

        {/* "Half aren't ready" */}
        {frame >= T.half && (
          <div style={{ fontFamily: tokens.fonts.heading, fontSize: 60, fontWeight: 900, color: tokens.colors.accent, marginTop: 40, opacity: halfOp, transform: `scale(${Math.min(halfScale, 1)})` }}>
            Half aren&apos;t ready.
          </div>
        )}

        {/* "For millennials..." */}
        {frame >= T.millennials && (
          <div style={{ fontFamily: tokens.fonts.body, fontSize: 24, color: tokens.colors.textMuted, marginTop: 30, opacity: milOp }}>
            For millennials, it may be even worse.
          </div>
        )}
      </div>

      <div style={{ position: "absolute", bottom: 80, left: 100, fontFamily: tokens.fonts.body, fontSize: 14, color: tokens.colors.textLight }}>Source: Pew Research, AARP</div>
    </div>
  );
};
