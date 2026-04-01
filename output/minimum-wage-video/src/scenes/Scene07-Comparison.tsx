import { useCurrentFrame, useVideoConfig, interpolate, spring, Audio, staticFile, Easing } from "remotion";
import { tokens } from "../tokens";

// Timing: "If the minimum wage had kept pace with productivity..."
const T = { productivity: 0, twentyFour: 60, inflation: 155, overTen: 215, instead: 300, gap: 380 };

const bars = [
  { label: "If matched productivity", value: 24, color: "#27ae60", frame: 60 },
  { label: "If matched inflation", value: 10.50, color: "#5b7e96", frame: 215 },
  { label: "Actual", value: 7.25, color: tokens.colors.accent, frame: 300 },
];

export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleOp = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  const BAR_MAX_W = 900;
  const MAX_VAL = 28;

  // "never been wider" callout
  const gapOp = interpolate(frame, [T.gap, T.gap + 15], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div style={{ width: tokens.layout.width, height: tokens.layout.height, backgroundColor: tokens.colors.background, padding: 100, position: "relative" }}>
      <Audio src={staticFile("audio/scene07-comparison.mp3")} />

      <div style={{ fontFamily: tokens.fonts.heading, fontSize: 42, fontWeight: 700, color: tokens.colors.text, opacity: titleOp }}>
        What the minimum wage should be
      </div>

      <div style={{ marginTop: 60, display: "flex", flexDirection: "column", gap: 40 }}>
        {bars.map((b) => {
          const progress = spring({ frame: frame - b.frame, fps, config: { damping: 20, stiffness: 50 } });
          const barW = (b.value / MAX_VAL) * BAR_MAX_W * Math.min(progress, 1);
          const labelOp = Math.min(progress, 1) > 0.7 ? 1 : 0;
          return (
            <div key={b.label}>
              <div style={{ fontFamily: tokens.fonts.body, fontSize: 16, color: tokens.colors.textMuted, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>
                {b.label}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{ width: barW, height: 48, backgroundColor: b.color }} />
                <div style={{ fontFamily: tokens.fonts.heading, fontSize: 44, fontWeight: 900, color: tokens.colors.text, opacity: labelOp }}>
                  ${b.value.toFixed(2)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gap annotation */}
      {frame >= T.gap && (
        <div style={{ position: "absolute", right: 120, bottom: 200, opacity: gapOp, textAlign: "right" }}>
          <div style={{ fontFamily: tokens.fonts.heading, fontSize: 36, fontWeight: 900, color: tokens.colors.accent }}>
            The gap has never<br />been wider
          </div>
        </div>
      )}

      <div style={{ position: "absolute", bottom: 80, left: 100, fontFamily: tokens.fonts.body, fontSize: 14, color: tokens.colors.textLight }}>Source: EPI, BLS, Congressional Research Service</div>
    </div>
  );
};
