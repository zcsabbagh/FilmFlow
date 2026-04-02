import { useCurrentFrame, useVideoConfig, interpolate, spring, Audio, staticFile } from "remotion";
import { tokens } from "../tokens";

// "China 30%, US 14%. But per person, Americans 2x Chinese, 15x Indian"
const T = { china: 30, us: 120, butPerPerson: 220, fifteenTimes: 370 };

// Dumbbell-style: total vs per capita
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

  // Show total first, then transition to per capita
  const showPerCapita = frame >= T.butPerPerson;
  const transitionOp = interpolate(frame, [T.butPerPerson, T.butPerPerson + 20], [0, 1], { extrapolateRight: "clamp" });

  const BAR_MAX = 800;

  return (
    <div style={{ width: tokens.layout.width, height: tokens.layout.height, backgroundColor: tokens.colors.background, position: "relative", padding: tokens.layout.padding }}>
      <Audio src={staticFile("audio/scene03.mp3")} />

      <div style={{ fontFamily: tokens.fonts.heading, fontSize: 40, fontWeight: 700, color: tokens.colors.text, opacity: titleOp }}>
        {showPerCapita ? "Emissions per person (tonnes CO₂)" : "Share of global emissions"}
      </div>

      <div style={{ marginTop: 50, display: "flex", flexDirection: "column", gap: 28 }}>
        {countries.map((c, i) => {
          const barDelay = (showPerCapita ? T.butPerPerson + 10 : T.china) + i * 12;
          const barProgress = spring({ frame: frame - barDelay, fps, config: { damping: 20, stiffness: 50 } });

          // Which value to show
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
                <div style={{ width: barWidth, height: 32, backgroundColor: c.color }} />
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

      {/* "15x more" callout */}
      {frame >= T.fifteenTimes && (
        <div style={{
          position: "absolute", right: 150, bottom: 250,
          fontFamily: tokens.fonts.heading, fontSize: 48, fontWeight: 900,
          color: tokens.colors.accent,
          opacity: interpolate(frame, [T.fifteenTimes, T.fifteenTimes + 15], [0, 1], { extrapolateRight: "clamp" }),
        }}>
          15× more<br />
          <span style={{ fontFamily: tokens.fonts.body, fontSize: 22, fontWeight: 400, color: tokens.colors.textMuted }}>
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
