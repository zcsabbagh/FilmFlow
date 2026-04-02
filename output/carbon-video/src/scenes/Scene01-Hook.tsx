import { useCurrentFrame, useVideoConfig, interpolate, spring, Audio, staticFile, Easing } from "remotion";
import { tokens } from "../tokens";

// "37 billion tonnes... 100 million a day... 1 million an hour... still going up"
const T = { thirtySevenB: 30, hundredM: 150, oneM: 250, goingUp: 350 };

export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Numbers cascade — each one appearing below the previous, getting smaller
  const numbers = [
    { value: 37, suffix: " billion", sub: "tonnes per year", frame: T.thirtySevenB, size: 140, color: tokens.colors.text },
    { value: 100, suffix: " million", sub: "tonnes per day", frame: T.hundredM, size: 90, color: tokens.colors.textMuted },
    { value: 1, suffix: " million", sub: "tonnes per hour", frame: T.oneM, size: 70, color: tokens.colors.textMuted },
  ];

  // "Still going up" with an animated arrow
  const arrowOp = interpolate(frame, [T.goingUp, T.goingUp + 15], [0, 1], { extrapolateRight: "clamp" });
  const arrowY = interpolate(frame, [T.goingUp, T.goingUp + 60], [0, -30], { extrapolateRight: "clamp" });

  return (
    <div style={{ width: tokens.layout.width, height: tokens.layout.height, backgroundColor: tokens.colors.background, position: "relative", padding: tokens.layout.padding }}>
      <Audio src={staticFile("audio/scene01.mp3")} />

      <div style={{ fontFamily: tokens.fonts.body, fontSize: 16, fontWeight: 600, color: tokens.colors.textMuted, textTransform: "uppercase", letterSpacing: 3, marginBottom: 20, opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" }) }}>
        Global CO₂ Emissions
      </div>

      {/* Cascading numbers */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 30 }}>
        {numbers.map((n, i) => {
          const progress = spring({ frame: frame - n.frame, fps, config: { damping: 25, stiffness: 50 } });
          const op = interpolate(frame, [n.frame - 5, n.frame + 10], [0, 1], { extrapolateRight: "clamp" });
          const slide = interpolate(frame, [n.frame, n.frame + 15], [20, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
          const val = Math.round(n.value * Math.min(progress, 1));
          // Dim previous numbers when next appears
          const dim = i < numbers.length - 1 && frame >= numbers[i + 1].frame
            ? interpolate(frame, [numbers[i + 1].frame, numbers[i + 1].frame + 15], [1, 0.3], { extrapolateRight: "clamp" })
            : 1;

          return (
            <div key={n.sub} style={{ opacity: op * dim, transform: `translateY(${slide}px)`, display: "flex", alignItems: "baseline", gap: 16 }}>
              <div style={{ fontFamily: tokens.fonts.heading, fontSize: n.size, fontWeight: 900, color: n.color, lineHeight: 1 }}>
                {val}{n.suffix}
              </div>
              <div style={{ fontFamily: tokens.fonts.body, fontSize: 22, color: tokens.colors.textMuted }}>
                {n.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* "Still going up" with arrow */}
      {frame >= T.goingUp && (
        <div style={{ position: "absolute", right: 200, bottom: 250, opacity: arrowOp, display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ fontFamily: tokens.fonts.heading, fontSize: 48, fontWeight: 900, color: "#c0392b" }}>
            Still going up
          </div>
          {/* Animated up arrow */}
          <svg width={60} height={80} style={{ transform: `translateY(${arrowY}px)` }}>
            <path d="M30 70 L30 20 M15 35 L30 15 L45 35" stroke="#c0392b" strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}

      <div style={{ position: "absolute", bottom: tokens.layout.padding, left: tokens.layout.padding, fontFamily: tokens.fonts.body, fontSize: 14, color: tokens.colors.textLight }}>
        Source: Global Carbon Project, 2024
      </div>
    </div>
  );
};
