import { useCurrentFrame, interpolate, useVideoConfig } from "remotion";
import { tokens } from "../tokens";

export type LineChartPoint = { x: string | number; y: number };

type Props = { data: LineChartPoint[]; title?: string; caption?: string; color?: string };

export const AnimatedLineChart: React.FC<Props> = ({ data, title, caption, color = tokens.colors.accent }) => {
  const frame = useCurrentFrame();
  const chartWidth = tokens.layout.width - tokens.layout.padding * 2 - 100;
  const chartHeight = 500;
  const maxY = Math.max(...data.map((d) => d.y));
  const minY = Math.min(...data.map((d) => d.y));
  const range = maxY - minY || 1;
  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * chartWidth + 100,
    y: chartHeight - ((d.y - minY) / range) * chartHeight + 80,
  }));
  const progress = interpolate(frame, [10, 10 + data.length * 3], [0, 1], { extrapolateRight: "clamp" });
  const pathData = points.slice(0, Math.ceil(points.length * progress)).map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div style={{ width: tokens.layout.width, height: tokens.layout.height, backgroundColor: tokens.colors.background, padding: tokens.layout.padding, fontFamily: tokens.fonts.body, color: tokens.colors.text, position: "relative" }}>
      {title && <div style={{ fontSize: 42, fontWeight: 700, marginBottom: 20, opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" }) }}>{title}</div>}
      <svg width={chartWidth + 100} height={chartHeight + 80}>
        <path d={pathData} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" />
        {points.slice(0, Math.ceil(points.length * progress)).map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={4} fill={color} />
        ))}
      </svg>
      {caption && <div style={{ fontSize: 16, color: tokens.colors.textMuted, position: "absolute", bottom: tokens.layout.padding, opacity: interpolate(frame, [20, 35], [0, 1], { extrapolateRight: "clamp" }) }}>{caption}</div>}
    </div>
  );
};
