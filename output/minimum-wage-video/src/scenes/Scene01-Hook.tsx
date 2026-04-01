import { useCurrentFrame, useVideoConfig, interpolate, spring, Audio, Img, staticFile, Easing } from "remotion";
import { tokens } from "../tokens";

// Timing from scene01-hook.timing.json
const T = { seven: 0, twentyFive: 10, federal: 30, setIn2009: 60, rentDoubled: 125, healthcareTripled: 173, college: 216, frozen: 301, sixteenYears: 335 };

export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bgOp = interpolate(frame, [0, 25], [0, 0.15], { extrapolateRight: "clamp" });
  const priceProgress = spring({ frame: frame - T.seven, fps, config: { damping: 30, stiffness: 50 } });

  // Cost increases appear one by one
  const costs = [
    { label: "Rent", change: "+100%", frame: T.rentDoubled, color: tokens.colors.accent },
    { label: "Healthcare", change: "+200%", frame: T.healthcareTripled, color: "#c0392b" },
    { label: "College", change: "+50%", frame: T.college, color: "#5b7e96" },
  ];

  const frozenOp = interpolate(frame, [T.frozen, T.frozen + 15], [0, 1], { extrapolateRight: "clamp" });
  const frozenScale = spring({ frame: frame - T.frozen, fps, config: { damping: 12, stiffness: 100 } });

  return (
    <div style={{ width: tokens.layout.width, height: tokens.layout.height, backgroundColor: tokens.colors.background, position: "relative", overflow: "hidden" }}>
      <Audio src={staticFile("audio/scene01-hook.mp3")} />
      <Img src={staticFile("images/worker-bg.jpg")} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", opacity: bgOp, filter: "grayscale(80%)" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${tokens.colors.backgroundAlt}44 1px, transparent 1px), linear-gradient(90deg, ${tokens.colors.backgroundAlt}44 1px, transparent 1px)`, backgroundSize: "60px 60px", opacity: 0.2 }} />

      <div style={{ position: "absolute", top: 80, left: 100 }}>
        <div style={{ fontFamily: tokens.fonts.body, fontSize: 16, fontWeight: 600, color: tokens.colors.textMuted, textTransform: "uppercase", letterSpacing: 3, marginBottom: 16 }}>Federal Minimum Wage</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
          <div style={{ fontFamily: tokens.fonts.heading, fontSize: 180, fontWeight: 900, color: tokens.colors.text, lineHeight: 1 }}>
            ${(7.25 * priceProgress).toFixed(2)}
          </div>
          <div style={{ fontFamily: tokens.fonts.body, fontSize: 28, color: tokens.colors.textMuted }}>/hour</div>
        </div>
        <div style={{ fontFamily: tokens.fonts.body, fontSize: 22, color: tokens.colors.textMuted, marginTop: 8, opacity: interpolate(frame, [T.setIn2009, T.setIn2009 + 15], [0, 1], { extrapolateRight: "clamp" }) }}>
          Set in 2009. Never updated.
        </div>
      </div>

      {/* Cost increases — right side */}
      <div style={{ position: "absolute", top: 100, right: 100, display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ fontFamily: tokens.fonts.body, fontSize: 16, color: tokens.colors.textMuted, textTransform: "uppercase", letterSpacing: 2, opacity: interpolate(frame, [T.rentDoubled - 10, T.rentDoubled], [0, 1], { extrapolateRight: "clamp" }) }}>
          Since 2009
        </div>
        {costs.map((c) => {
          const op = interpolate(frame, [c.frame, c.frame + 12], [0, 1], { extrapolateRight: "clamp" });
          const slide = interpolate(frame, [c.frame, c.frame + 12], [15, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
          return (
            <div key={c.label} style={{ opacity: op, transform: `translateY(${slide}px)`, display: "flex", alignItems: "baseline", gap: 12 }}>
              <div style={{ fontFamily: tokens.fonts.heading, fontSize: 56, fontWeight: 900, color: c.color }}>{c.change}</div>
              <div style={{ fontFamily: tokens.fonts.body, fontSize: 20, color: tokens.colors.textMuted }}>{c.label}</div>
            </div>
          );
        })}
      </div>

      {/* "FROZEN" emphasis */}
      {frame >= T.frozen && (
        <div style={{ position: "absolute", bottom: 160, left: 100, right: 100, textAlign: "center" }}>
          <div style={{ fontFamily: tokens.fonts.heading, fontSize: 80, fontWeight: 900, color: tokens.colors.accent, opacity: frozenOp, transform: `scale(${Math.min(frozenScale, 1)})` }}>
            Frozen for {Math.round(16 * frozenOp)} years
          </div>
        </div>
      )}

      <div style={{ position: "absolute", bottom: 80, left: 100, fontFamily: tokens.fonts.body, fontSize: 14, color: tokens.colors.textLight }}>Source: US Department of Labor, BLS</div>
    </div>
  );
};
