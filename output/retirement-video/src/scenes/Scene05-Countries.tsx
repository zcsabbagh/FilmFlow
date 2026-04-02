import { useCurrentFrame, useVideoConfig, interpolate, spring, Audio, staticFile } from "remotion";
import { tokens } from "../tokens";

// "Denmark 98%, Netherlands 90%, Australia 85%, America 45%"
const T = { denmark: 20, netherlands: 90, australia: 160, america: 230 };

const data = [
  { name: "Denmark", value: 98, frame: T.denmark, color: "#27ae60" },
  { name: "Netherlands", value: 90, frame: T.netherlands, color: "#27ae60" },
  { name: "Australia", value: 85, frame: T.australia, color: "#5b7e96" },
  { name: "America", value: 45, frame: T.america, color: tokens.colors.accent },
];

export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div style={{ width: tokens.layout.width, height: tokens.layout.height, backgroundColor: tokens.colors.background, position: "relative", padding: tokens.layout.padding }}>
      <Audio src={staticFile("audio/comparison.mp3")} />

      <div style={{ fontFamily: tokens.fonts.heading, fontSize: 36, fontWeight: 700, color: tokens.colors.text, opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" }), marginBottom: 50 }}>
        Workers covered by retirement plans
      </div>

      {data.map((d, i) => {
        const barP = spring({ frame: frame - d.frame, fps, config: { damping: 20, stiffness: 50 } });
        const barW = (d.value / 100) * 1100 * Math.min(barP, 1);
        const op = interpolate(frame, [d.frame - 5, d.frame + 8], [0, 1], { extrapolateRight: "clamp" });
        const isAmerica = d.name === "America";

        return (
          <div key={d.name} style={{ marginBottom: 20, opacity: op }}>
            <div style={{ fontFamily: tokens.fonts.body, fontSize: 16, color: isAmerica ? tokens.colors.text : tokens.colors.textMuted, textTransform: "uppercase", letterSpacing: 2, marginBottom: 6, fontWeight: isAmerica ? 700 : 400 }}>
              {d.name}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: barW, height: isAmerica ? 44 : 36, backgroundColor: d.color }} />
              {Math.min(barP, 1) > 0.8 && (
                <div style={{ fontFamily: tokens.fonts.heading, fontSize: isAmerica ? 52 : 36, fontWeight: 900, color: d.color }}>
                  {d.value}%
                </div>
              )}
            </div>
          </div>
        );
      })}

      <div style={{ position: "absolute", bottom: 80, left: 100, fontFamily: tokens.fonts.body, fontSize: 14, color: tokens.colors.textLight }}>Source: OECD, 2023</div>
    </div>
  );
};
