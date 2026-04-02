import { useCurrentFrame, useVideoConfig, interpolate, spring, Audio, Img, staticFile } from "remotion";
import { tokens } from "../tokens";

/**
 * Scene 07 — Country comparison with collage
 * "Denmark 98%, Netherlands 90%, Australia 85%, America 45%"
 * Duration: 231 frames (7.7s) — narration is 6.73s + buffer
 */

// Word timing (1.35x speed)
const W = {
  denmark: 0.0,
  ninetyEight: 0.69,
  netherlands: 2.31,
  ninety: 2.82,
  australia: 3.89,
  eightyFive: 4.41,
  america: 5.30,
  fortyFive: 5.90,
};

const data = [
  { name: "Denmark", value: 98, startTime: W.denmark, color: "#27ae60" },
  { name: "Netherlands", value: 90, startTime: W.netherlands, color: "#27ae60" },
  { name: "Australia", value: 85, startTime: W.australia, color: "#5b7e96" },
  { name: "America", value: 45, startTime: W.america, color: tokens.colors.accent },
];

export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  return (
    <div style={{
      width: tokens.layout.width, height: tokens.layout.height,
      backgroundColor: tokens.colors.background,
      position: "relative", overflow: "hidden",
      padding: tokens.layout.padding,
    }}>
      <Audio src={staticFile("audio/comparison.mp3")} />

      {/* Collage images — tilted flags/symbols in background */}
      <Img
        src={staticFile("images/american-flag.jpg")}
        style={{
          position: "absolute", right: -20, top: 40,
          width: 480, height: 340, objectFit: "cover",
          borderRadius: 14, transform: "rotate(3deg)",
          boxShadow: "0 8px 28px rgba(0,0,0,0.2)",
          opacity: 0.18, filter: "grayscale(50%)",
          border: "3px solid rgba(255,255,255,0.3)",
        }}
      />
      <Img
        src={staticFile("images/elderly-couple.jpg")}
        style={{
          position: "absolute", right: 40, bottom: 20,
          width: 420, height: 300, objectFit: "cover",
          borderRadius: 14, transform: "rotate(-2deg)",
          boxShadow: "0 8px 28px rgba(0,0,0,0.2)",
          opacity: 0.15, filter: "grayscale(60%)",
          border: "3px solid rgba(255,255,255,0.3)",
        }}
      />

      {/* Title */}
      <div style={{
        fontFamily: tokens.fonts.heading, fontSize: 36, fontWeight: 700,
        color: tokens.colors.text,
        opacity: interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" }),
        marginBottom: 50,
      }}>
        Workers covered by retirement plans
      </div>

      {/* Bar chart — synced to word timing */}
      {data.map((d, i) => {
        const startFrame = Math.round(d.startTime * fps);
        const barP = spring({ frame: frame - startFrame, fps, config: { damping: 20, stiffness: 50 } });
        const barW = (d.value / 100) * 1000 * Math.min(barP, 1);
        const op = interpolate(frame, [startFrame - 3, startFrame + 8], [0, 1], { extrapolateRight: "clamp" });
        const isAmerica = d.name === "America";

        return (
          <div key={d.name} style={{ marginBottom: 22, opacity: op }}>
            <div style={{
              fontFamily: tokens.fonts.body, fontSize: 16,
              color: isAmerica ? tokens.colors.text : tokens.colors.textMuted,
              textTransform: "uppercase", letterSpacing: 2, marginBottom: 6,
              fontWeight: isAmerica ? 700 : 400,
            }}>
              {d.name}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{
                width: barW, height: isAmerica ? 48 : 38,
                backgroundColor: d.color,
                borderRadius: 0,
              }} />
              {Math.min(barP, 1) > 0.8 && (
                <div style={{
                  fontFamily: tokens.fonts.heading,
                  fontSize: isAmerica ? 56 : 38,
                  fontWeight: 900, color: d.color,
                }}>
                  {d.value}%
                </div>
              )}
            </div>
          </div>
        );
      })}

      <div style={{ position: "absolute", bottom: 60, left: 100, fontFamily: tokens.fonts.body, fontSize: 14, color: tokens.colors.textLight }}>
        Source: OECD, 2023
      </div>
    </div>
  );
};
