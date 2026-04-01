import { useCurrentFrame, interpolate, useVideoConfig } from "remotion";
import { tokens } from "../tokens";

export type LineChartPoint = { x: string | number; y: number; label?: string };

type Props = {
  data: LineChartPoint[];
  title?: string;
  caption?: string;
  source?: string;
  color?: string;
};

export const AnimatedLineChart: React.FC<Props> = ({
  data,
  title,
  caption,
  source,
  color = tokens.colors.text,
}) => {
  const frame = useCurrentFrame();
  const chartWidth = tokens.layout.width - tokens.layout.padding * 2 - 100;
  const chartHeight = 500;
  const maxY = Math.max(...data.map((d) => d.y));
  const minY = Math.min(...data.map((d) => d.y));
  const range = maxY - minY || 1;
  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * chartWidth + 100,
    y: chartHeight - ((d.y - minY) / range) * chartHeight + 80,
    label: d.label,
    rawY: d.y,
  }));
  const progress = interpolate(frame, [10, 10 + data.length * 3], [0, 1], { extrapolateRight: "clamp" });
  const visibleCount = Math.ceil(points.length * progress);
  const pathData = points
    .slice(0, visibleCount)
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  return (
    <div
      style={{
        width: tokens.layout.width,
        height: tokens.layout.height,
        backgroundColor: tokens.colors.background,
        padding: tokens.layout.padding,
        fontFamily: tokens.fonts.body,
        color: tokens.colors.text,
        position: "relative",
      }}
    >
      {title && (
        <div
          style={{
            fontSize: 46,
            fontWeight: tokens.fontWeights.bold,
            fontFamily: tokens.fonts.heading,
            color: tokens.colors.primary,
            marginBottom: 20,
            opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          {title}
        </div>
      )}

      <svg width={chartWidth + 100} height={chartHeight + 80}>
        {/* Thick dark line like Vox */}
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth={tokens.chart.lineWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Salmon dots at data points */}
        {points.slice(0, visibleCount).map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={tokens.chart.dotRadius}
            fill={tokens.colors.accent}
          />
        ))}

        {/* Call-out labels at key data points */}
        {points.slice(0, visibleCount).map((p, i) => {
          if (!p.label) return null;
          const labelOpacity = interpolate(
            frame,
            [10 + i * 3, 10 + i * 3 + 10],
            [0, 1],
            { extrapolateRight: "clamp" }
          );
          return (
            <text
              key={`label-${i}`}
              x={p.x}
              y={p.y - 20}
              textAnchor="middle"
              fill={tokens.colors.primary}
              fontFamily={tokens.fonts.heading}
              fontWeight={tokens.fontWeights.bold}
              fontSize={28}
              opacity={labelOpacity}
            >
              {p.label}
            </text>
          );
        })}
      </svg>

      {(caption || source) && (
        <div
          style={{
            position: "absolute",
            bottom: tokens.layout.padding,
            left: tokens.layout.padding,
            right: tokens.layout.padding,
            display: "flex",
            justifyContent: "space-between",
            opacity: interpolate(frame, [20, 35], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          {caption && (
            <div style={{ fontSize: 16, color: tokens.colors.textMuted, fontFamily: tokens.fonts.body }}>
              {caption}
            </div>
          )}
          {source && (
            <div style={{ fontSize: 14, color: tokens.colors.textLight, fontFamily: tokens.fonts.body }}>
              Source: {source}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
