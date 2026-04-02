import { useCurrentFrame, useVideoConfig, interpolate, spring, Audio, Img, staticFile, Easing } from "remotion";
import { tokens } from "../tokens";

// Word-level timing synced to narration
// "The world promised a forty-three percent reduction in emissions by 2030.
//  Last year, emissions rose by one percent.
//  We are not closing the gap. We are going the wrong way."
const TIMING = {
  promised: 0.52,       // "promised"
  fortyThree: 1.16,     // "forty-three percent"
  by2030: 4.06,         // "by 2030"
  lastYear: 5.49,       // "Last year"
  roseOne: 6.69,        // "rose by one percent"
  notClosing: 9.02,     // "We are not closing the gap"
  wrongWay: 11.06,      // "We are going the wrong way"
};

const T = Object.fromEntries(
  Object.entries(TIMING).map(([k, v]) => [k, Math.round(v * 30)])
) as Record<keyof typeof TIMING, number>;

// Collage images: climate protest, dried earth
const COLLAGE = [
  { src: "climate-protest.jpg", x: 1220, y: 50, w: 600, h: 360, rotate: 2, delay: 10 },
  { src: "dried-earth.jpg", x: 1260, y: 400, w: 560, h: 340, rotate: -3, delay: T.lastYear },
];

export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOp = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const gaugeProgress = spring({ frame: frame - T.fortyThree, fps, config: { damping: 30, stiffness: 30 } });
  const roseOp = interpolate(frame, [T.roseOne, T.roseOne + 15], [0, 1], { extrapolateRight: "clamp" });
  const roseScale = spring({ frame: frame - T.roseOne, fps, config: { damping: 12, stiffness: 100 } });

  const GAUGE_X = 120;
  const GAUGE_W = 700;
  const GAUGE_Y = 400;
  const GAUGE_H = 60;

  const targetWidth = GAUGE_W * 0.43 * Math.min(gaugeProgress, 1);
  const actualWidth = GAUGE_W * 0.01 * (frame >= T.roseOne ? interpolate(frame, [T.roseOne, T.roseOne + 20], [0, 1], { extrapolateRight: "clamp" }) : 0);

  return (
    <div style={{ width: tokens.layout.width, height: tokens.layout.height, backgroundColor: tokens.colors.background, position: "relative", padding: tokens.layout.padding }}>
      <Audio src={staticFile("audio/scene04.mp3")} />

      {/* Collage images */}
      {COLLAGE.map((img, i) => {
        const p = Math.min(spring({ frame: frame - img.delay, fps, config: { damping: 18, stiffness: 50 } }), 1);
        return (
          <div key={img.src} style={{
            position: "absolute", left: img.x, top: img.y, width: img.w, height: img.h,
            transform: `rotate(${img.rotate}deg) scale(${0.85 + 0.15 * p})`,
            opacity: p, boxShadow: "0 6px 24px rgba(0,0,0,0.2)", borderRadius: 6, overflow: "hidden",
            zIndex: i + 1,
          }}>
            <Img src={staticFile("images/" + img.src)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.75)" }} />
          </div>
        );
      })}

      <div style={{ fontFamily: tokens.fonts.heading, fontSize: 40, fontWeight: 700, color: tokens.colors.text, opacity: titleOp }}>
        The promise vs. the reality
      </div>
      <div style={{ fontFamily: tokens.fonts.body, fontSize: 20, color: tokens.colors.textMuted, marginTop: 4, opacity: titleOp }}>
        Emission reductions needed to limit warming to 1.5°C
      </div>

      {/* Target: -43% bar (green) */}
      <div style={{ position: "absolute", top: GAUGE_Y - 60, left: GAUGE_X }}>
        <div style={{ fontFamily: tokens.fonts.body, fontSize: 16, color: tokens.colors.textMuted, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>
          What we promised
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: targetWidth, height: GAUGE_H, backgroundColor: "#27ae60", borderRadius: 2 }} />
          {Math.min(gaugeProgress, 1) > 0.8 && (
            <div style={{ fontFamily: tokens.fonts.heading, fontSize: 48, fontWeight: 900, color: "#27ae60" }}>
              -43%
            </div>
          )}
        </div>
        <div style={{ fontFamily: tokens.fonts.body, fontSize: 16, color: tokens.colors.textMuted, marginTop: 4 }}>
          reduction by 2030
        </div>
      </div>

      {/* Actual: +1% bar (red, tiny) — synced to "rose by one percent" */}
      {frame >= T.roseOne && (
        <div style={{ position: "absolute", top: GAUGE_Y + GAUGE_H + 40, left: GAUGE_X, opacity: roseOp }}>
          <div style={{ fontFamily: tokens.fonts.body, fontSize: 16, color: tokens.colors.textMuted, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>
            What actually happened
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: Math.max(actualWidth, 8), height: GAUGE_H, backgroundColor: "#c0392b", borderRadius: 2 }} />
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

      {/* "Wrong way" callout — synced to narration */}
      {frame >= T.wrongWay && (
        <div style={{
          position: "absolute", bottom: 180, left: 120,
          fontFamily: tokens.fonts.heading, fontSize: 40, fontWeight: 900,
          color: "#c0392b",
          opacity: interpolate(frame, [T.wrongWay, T.wrongWay + 15], [0, 1], { extrapolateRight: "clamp" }),
          transform: `scale(${Math.min(spring({ frame: frame - T.wrongWay, fps, config: { damping: 12, stiffness: 100 } }), 1)})`,
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
