import { useCurrentFrame, useVideoConfig, interpolate, spring, Audio, Img, staticFile, Easing } from "remotion";
import { tokens } from "../tokens";

// "$212K median... 7 years... half have less"
const T = { median: 0, twoTwelve: 30, sevenYears: 180, halfLess: 280 };

export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgOp = interpolate(frame, [0, 20], [0, 0.12], { extrapolateRight: "clamp" });
  const tickerP = spring({ frame: frame - T.twoTwelve, fps, config: { damping: 30, stiffness: 40 } });

  // "7 years" — image of elderly person slides in from right
  const imgOp = interpolate(frame, [T.sevenYears - 10, T.sevenYears + 10], [0, 1], { extrapolateRight: "clamp" });
  const imgSlide = interpolate(frame, [T.sevenYears - 10, T.sevenYears + 10], [60, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

  // "Half have even less" punch
  const halfOp = interpolate(frame, [T.halfLess, T.halfLess + 12], [0, 1], { extrapolateRight: "clamp" });
  const halfScale = spring({ frame: frame - T.halfLess, fps, config: { damping: 12, stiffness: 120 } });

  return (
    <div style={{ width: tokens.layout.width, height: tokens.layout.height, backgroundColor: tokens.colors.background, position: "relative", overflow: "hidden" }}>
      <Audio src={staticFile("audio/stats.mp3")} />

      {/* Background image — faded piggy bank */}
      <Img src={staticFile("images/empty-savings.jpg")} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", opacity: bgOp, filter: "grayscale(80%)" }} />

      {/* "$212,000" — big reveal with label */}
      <div style={{ position: "absolute", top: 120, left: 100 }}>
        <div style={{ fontFamily: tokens.fonts.body, fontSize: 16, fontWeight: 600, color: tokens.colors.textMuted, textTransform: "uppercase", letterSpacing: 3, marginBottom: 12, opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" }) }}>
          Median retirement savings, age 60-64
        </div>
        <div style={{ fontFamily: tokens.fonts.heading, fontSize: 140, fontWeight: 900, color: tokens.colors.text, lineHeight: 1 }}>
          ${Math.round(212000 * Math.min(tickerP, 1)).toLocaleString()}
        </div>
      </div>

      {/* "7 years" — right side with image */}
      {frame >= T.sevenYears && (
        <div style={{ position: "absolute", right: 0, top: 0, width: "45%", height: "100%", opacity: imgOp, transform: `translateX(${imgSlide}px)` }}>
          <Img src={staticFile("images/elderly-working.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(40%)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, " + tokens.colors.background + " 0%, transparent 30%)" }} />
          <div style={{ position: "absolute", bottom: 80, left: 40, fontFamily: tokens.fonts.heading, fontSize: 48, fontWeight: 900, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
            7 years<br /><span style={{ fontSize: 24, fontWeight: 400, fontFamily: tokens.fonts.body }}>of expenses</span>
          </div>
        </div>
      )}

      {/* "Half have even less" */}
      {frame >= T.halfLess && (
        <div style={{ position: "absolute", bottom: 160, left: 100, fontFamily: tokens.fonts.heading, fontSize: 44, fontWeight: 900, color: tokens.colors.accent, opacity: halfOp, transform: `scale(${Math.min(halfScale, 1)})` }}>
          Half have even less.
        </div>
      )}

      <div style={{ position: "absolute", bottom: 80, left: 100, fontFamily: tokens.fonts.body, fontSize: 14, color: tokens.colors.textLight }}>Source: Federal Reserve, 2022</div>
    </div>
  );
};
