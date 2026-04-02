import { useCurrentFrame, useVideoConfig, interpolate, spring, Audio, Img, staticFile, Easing } from "remotion";
import { tokens } from "../tokens";

// Word-level timing synced to narration
// "Just twenty companies are responsible for a third of all carbon emissions since 1965.
//  The top three? Saudi Aramco, Chevron, and Exxon Mobil.
//  Together, they have emitted more than most countries."
const TIMING = {
  twenty: 0.43,         // "twenty companies"
  third: 2.52,          // "a third"
  since1965: 5.31,      // "since 1965"
  topThree: 6.47,       // "The top three?"
  saudiAramco: 8.28,    // "Saudi Aramco"
  chevron: 9.66,        // "Chevron"
  exxon: 10.82,         // "Exxon Mobil"
  moreThanCountries: 13.53, // "they have emitted more"
};

const T = Object.fromEntries(
  Object.entries(TIMING).map(([k, v]) => [k, Math.round(v * 30)])
) as Record<keyof typeof TIMING, number>;

// Collage images: oil refinery, corporate building
const COLLAGE = [
  { src: "oil-refinery.jpg", x: 1220, y: 60, w: 600, h: 360, rotate: -2.5, delay: 10 },
  { src: "corporate.jpg", x: 1280, y: 400, w: 540, h: 320, rotate: 3, delay: T.topThree },
];

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
  const twentyProgress = spring({ frame: frame - T.twenty, fps, config: { damping: 25, stiffness: 50 } });
  const thirdOp = interpolate(frame, [T.third, T.third + 15], [0, 1], { extrapolateRight: "clamp" });
  const showBubbles = frame >= T.topThree;
  const bubbleOp = interpolate(frame, [T.topThree, T.topThree + 20], [0, 1], { extrapolateRight: "clamp" });
  const statDim = showBubbles ? interpolate(frame, [T.topThree, T.topThree + 15], [1, 0], { extrapolateRight: "clamp" }) : 1;
  const maxVal = Math.max(...companies.map(c => c.value));

  return (
    <div style={{ width: tokens.layout.width, height: tokens.layout.height, backgroundColor: tokens.colors.background, position: "relative", padding: tokens.layout.padding }}>
      <Audio src={staticFile("audio/scene02.mp3")} />

      {/* Collage images — overlapping with drop shadows */}
      {COLLAGE.map((img, i) => {
        const p = Math.min(spring({ frame: frame - img.delay, fps, config: { damping: 18, stiffness: 50 } }), 1);
        return (
          <div key={img.src} style={{
            position: "absolute", left: img.x, top: img.y, width: img.w, height: img.h,
            transform: `rotate(${img.rotate}deg) scale(${0.85 + 0.15 * p})`,
            opacity: p * (showBubbles ? 0.4 : 1), boxShadow: "0 6px 24px rgba(0,0,0,0.2)", borderRadius: 6, overflow: "hidden",
            zIndex: i + 1,
            transition: "opacity 0.3s",
          }}>
            <Img src={staticFile("images/" + img.src)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.85)" }} />
          </div>
        );
      })}

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

        {frame >= T.third && (
          <div style={{ marginTop: 20, opacity: thirdOp, display: "flex", alignItems: "baseline", gap: 16 }}>
            <div style={{ fontFamily: tokens.fonts.heading, fontSize: 80, fontWeight: 900, color: tokens.colors.accent }}>
              &#x2153;
            </div>
            <div style={{ fontFamily: tokens.fonts.body, fontSize: 26, color: tokens.colors.textMuted }}>
              of all emissions since 1965
            </div>
          </div>
        )}
      </div>

      {/* Act 2: Bubble chart — synced to company names in narration */}
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
              // Stagger bubble entry synced to narration timing
              const companyDelay = i === 0 ? T.saudiAramco : i === 1 ? T.chevron : i === 2 ? T.exxon : T.moreThanCountries + (i - 3) * 8;
              const bubbleProgress = spring({ frame: frame - companyDelay, fps, config: { damping: 20, stiffness: 60 } });
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
