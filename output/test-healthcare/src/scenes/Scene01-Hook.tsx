import { useCurrentFrame, useVideoConfig, interpolate, spring, Audio, Img, staticFile, Easing } from "remotion";
import { tokens } from "../tokens";

const T = { spends: 0, fourPointFive: 137, eighteenPercent: 227, andYet: 428, threeYears: 526, sixYears: 659, how: 839 };

const lifeData = [
  { country: "Japan", years: 84.5, color: "#27ae60" },
  { country: "UK", years: 81.2, color: "#5b7e96" },
  { country: "US", years: 78.0, color: tokens.colors.accent },
];

export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bgOp = interpolate(frame, [0, 30], [0, 0.12], { extrapolateRight: "clamp" });
  const act1Dim = frame >= T.andYet ? interpolate(frame, [T.andYet, T.andYet + 20], [1, 0], { extrapolateRight: "clamp" }) : 1;
  const trillionP = spring({ frame: frame - T.fourPointFive, fps, config: { damping: 25, stiffness: 40 } });
  const gdpOp = interpolate(frame, [T.eighteenPercent, T.eighteenPercent + 15], [0, 1], { extrapolateRight: "clamp" });
  const turnOp = interpolate(frame, [T.andYet, T.andYet + 15], [0, 1], { extrapolateRight: "clamp" });
  const howOp = interpolate(frame, [T.how, T.how + 10], [0, 1], { extrapolateRight: "clamp" });
  const howScale = spring({ frame: frame - T.how, fps, config: { damping: 12, stiffness: 120 } });

  return (
    <div style={{ width: tokens.layout.width, height: tokens.layout.height, backgroundColor: tokens.colors.background, position: "relative", overflow: "hidden" }}>
      <Audio src={staticFile("audio/hook.mp3")} />
      <Img src={staticFile("images/hospital.jpg")} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", opacity: bgOp, filter: "grayscale(100%)" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${tokens.colors.backgroundAlt}55 1px, transparent 1px), linear-gradient(90deg, ${tokens.colors.backgroundAlt}55 1px, transparent 1px)`, backgroundSize: "60px 60px", opacity: 0.25 }} />

      {/* Act 1 */}
      <div style={{ position: "absolute", top: 100, left: 100, opacity: act1Dim }}>
        <div style={{ fontFamily: tokens.fonts.body, fontSize: 16, fontWeight: 600, color: tokens.colors.textMuted, textTransform: "uppercase", letterSpacing: 3, marginBottom: 16 }}>US Healthcare Spending</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 20 }}>
          <div style={{ fontFamily: tokens.fonts.heading, fontSize: 140, fontWeight: 900, color: tokens.colors.text, lineHeight: 1 }}>${(4.5 * trillionP).toFixed(1)}T</div>
          <div style={{ fontFamily: tokens.fonts.body, fontSize: 24, color: tokens.colors.textMuted }}>per year</div>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 20, opacity: gdpOp }}>
          <div style={{ fontFamily: tokens.fonts.heading, fontSize: 48, fontWeight: 700, color: tokens.colors.accent }}>18%</div>
          <div style={{ fontFamily: tokens.fonts.body, fontSize: 18, color: tokens.colors.textMuted, alignSelf: "center" }}>of GDP</div>
        </div>
      </div>

      {/* Act 2 */}
      {frame >= T.andYet && (
        <div style={{ position: "absolute", inset: 100, display: "flex", flexDirection: "column", justifyContent: "center", opacity: turnOp }}>
          <div style={{ fontFamily: tokens.fonts.heading, fontSize: 48, fontWeight: 700, color: tokens.colors.text, marginBottom: 50 }}>And yet, Americans live shorter lives</div>
          {lifeData.map((d, i) => {
            const p = spring({ frame: frame - T.threeYears - i * 12, fps, config: { damping: 20, stiffness: 60 } });
            return (
              <div key={d.country} style={{ marginBottom: 24, opacity: p }}>
                <div style={{ fontFamily: tokens.fonts.body, fontSize: 16, color: tokens.colors.textMuted, textTransform: "uppercase", letterSpacing: 2, marginBottom: 6 }}>{d.country}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: (d.years / 90) * 600 * p, height: 36, backgroundColor: d.color }} />
                  {p > 0.8 && <div style={{ fontFamily: tokens.fonts.heading, fontSize: 36, fontWeight: 900, color: tokens.colors.text }}>{d.years} years</div>}
                </div>
              </div>
            );
          })}
          {frame >= T.how && (
            <div style={{ position: "absolute", right: 160, bottom: 180, fontFamily: tokens.fonts.heading, fontSize: 120, fontWeight: 900, color: tokens.colors.accent, opacity: howOp, transform: `scale(${Math.min(howScale, 1)})` }}>How?</div>
          )}
        </div>
      )}

      <div style={{ position: "absolute", bottom: 100, left: 100, fontFamily: tokens.fonts.body, fontSize: 14, color: tokens.colors.textLight }}>Source: CMS, WHO, OECD Health Statistics</div>
    </div>
  );
};
