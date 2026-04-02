import { useCurrentFrame, useVideoConfig, interpolate, spring, Audio, staticFile, Easing } from "remotion";
import { tokens } from "../tokens";

// "Compare this to other countries. Australia 11%, Netherlands 90%, Denmark..."
const T = { compare: 0, australia: 100, netherlands: 200, denmark: 280, america: 380 };

// Ranking data — pension coverage by country
const rankings = [
  { label: "Denmark", value: 98, highlight: false },
  { label: "Netherlands", value: 90, highlight: false },
  { label: "Australia", value: 85, highlight: false },
  { label: "Sweden", value: 80, highlight: false },
  { label: "Canada", value: 65, highlight: false },
  { label: "United Kingdom", value: 55, highlight: false },
  { label: "United States", value: 45, highlight: true },
];

export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOp = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  // ── RankingList with staggered bars ──
  const BAR_MAX = 900;

  // "America chose a different path" emphasis
  const choiceOp = interpolate(frame, [T.america, T.america + 15], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div style={{ width: tokens.layout.width, height: tokens.layout.height, backgroundColor: tokens.colors.background, position: "relative", padding: tokens.layout.padding }}>
      <Audio src={staticFile("audio/scene04.mp3")} />

      <div style={{ fontFamily: tokens.fonts.heading, fontSize: 40, fontWeight: 700, color: tokens.colors.text, opacity: titleOp }}>
        Retirement security by country
      </div>
      <div style={{ fontFamily: tokens.fonts.body, fontSize: 20, color: tokens.colors.textMuted, marginTop: 4, opacity: titleOp }}>
        % of workers covered by retirement plans
      </div>

      <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 16 }}>
        {rankings.map((r, i) => {
          const barDelay = 30 + i * 12;
          const barProgress = spring({ frame: frame - barDelay, fps, config: { damping: 20, stiffness: 50 } });
          const barWidth = (r.value / 100) * BAR_MAX * Math.min(barProgress, 1);
          const labelOp = interpolate(frame, [barDelay - 5, barDelay + 10], [0, 1], { extrapolateRight: "clamp" });

          return (
            <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 16, opacity: labelOp }}>
              {/* Rank number */}
              <div style={{ fontFamily: tokens.fonts.heading, fontSize: 20, fontWeight: 700, color: tokens.colors.textMuted, width: 30, textAlign: "right" }}>
                {i + 1}
              </div>
              {/* Country label */}
              <div style={{
                fontFamily: tokens.fonts.body, fontSize: 18,
                fontWeight: r.highlight ? 700 : 400,
                color: r.highlight ? tokens.colors.text : tokens.colors.textMuted,
                width: 160,
              }}>
                {r.label}
              </div>
              {/* Bar */}
              <div style={{
                width: barWidth, height: 28,
                backgroundColor: r.highlight ? tokens.colors.accent : (i < 3 ? "#27ae60" : "#5b7e96"),
              }} />
              {/* Value */}
              {Math.min(barProgress, 1) > 0.8 && (
                <div style={{
                  fontFamily: tokens.fonts.heading, fontSize: 22, fontWeight: 900,
                  color: r.highlight ? tokens.colors.accent : tokens.colors.text,
                }}>
                  {r.value}%
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* "America chose a different path" */}
      {frame >= T.america && (
        <div style={{
          position: "absolute", bottom: 180, right: tokens.layout.padding,
          fontFamily: tokens.fonts.heading, fontSize: 32, fontWeight: 900,
          color: tokens.colors.accent, opacity: choiceOp, textAlign: "right",
        }}>
          America chose<br />a different path.
        </div>
      )}

      <div style={{ position: "absolute", bottom: tokens.layout.padding, left: tokens.layout.padding, fontFamily: tokens.fonts.body, fontSize: 14, color: tokens.colors.textLight }}>
        Source: OECD Pensions at a Glance, 2023
      </div>
    </div>
  );
};
