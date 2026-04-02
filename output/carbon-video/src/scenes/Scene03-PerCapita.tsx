import { useCurrentFrame, useVideoConfig, interpolate, spring, Audio, Img, staticFile } from "remotion";
import { tokens } from "../tokens";

// Word-level timing synced to narration
// "China emits thirty percent of the world's carbon. America, fourteen percent.
//  But per person, Americans produce twice as much as the Chinese,
//  and fifteen times more than the average Indian."
const TIMING = {
  china: 0.0,           // "China emits"
  thirtyPercent: 1.61,  // "thirty percent"
  america: 4.32,        // "America, fourteen percent"
  butPerPerson: 7.08,   // "But per person"
  americans: 9.09,      // "Americans produce twice"
  fifteenTimes: 12.67,  // "fifteen times more"
  averageIndian: 15.05, // "the average Indian"
};

const T = Object.fromEntries(
  Object.entries(TIMING).map(([k, v]) => [k, Math.round(v * 30)])
) as Record<keyof typeof TIMING, number>;

// Collage images: China smog, American suburbs
const COLLAGE = [
  { src: "china-smog.jpg", x: 1220, y: 50, w: 600, h: 360, rotate: -2, delay: 5 },
  { src: "american-suburb.jpg", x: 1260, y: 380, w: 560, h: 340, rotate: 3.5, delay: T.america },
];

const countries = [
  { name: "United States", total: 14, perCapita: 15.5, color: tokens.colors.accent },
  { name: "China", total: 30, perCapita: 7.7, color: "#c0392b" },
  { name: "EU", total: 7, perCapita: 6.1, color: "#5b7e96" },
  { name: "India", total: 7, perCapita: 1.9, color: "#27ae60" },
];

export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOp = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const showPerCapita = frame >= T.butPerPerson;
  const BAR_MAX = 700;

  return (
    <div style={{ width: tokens.layout.width, height: tokens.layout.height, backgroundColor: tokens.colors.background, position: "relative", padding: tokens.layout.padding }}>
      <Audio src={staticFile("audio/scene03.mp3")} />

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
            <Img src={staticFile("images/" + img.src)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.8)" }} />
          </div>
        );
      })}

      <div style={{ fontFamily: tokens.fonts.heading, fontSize: 40, fontWeight: 700, color: tokens.colors.text, opacity: titleOp }}>
        {showPerCapita ? "Emissions per person (tonnes CO₂)" : "Share of global emissions"}
      </div>

      <div style={{ marginTop: 50, display: "flex", flexDirection: "column", gap: 28 }}>
        {countries.map((c, i) => {
          // Sync bar appearance to word timing
          const barDelay = showPerCapita
            ? T.butPerPerson + 10 + i * 12
            : (i === 0 ? T.america : T.china) + i * 12;
          const barProgress = spring({ frame: frame - barDelay, fps, config: { damping: 20, stiffness: 50 } });
          const value = showPerCapita ? c.perCapita : c.total;
          const maxVal = showPerCapita ? 18 : 35;
          const barWidth = (value / maxVal) * BAR_MAX * Math.min(barProgress, 1);
          const op = interpolate(frame, [barDelay - 5, barDelay + 8], [0, 1], { extrapolateRight: "clamp" });

          return (
            <div key={c.name} style={{ opacity: op }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 4 }}>
                <div style={{ fontFamily: tokens.fonts.body, fontSize: 18, color: tokens.colors.text, width: 160, fontWeight: i === 0 ? 700 : 400 }}>
                  {c.name}
                </div>
                <div style={{ width: barWidth, height: 32, backgroundColor: c.color, borderRadius: 2 }} />
                {Math.min(barProgress, 1) > 0.8 && (
                  <div style={{ fontFamily: tokens.fonts.heading, fontSize: 28, fontWeight: 900, color: c.color }}>
                    {showPerCapita ? value.toFixed(1) + "t" : value + "%"}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* "15x more" callout — synced to narration */}
      {frame >= T.fifteenTimes && (
        <div style={{
          position: "absolute", left: 120, bottom: 220,
          fontFamily: tokens.fonts.heading, fontSize: 52, fontWeight: 900,
          color: tokens.colors.accent,
          opacity: interpolate(frame, [T.fifteenTimes, T.fifteenTimes + 15], [0, 1], { extrapolateRight: "clamp" }),
          transform: `scale(${Math.min(spring({ frame: frame - T.fifteenTimes, fps, config: { damping: 12, stiffness: 100 } }), 1)})`,
        }}>
          15x more<br />
          <span style={{ fontFamily: tokens.fonts.body, fontSize: 24, fontWeight: 400, color: tokens.colors.textMuted }}>
            than the average Indian
          </span>
        </div>
      )}

      <div style={{ position: "absolute", bottom: tokens.layout.padding, left: tokens.layout.padding, fontFamily: tokens.fonts.body, fontSize: 14, color: tokens.colors.textLight }}>
        Source: Global Carbon Atlas, Our World in Data
      </div>
    </div>
  );
};
