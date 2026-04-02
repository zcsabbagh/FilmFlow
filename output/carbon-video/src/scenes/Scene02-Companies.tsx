import { useCurrentFrame, useVideoConfig, interpolate, spring, Audio, staticFile, Easing } from "remotion";
import { tokens } from "../tokens";

// "Just 20 companies responsible for a third... top 3: Saudi Aramco, Chevron, ExxonMobil"
const T = { twenty: 30, oneThird: 120, topThree: 250, moreThanCountries: 380 };

// BubbleScale data — top emitters sized by cumulative emissions
const companies = [
  { name: "Saudi Aramco", value: 59.26, color: "#2c3e50" },
  { name: "Chevron", value: 43.35, color: "#5b7e96" },
  { name: "ExxonMobil", value: 41.90, color: tokens.colors.accent },
  { name: "BP", value: 34.02, color: "#7f8c8d" },
  { name: "Gazprom", value: 43.23, color: "#27ae60" },
];

export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOp = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  // "20 companies" stat
  const twentyProgress = spring({ frame: frame - T.twenty, fps, config: { damping: 25, stiffness: 50 } });

  // "1/3 of all emissions" — waffle-like visualization
  const thirdOp = interpolate(frame, [T.oneThird, T.oneThird + 15], [0, 1], { extrapolateRight: "clamp" });

  // Bubble chart for top companies
  const showBubbles = frame >= T.topThree;
  const bubbleOp = interpolate(frame, [T.topThree, T.topThree + 20], [0, 1], { extrapolateRight: "clamp" });

  // Dim the initial stat when bubbles appear
  const statDim = showBubbles ? interpolate(frame, [T.topThree, T.topThree + 15], [1, 0], { extrapolateRight: "clamp" }) : 1;

  const maxVal = Math.max(...companies.map(c => c.value));

  return (
    <div style={{ width: tokens.layout.width, height: tokens.layout.height, backgroundColor: tokens.colors.background, position: "relative", padding: tokens.layout.padding }}>
      <Audio src={staticFile("audio/scene02.mp3")} />

      {/* Act 1: "20 companies = 1/3 of emissions" */}
      <div style={{ opacity: statDim }}>
        <div style={{ fontFamily: tokens.fonts.heading, fontSize: 40, fontWeight: 700, color: tokens.colors.text, opacity: titleOp }}>
          The corporate carbon footprint
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: 20, marginTop: 60 }}>
          <div style={{ fontFamily: tokens.fonts.heading, fontSize: 160, fontWeight: 900, color: tokens.colors.text, lineHeight: 1 }}>
            {Math.round(20 * Math.min(twentyProgress, 1))}
          </div>
          <div style={{ fontFamily: tokens.fonts.body, fontSize: 28, color: tokens.colors.textMuted }}>
            companies
          </div>
        </div>

        {frame >= T.oneThird && (
          <div style={{ marginTop: 20, opacity: thirdOp, display: "flex", alignItems: "baseline", gap: 16 }}>
            <div style={{ fontFamily: tokens.fonts.heading, fontSize: 80, fontWeight: 900, color: tokens.colors.accent }}>
              ⅓
            </div>
            <div style={{ fontFamily: tokens.fonts.body, fontSize: 26, color: tokens.colors.textMuted }}>
              of all emissions since 1965
            </div>
          </div>
        )}
      </div>

      {/* Act 2: Bubble chart — top emitters */}
      {showBubbles && (
        <div style={{ position: "absolute", inset: 0, padding: tokens.layout.padding, opacity: bubbleOp }}>
          <div style={{ fontFamily: tokens.fonts.heading, fontSize: 36, fontWeight: 700, color: tokens.colors.text, marginBottom: 30 }}>
            Top corporate emitters
          </div>
          <div style={{ fontFamily: tokens.fonts.body, fontSize: 18, color: tokens.colors.textMuted, marginBottom: 40 }}>
            Cumulative CO₂ emissions (billion tonnes)
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 40, marginTop: 20 }}>
            {companies.map((c, i) => {
              const bubbleProgress = spring({ frame: frame - T.topThree - i * 15, fps, config: { damping: 20, stiffness: 60 } });
              const radius = Math.sqrt(c.value / maxVal) * 120;
              const size = radius * 2 * Math.min(bubbleProgress, 1);

              return (
                <div key={c.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: Math.min(bubbleProgress, 1) }}>
                  <div style={{
                    width: size, height: size, borderRadius: "50%",
                    backgroundColor: c.color, display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {Math.min(bubbleProgress, 1) > 0.8 && (
                      <div style={{ fontFamily: tokens.fonts.heading, fontSize: Math.max(16, radius * 0.35), fontWeight: 900, color: "#fff" }}>
                        {c.value.toFixed(1)}
                      </div>
                    )}
                  </div>
                  <div style={{ fontFamily: tokens.fonts.body, fontSize: 16, color: tokens.colors.textMuted, marginTop: 10, textAlign: "center", maxWidth: 120 }}>
                    {c.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ position: "absolute", bottom: tokens.layout.padding, left: tokens.layout.padding, fontFamily: tokens.fonts.body, fontSize: 14, color: tokens.colors.textLight }}>
        Source: Carbon Majors Report, Climate Accountability Institute
      </div>
    </div>
  );
};
