import { useCurrentFrame, useVideoConfig, interpolate, spring, Audio, staticFile, Easing } from "remotion";
import { tokens } from "../tokens";

// Timing from scene03-decline.timing.json
// "In nineteen sixty-eight, the minimum wage hit its peak purchasing power..."
const T = { in1968: 0, peakPower: 30, thirteenDollars: 75, twiceAsMuch: 160, everyYear: 290, buysLess: 370 };

const data = [
  { year: "1968", value: 12.77 }, { year: "1975", value: 10.90 }, { year: "1980", value: 10.20 },
  { year: "1985", value: 8.50 }, { year: "1990", value: 7.80 }, { year: "1997", value: 8.40 },
  { year: "2000", value: 8.20 }, { year: "2007", value: 7.50 }, { year: "2009", value: 8.50 },
  { year: "2015", value: 7.80 }, { year: "2020", value: 7.40 }, { year: "2025", value: 6.50 },
];

const CL = 140, CT = 200, CW = 1640, CH = 500, MAX = 14;

export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleOp = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const lineProgress = interpolate(frame, [T.in1968, T.buysLess], [0, 1], { extrapolateRight: "clamp" });

  const pts = data.map((d, i) => ({
    x: CL + (i / (data.length - 1)) * CW,
    y: CT + CH - (d.value / MAX) * CH,
    ...d,
  }));
  const vis = Math.max(1, Math.ceil(pts.length * lineProgress));
  const path = pts.slice(0, vis).map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  // "$13 in today's money" callout at peak
  const peakOp = interpolate(frame, [T.thirteenDollars, T.thirteenDollars + 15], [0, 1], { extrapolateRight: "clamp" });
  // "twice as much" emphasis
  const twiceOp = interpolate(frame, [T.twiceAsMuch, T.twiceAsMuch + 15], [0, 1], { extrapolateRight: "clamp" });
  // Area fill under the decline
  const areaOp = interpolate(frame, [T.everyYear, T.everyYear + 30], [0, 0.15], { extrapolateRight: "clamp" });

  return (
    <div style={{ width: tokens.layout.width, height: tokens.layout.height, backgroundColor: tokens.colors.background, position: "relative" }}>
      <Audio src={staticFile("audio/scene03-decline.mp3")} />

      <div style={{ position: "absolute", top: 80, left: 100, opacity: titleOp }}>
        <div style={{ fontFamily: tokens.fonts.heading, fontSize: 44, fontWeight: 700, color: tokens.colors.text }}>Minimum wage purchasing power</div>
        <div style={{ fontFamily: tokens.fonts.body, fontSize: 20, color: tokens.colors.textMuted, marginTop: 4 }}>Inflation-adjusted to 2025 dollars</div>
      </div>

      <svg width={tokens.layout.width} height={tokens.layout.height} style={{ position: "absolute", top: 0, left: 0 }}>
        {/* Y-axis gridlines */}
        {[4, 6, 8, 10, 12, 14].map(v => {
          const y = CT + CH - (v / MAX) * CH;
          return <g key={v}>
            <line x1={CL} y1={y} x2={CL + CW} y2={y} stroke={tokens.colors.backgroundAlt} strokeWidth={1} />
            <text x={CL - 12} y={y + 5} textAnchor="end" fontFamily={tokens.fonts.body} fontSize={14} fill={tokens.colors.textLight}>${v}</text>
          </g>;
        })}
        <line x1={CL} y1={CT + CH} x2={CL + CW} y2={CT + CH} stroke={tokens.colors.textMuted} strokeWidth={1} />

        {/* Shaded area showing decline */}
        {vis >= 2 && <path d={`${path} L ${pts[vis - 1].x} ${CT + CH} L ${pts[0].x} ${CT + CH} Z`} fill={tokens.colors.accent} opacity={areaOp} />}

        {/* The line */}
        <path d={path} fill="none" stroke={tokens.colors.text} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />

        {/* Data dots */}
        {pts.slice(0, vis).map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={8} fill={tokens.colors.accent} />)}

        {/* X-axis labels */}
        {pts.slice(0, vis).filter((_, i) => i % 2 === 0).map(p => (
          <text key={p.year} x={p.x} y={CT + CH + 30} textAnchor="middle" fontFamily={tokens.fonts.body} fontSize={15} fill={tokens.colors.textMuted}>{p.year}</text>
        ))}

        {/* "$13" callout at 1968 peak */}
        <text x={pts[0].x + 20} y={pts[0].y - 20} fontFamily={tokens.fonts.heading} fontSize={40} fontWeight={900} fill={tokens.colors.text} opacity={peakOp}>~$13</text>

        {/* Current value callout */}
        {vis >= data.length && (
          <text x={pts[pts.length - 1].x - 20} y={pts[pts.length - 1].y - 20} textAnchor="end" fontFamily={tokens.fonts.heading} fontSize={36} fontWeight={900} fill={tokens.colors.accent} opacity={lineProgress}>$6.50</text>
        )}
      </svg>

      {/* "Twice as much" emphasis */}
      {frame >= T.twiceAsMuch && (
        <div style={{ position: "absolute", right: 120, top: 350, fontFamily: tokens.fonts.heading, fontSize: 36, fontWeight: 900, color: tokens.colors.accent, opacity: twiceOp, textAlign: "right" }}>
          A 1968 worker could<br />afford twice as much
        </div>
      )}

      <div style={{ position: "absolute", bottom: 80, left: 100, fontFamily: tokens.fonts.body, fontSize: 14, color: tokens.colors.textLight }}>Source: Bureau of Labor Statistics, CPI adjustment</div>
    </div>
  );
};
