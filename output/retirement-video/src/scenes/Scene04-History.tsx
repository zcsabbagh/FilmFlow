import { useCurrentFrame, useVideoConfig, interpolate, spring, Audio, Img, staticFile, Easing } from "remotion";
import { tokens } from "../tokens";

// "In 1980, 60% had pension. Today 4%. 401k replaced them."
const T = { sixty: 20, today: 140, fourOhOne: 250, replaced: 350 };

export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Slope chart: pension coverage 60% → 4%
  const slopeP = spring({ frame: frame - T.sixty, fps, config: { damping: 25, stiffness: 35 } });
  const lineProgress = Math.min(slopeP, 1);

  // "4%" emphasis
  const fourOp = interpolate(frame, [T.today, T.today + 12], [0, 1], { extrapolateRight: "clamp" });
  const fourScale = spring({ frame: frame - T.today, fps, config: { damping: 12, stiffness: 100 } });

  // "401(k) replaced" text
  const replacedOp = interpolate(frame, [T.fourOhOne, T.fourOhOne + 15], [0, 1], { extrapolateRight: "clamp" });

  // Image panel slides in
  const imgOp = interpolate(frame, [T.replaced, T.replaced + 20], [0, 1], { extrapolateRight: "clamp" });

  const LEFT = 200, RIGHT = 700, TOP = 250, BOTTOM = 700;
  const startY = TOP + (1 - 0.6) * (BOTTOM - TOP);
  const endY = TOP + (1 - 0.04) * (BOTTOM - TOP);

  return (
    <div style={{ width: tokens.layout.width, height: tokens.layout.height, backgroundColor: tokens.colors.background, position: "relative", overflow: "hidden" }}>
      <Audio src={staticFile("audio/history.mp3")} />

      <div style={{ fontFamily: tokens.fonts.heading, fontSize: 38, fontWeight: 700, color: tokens.colors.text, position: "absolute", top: 80, left: 100, opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" }) }}>
        The pension vanishing act
      </div>

      {/* Slope line */}
      <svg width={900} height={800} style={{ position: "absolute", top: 0, left: 0 }}>
        {/* Axis labels */}
        <text x={LEFT} y={TOP - 20} textAnchor="middle" fontFamily={tokens.fonts.heading} fontSize={22} fontWeight={700} fill={tokens.colors.text}>1980</text>
        <text x={RIGHT} y={TOP - 20} textAnchor="middle" fontFamily={tokens.fonts.heading} fontSize={22} fontWeight={700} fill={tokens.colors.text}>Today</text>
        <line x1={LEFT} y1={TOP} x2={LEFT} y2={BOTTOM} stroke={tokens.colors.backgroundAlt} strokeWidth={2} />
        <line x1={RIGHT} y1={TOP} x2={RIGHT} y2={BOTTOM} stroke={tokens.colors.backgroundAlt} strokeWidth={2} />

        {/* The declining line */}
        <line x1={LEFT} y1={startY} x2={LEFT + (RIGHT - LEFT) * lineProgress} y2={startY + (endY - startY) * lineProgress} stroke={tokens.colors.accent} strokeWidth={5} strokeLinecap="round" />
        <circle cx={LEFT} cy={startY} r={10} fill={tokens.colors.accent} />

        {/* "60%" label */}
        <text x={LEFT - 20} y={startY + 6} textAnchor="end" fontFamily={tokens.fonts.heading} fontSize={32} fontWeight={900} fill={tokens.colors.text} opacity={slopeP > 0.1 ? 1 : 0}>60%</text>

        {/* "4%" label — punches in */}
        {lineProgress > 0.9 && (
          <>
            <circle cx={RIGHT} cy={endY} r={10} fill={tokens.colors.accent} />
            <text x={RIGHT + 20} y={endY + 6} fontFamily={tokens.fonts.heading} fontSize={48} fontWeight={900} fill={tokens.colors.accent} opacity={fourOp} transform={`scale(${Math.min(fourScale, 1)})`} style={{ transformOrigin: `${RIGHT + 20}px ${endY}px` }}>4%</text>
          </>
        )}
      </svg>

      {/* "401(k) replaced them" text */}
      {frame >= T.fourOhOne && (
        <div style={{ position: "absolute", bottom: 200, left: 100, maxWidth: 500, opacity: replacedOp }}>
          <div style={{ fontFamily: tokens.fonts.body, fontSize: 28, color: tokens.colors.text, fontWeight: 600 }}>
            The 401(k) was a supplement.
          </div>
          <div style={{ fontFamily: tokens.fonts.body, fontSize: 28, color: tokens.colors.accent, fontWeight: 600, marginTop: 8 }}>
            It became a replacement.
          </div>
        </div>
      )}

      {/* Image panel — medical bills */}
      {frame >= T.replaced && (
        <div style={{ position: "absolute", right: 0, top: 0, width: "40%", height: "100%", opacity: imgOp }}>
          <Img src={staticFile("images/medical-bills.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(30%)" }} />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, ${tokens.colors.background} 0%, transparent 25%)` }} />
        </div>
      )}

      <div style={{ position: "absolute", bottom: 80, left: 100, fontFamily: tokens.fonts.body, fontSize: 14, color: tokens.colors.textLight }}>Source: Bureau of Labor Statistics</div>
    </div>
  );
};
