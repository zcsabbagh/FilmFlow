import { useCurrentFrame, useVideoConfig, interpolate, spring, Audio, staticFile, Easing } from "remotion";
import { tokens } from "../tokens";

// "The gap... 43% reduction needed by 2030. They rose 1% last year."
const T = { gap: 0, fortyThree: 120, roseOne: 310, lastYear: 380 };

export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOp = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  // Thermometer-style gauge: need to go DOWN 43%, went UP 1%
  const gaugeProgress = spring({ frame: frame - T.fortyThree, fps, config: { damping: 30, stiffness: 30 } });

  // The devastating "rose 1%" reveal
  const roseOp = interpolate(frame, [T.roseOne, T.roseOne + 15], [0, 1], { extrapolateRight: "clamp" });
  const roseScale = spring({ frame: frame - T.roseOne, fps, config: { damping: 12, stiffness: 100 } });

  // Gauge dimensions
  const GAUGE_X = 400;
  const GAUGE_W = 800;
  const GAUGE_Y = 450;
  const GAUGE_H = 60;

  // Target: -43% from left, actual: +1% (barely visible)
  const targetWidth = GAUGE_W * 0.43 * Math.min(gaugeProgress, 1);
  const actualWidth = GAUGE_W * 0.01 * (frame >= T.roseOne ? interpolate(frame, [T.roseOne, T.roseOne + 20], [0, 1], { extrapolateRight: "clamp" }) : 0);

  return (
    <div style={{ width: tokens.layout.width, height: tokens.layout.height, backgroundColor: tokens.colors.background, position: "relative", padding: tokens.layout.padding }}>
      <Audio src={staticFile("audio/scene04.mp3")} />

      <div style={{ fontFamily: tokens.fonts.heading, fontSize: 40, fontWeight: 700, color: tokens.colors.text, opacity: titleOp }}>
        The promise vs. the reality
      </div>
      <div style={{ fontFamily: tokens.fonts.body, fontSize: 20, color: tokens.colors.textMuted, marginTop: 4, opacity: titleOp }}>
        Emission reductions needed to limit warming to 1.5°C
      </div>

      {/* Target: -43% bar (green, going left from center) */}
      <div style={{ position: "absolute", top: GAUGE_Y - 60, left: GAUGE_X }}>
        <div style={{ fontFamily: tokens.fonts.body, fontSize: 16, color: tokens.colors.textMuted, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>
          What we promised
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: targetWidth, height: GAUGE_H, backgroundColor: "#27ae60" }} />
          {Math.min(gaugeProgress, 1) > 0.8 && (
            <div style={{ fontFamily: tokens.fonts.heading, fontSize: 48, fontWeight: 900, color: "#27ae60" }}>
              −43%
            </div>
          )}
        </div>
        <div style={{ fontFamily: tokens.fonts.body, fontSize: 16, color: tokens.colors.textMuted, marginTop: 4 }}>
          reduction by 2030
        </div>
      </div>

      {/* Actual: +1% bar (red, tiny) */}
      {frame >= T.roseOne && (
        <div style={{ position: "absolute", top: GAUGE_Y + GAUGE_H + 40, left: GAUGE_X, opacity: roseOp }}>
          <div style={{ fontFamily: tokens.fonts.body, fontSize: 16, color: tokens.colors.textMuted, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>
            What actually happened
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: Math.max(actualWidth, 8), height: GAUGE_H, backgroundColor: "#c0392b" }} />
            <div style={{
              fontFamily: tokens.fonts.heading, fontSize: 48, fontWeight: 900, color: "#c0392b",
              transform: `scale(${Math.min(roseScale, 1)})`,
            }}>
              +1%
            </div>
          </div>
          <div style={{ fontFamily: tokens.fonts.body, fontSize: 16, color: tokens.colors.textMuted, marginTop: 4 }}>
            emissions rose last year
          </div>
        </div>
      )}

      {/* Devastating visual contrast callout */}
      {frame >= T.lastYear && (
        <div style={{
          position: "absolute", bottom: 180, right: 150,
          fontFamily: tokens.fonts.heading, fontSize: 36, fontWeight: 900,
          color: "#c0392b", textAlign: "right",
          opacity: interpolate(frame, [T.lastYear, T.lastYear + 15], [0, 1], { extrapolateRight: "clamp" }),
        }}>
          We are going<br />the wrong way.
        </div>
      )}

      <div style={{ position: "absolute", bottom: tokens.layout.padding, left: tokens.layout.padding, fontFamily: tokens.fonts.body, fontSize: 14, color: tokens.colors.textLight }}>
        Source: UNEP Emissions Gap Report, 2024
      </div>
    </div>
  );
};
