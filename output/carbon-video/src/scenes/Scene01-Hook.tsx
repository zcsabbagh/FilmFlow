import { useCurrentFrame, useVideoConfig, interpolate, spring, Audio, Img, staticFile, Easing } from "remotion";
import { tokens } from "../tokens";

// Word-level timing from ElevenLabs (in seconds)
// "Thirty-seven billion tonnes of carbon dioxide. Every single year.
//  One hundred million tonnes a day. Over a million tonnes, every hour.
//  And the number is still going up."
const TIMING = {
  thirtySeven: 0.0,    // "Thirty-seven"
  billion: 1.07,       // "billion"
  tonnes: 1.70,        // "tonnes"
  everySingle: 4.52,   // "Every single year"
  oneHundred: 6.68,    // "One hundred million"
  million: 7.73,       // "million"
  tonnesDay: 8.21,     // "tonnes a day"
  overMillion: 9.56,   // "Over a million"
  everyHour: 10.87,    // "every hour"
  stillGoingUp: 12.23, // "And the number is still going up"
};

// Convert seconds to frames at 30fps
const T = Object.fromEntries(
  Object.entries(TIMING).map(([k, v]) => [k, Math.round(v * 30)])
) as Record<keyof typeof TIMING, number>;

// Collage images for this scene — smokestacks and coal plants
const COLLAGE = [
  { src: "smokestacks.jpg", x: 1250, y: 50, w: 580, h: 350, rotate: 3, delay: 15 },
  { src: "coal-plant.jpg", x: 1300, y: 380, w: 520, h: 310, rotate: -2.5, delay: 60 },
];

const numbers = [
  { value: 37, suffix: " billion", sub: "tonnes per year", frame: T.thirtySeven, size: 140, color: tokens.colors.text },
  { value: 100, suffix: " million", sub: "tonnes per day", frame: T.oneHundred, size: 90, color: tokens.colors.textMuted },
  { value: 1, suffix: " million", sub: "tonnes per hour", frame: T.overMillion, size: 70, color: tokens.colors.textMuted },
];

export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const arrowOp = interpolate(frame, [T.stillGoingUp, T.stillGoingUp + 15], [0, 1], { extrapolateRight: "clamp" });
  const arrowY = interpolate(frame, [T.stillGoingUp, T.stillGoingUp + 60], [0, -30], { extrapolateRight: "clamp" });

  return (
    <div style={{ width: tokens.layout.width, height: tokens.layout.height, backgroundColor: tokens.colors.background, position: "relative", padding: tokens.layout.padding }}>
      <Audio src={staticFile("audio/scene01.mp3")} />

      {/* Collage images — overlapping, tilted with drop shadows */}
      {COLLAGE.map((img, i) => {
        const p = Math.min(spring({ frame: frame - img.delay, fps, config: { damping: 18, stiffness: 50 } }), 1);
        return (
          <div key={img.src} style={{
            position: "absolute", left: img.x, top: img.y, width: img.w, height: img.h,
            transform: `rotate(${img.rotate}deg) scale(${0.85 + 0.15 * p})`,
            opacity: p, boxShadow: "0 6px 24px rgba(0,0,0,0.25)", borderRadius: 6, overflow: "hidden",
            zIndex: i + 5,
          }}>
            <Img src={staticFile("images/" + img.src)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.8)" }} />
          </div>
        );
      })}

      <div style={{
        fontFamily: tokens.fonts.body, fontSize: 16, fontWeight: 600,
        color: tokens.colors.textMuted, textTransform: "uppercase", letterSpacing: 3,
        marginBottom: 20,
        opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" }),
      }}>
        Global CO₂ Emissions
      </div>

      {/* Cascading numbers — synced to word timing */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 30 }}>
        {numbers.map((n, i) => {
          const progress = spring({ frame: frame - n.frame, fps, config: { damping: 25, stiffness: 50 } });
          const op = interpolate(frame, [n.frame - 5, n.frame + 10], [0, 1], { extrapolateRight: "clamp" });
          const slide = interpolate(frame, [n.frame, n.frame + 15], [20, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
          const val = Math.round(n.value * Math.min(progress, 1));
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

      {/* "Still going up" with arrow — synced to narration */}
      {frame >= T.stillGoingUp && (
        <div style={{ position: "absolute", left: 120, bottom: 200, opacity: arrowOp, display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ fontFamily: tokens.fonts.heading, fontSize: 48, fontWeight: 900, color: "#c0392b" }}>
            Still going up
          </div>
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
