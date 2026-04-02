import { useCurrentFrame, useVideoConfig, interpolate, spring, Audio, staticFile, Easing } from "remotion";
import { tokens } from "../tokens";

// "A generation ago, companies gave you a pension... Then in 1978, Congress created the 401k"
const T = { pension: 0, thenIn1978: 200, replaced: 370, riskShifted: 480 };

export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Act 1: CalendarFlip — years cycling from 1978 to 2025 ──
  const flipActive = frame >= T.thenIn1978 && frame < T.replaced;
  const yearRange = 2025 - 1978;
  const flipProgress = interpolate(frame, [T.thenIn1978, T.replaced - 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const currentYear = flipActive ? Math.round(1978 + yearRange * flipProgress) : (frame >= T.replaced ? 2025 : 1978);

  // Pension → 401k labels
  const pensionOp = interpolate(frame, [T.pension + 10, T.pension + 25], [0, 1], { extrapolateRight: "clamp" });
  const fourOhOneOp = interpolate(frame, [T.thenIn1978, T.thenIn1978 + 15], [0, 1], { extrapolateRight: "clamp" });

  // ── Act 2: SlopeChart — pension coverage decline ──
  const showSlope = frame >= T.riskShifted;
  const slopeOp = interpolate(frame, [T.riskShifted, T.riskShifted + 20], [0, 1], { extrapolateRight: "clamp" });

  // Slope data: pension coverage 60% → 4%, 401k coverage 0% → 55%
  const slopeProgress = spring({ frame: frame - T.riskShifted - 10, fps, config: { damping: 20, stiffness: 40 } });

  const slopeData = [
    { label: "Pension", start: 60, end: 4, color: tokens.colors.accent },
    { label: "401(k)", start: 0, end: 55, color: "#5b7e96" },
  ];

  const SLOPE_LEFT = 500;
  const SLOPE_RIGHT = 1400;
  const SLOPE_TOP = 250;
  const SLOPE_BOTTOM = 750;

  // Dim act 1 when act 2 starts
  const act1Dim = showSlope ? interpolate(frame, [T.riskShifted, T.riskShifted + 15], [1, 0], { extrapolateRight: "clamp" }) : 1;

  return (
    <div style={{ width: tokens.layout.width, height: tokens.layout.height, backgroundColor: tokens.colors.background, position: "relative" }}>
      <Audio src={staticFile("audio/scene02.mp3")} />

      {/* ═══ Act 1: Calendar + pension/401k labels ═══ */}
      <div style={{ position: "absolute", inset: 0, padding: tokens.layout.padding, opacity: act1Dim, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        {/* "PENSION" → "401(k)" labels */}
        <div style={{ display: "flex", gap: 60, marginBottom: 40 }}>
          <div style={{
            fontFamily: tokens.fonts.body, fontSize: 20, fontWeight: 600,
            color: tokens.colors.textMuted, textTransform: "uppercase", letterSpacing: 3,
            opacity: pensionOp, textDecoration: frame >= T.thenIn1978 ? "line-through" : "none",
          }}>
            Guaranteed Pension
          </div>
          {frame >= T.thenIn1978 && (
            <div style={{
              fontFamily: tokens.fonts.body, fontSize: 20, fontWeight: 600,
              color: tokens.colors.accent, textTransform: "uppercase", letterSpacing: 3,
              opacity: fourOhOneOp,
            }}>
              → 401(k) — You&apos;re on your own
            </div>
          )}
        </div>

        {/* Year display */}
        <div style={{
          fontFamily: tokens.fonts.heading, fontSize: 200, fontWeight: 900,
          color: flipActive ? tokens.colors.textMuted : tokens.colors.text,
          lineHeight: 1, transition: "color 0.1s",
        }}>
          {currentYear}
        </div>

        <div style={{
          fontFamily: tokens.fonts.body, fontSize: 24, color: tokens.colors.textMuted,
          marginTop: 20, opacity: pensionOp,
        }}>
          {frame < T.thenIn1978 ? "Companies provided lifetime income" : frame < T.replaced ? "Congress creates the 401(k)..." : "The risk shifted to workers"}
        </div>
      </div>

      {/* ═══ Act 2: Slope Chart ═══ */}
      {showSlope && (
        <div style={{ position: "absolute", inset: 0, opacity: slopeOp }}>
          <div style={{ position: "absolute", top: 80, left: 100, fontFamily: tokens.fonts.heading, fontSize: 40, fontWeight: 700, color: tokens.colors.text }}>
            The great pension vanishing act
          </div>

          <svg width={tokens.layout.width} height={tokens.layout.height} style={{ position: "absolute", top: 0, left: 0 }}>
            {/* Axis labels */}
            <text x={SLOPE_LEFT} y={SLOPE_TOP - 30} textAnchor="middle" fontFamily={tokens.fonts.heading} fontSize={28} fontWeight={700} fill={tokens.colors.text}>1980</text>
            <text x={SLOPE_RIGHT} y={SLOPE_TOP - 30} textAnchor="middle" fontFamily={tokens.fonts.heading} fontSize={28} fontWeight={700} fill={tokens.colors.text}>Today</text>

            {/* Axis lines */}
            <line x1={SLOPE_LEFT} y1={SLOPE_TOP} x2={SLOPE_LEFT} y2={SLOPE_BOTTOM} stroke={tokens.colors.backgroundAlt} strokeWidth={2} />
            <line x1={SLOPE_RIGHT} y1={SLOPE_TOP} x2={SLOPE_RIGHT} y2={SLOPE_BOTTOM} stroke={tokens.colors.backgroundAlt} strokeWidth={2} />

            {slopeData.map((d, i) => {
              const startY = SLOPE_TOP + ((100 - d.start) / 100) * (SLOPE_BOTTOM - SLOPE_TOP);
              const endY = SLOPE_TOP + ((100 - d.end) / 100) * (SLOPE_BOTTOM - SLOPE_TOP);
              const lineProgress = Math.min(slopeProgress, 1);
              const currentEndY = startY + (endY - startY) * lineProgress;

              return (
                <g key={d.label}>
                  {/* Line */}
                  <line x1={SLOPE_LEFT} y1={startY} x2={SLOPE_LEFT + (SLOPE_RIGHT - SLOPE_LEFT) * lineProgress} y2={currentEndY} stroke={d.color} strokeWidth={4} strokeLinecap="round" />

                  {/* Start dot + label */}
                  <circle cx={SLOPE_LEFT} cy={startY} r={8} fill={d.color} />
                  <text x={SLOPE_LEFT - 20} y={startY + 5} textAnchor="end" fontFamily={tokens.fonts.heading} fontSize={24} fontWeight={900} fill={d.color}>{d.start}%</text>
                  <text x={SLOPE_LEFT - 20} y={startY + 28} textAnchor="end" fontFamily={tokens.fonts.body} fontSize={16} fill={tokens.colors.textMuted}>{d.label}</text>

                  {/* End dot + label */}
                  {lineProgress > 0.9 && (
                    <>
                      <circle cx={SLOPE_RIGHT} cy={endY} r={8} fill={d.color} />
                      <text x={SLOPE_RIGHT + 20} y={endY + 5} fontFamily={tokens.fonts.heading} fontSize={24} fontWeight={900} fill={d.color}>{d.end}%</text>
                    </>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      )}

      <div style={{ position: "absolute", bottom: tokens.layout.padding, left: tokens.layout.padding, fontFamily: tokens.fonts.body, fontSize: 14, color: tokens.colors.textLight }}>
        Source: Bureau of Labor Statistics, Employee Benefits Survey
      </div>
    </div>
  );
};
