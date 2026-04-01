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
  const { fps } = useVideoConfig();

  // Chart area with generous margins
  const marginLeft = 100;
  const marginRight = 120;
  const marginTop = title ? 140 : 80;
  const marginBottom = 100;

  const chartWidth =
    tokens.layout.width - tokens.layout.padding * 2 - marginLeft - marginRight;
  const chartHeight =
    tokens.layout.height - tokens.layout.padding * 2 - marginTop - marginBottom;

  const maxY = Math.max(...data.map((d) => d.y));
  const minY = Math.min(...data.map((d) => d.y));
  const yRange = maxY - minY || 1;

  // Add 10% padding to y range
  const yPadding = yRange * 0.1;
  const yMin = minY - yPadding;
  const yMax = maxY + yPadding;
  const yRangeAdjusted = yMax - yMin;

  const points = data.map((d, i) => ({
    x: marginLeft + (i / (data.length - 1)) * chartWidth,
    y: marginTop + chartHeight - ((d.y - yMin) / yRangeAdjusted) * chartHeight,
    label: d.label,
    rawX: d.x,
    rawY: d.y,
  }));

  // Slower, more dramatic line draw — 5 frames per point
  const drawDuration = data.length * 5;
  const progress = interpolate(frame, [15, 15 + drawDuration], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const visibleCount = Math.ceil(points.length * progress);

  // Build SVG path
  const pathData = points
    .slice(0, visibleCount)
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  // Title animation
  const titleOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleSlide = interpolate(frame, [0, 18], [25, 0], {
    extrapolateRight: "clamp",
  });

  // Y-axis gridlines
  const yGridCount = 4;
  const yGridValues = Array.from({ length: yGridCount + 1 }, (_, i) => {
    const pct = i / yGridCount;
    return yMin + pct * yRangeAdjusted;
  });

  const svgWidth =
    tokens.layout.width - tokens.layout.padding * 2;
  const svgHeight =
    tokens.layout.height - tokens.layout.padding * 2;

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
      {/* Title */}
      {title && (
        <div
          style={{
            fontSize: 48,
            fontWeight: tokens.fontWeights.bold,
            fontFamily: tokens.fonts.heading,
            color: tokens.colors.primary,
            opacity: titleOpacity,
            transform: `translateY(${titleSlide}px)`,
            marginBottom: 4,
            lineHeight: 1.2,
            position: "absolute",
            top: tokens.layout.padding,
            left: tokens.layout.padding,
            right: tokens.layout.padding,
          }}
        >
          {title}
        </div>
      )}

      {/* Caption / subtitle */}
      {caption && (
        <div
          style={{
            position: "absolute",
            top: tokens.layout.padding + 60,
            left: tokens.layout.padding,
            fontSize: 20,
            color: tokens.colors.textMuted,
            fontFamily: tokens.fonts.body,
            opacity: interpolate(frame, [8, 22], [0, 1], {
              extrapolateRight: "clamp",
            }),
          }}
        >
          {caption}
        </div>
      )}

      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        style={{ overflow: "visible" }}
      >
        {/* Y-axis gridlines */}
        {yGridValues.map((val, i) => {
          const y =
            marginTop +
            chartHeight -
            ((val - yMin) / yRangeAdjusted) * chartHeight;
          const gridOpacity = interpolate(frame, [5, 20], [0, 0.15], {
            extrapolateRight: "clamp",
          });
          return (
            <g key={i}>
              <line
                x1={marginLeft}
                y1={y}
                x2={marginLeft + chartWidth}
                y2={y}
                stroke={tokens.colors.textMuted}
                strokeWidth={1}
                opacity={gridOpacity}
              />
              <text
                x={marginLeft - 14}
                y={y + 5}
                textAnchor="end"
                fill={tokens.colors.textMuted}
                fontFamily={tokens.fonts.body}
                fontSize={14}
                opacity={interpolate(frame, [5, 20], [0, 0.6], {
                  extrapolateRight: "clamp",
                })}
              >
                {formatValue(val)}
              </text>
            </g>
          );
        })}

        {/* Baseline */}
        <line
          x1={marginLeft}
          y1={marginTop + chartHeight}
          x2={marginLeft + chartWidth}
          y2={marginTop + chartHeight}
          stroke={tokens.colors.textMuted}
          strokeWidth={2}
          opacity={interpolate(frame, [5, 15], [0, 0.3], {
            extrapolateRight: "clamp",
          })}
        />

        {/* Thick line */}
        {visibleCount > 1 && (
          <path
            d={pathData}
            fill="none"
            stroke={color}
            strokeWidth={4.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Dots at each data point */}
        {points.slice(0, visibleCount).map((p, i) => {
          const dotOpacity = interpolate(
            frame,
            [15 + i * 5 - 2, 15 + i * 5 + 3],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          return (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={tokens.chart.dotRadius}
              fill={tokens.colors.accent}
              stroke={tokens.colors.background}
              strokeWidth={2}
              opacity={dotOpacity}
            />
          );
        })}

        {/* Call-out labels at key data points */}
        {points.slice(0, visibleCount).map((p, i) => {
          if (!p.label) return null;

          const labelDelay = 15 + i * 5 + 8;
          const labelOpacity = interpolate(
            frame,
            [labelDelay, labelDelay + 12],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          const labelSlide = interpolate(
            frame,
            [labelDelay, labelDelay + 12],
            [10, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          // Position label: above point, but ensure it fits in bounds
          const labelX = Math.min(
            Math.max(p.x, marginLeft + 40),
            marginLeft + chartWidth - 40
          );
          const labelY = Math.max(p.y - 30, marginTop + 20);

          // Determine text anchor based on position
          const isRightEdge = p.x > marginLeft + chartWidth * 0.85;
          const isLeftEdge = p.x < marginLeft + chartWidth * 0.15;
          const anchor = isRightEdge
            ? "end"
            : isLeftEdge
              ? "start"
              : "middle";

          return (
            <text
              key={`label-${i}`}
              x={labelX}
              y={labelY + labelSlide}
              textAnchor={anchor}
              fill={tokens.colors.primary}
              fontFamily={tokens.fonts.heading}
              fontWeight={tokens.fontWeights.black}
              fontSize={36}
              opacity={labelOpacity}
            >
              {p.label}
            </text>
          );
        })}

        {/* X-axis labels */}
        {points.map((p, i) => {
          // Show every label if few points, otherwise thin out
          const showEvery =
            data.length <= 10 ? 1 : Math.ceil(data.length / 8);
          if (i % showEvery !== 0 && i !== data.length - 1) return null;

          const xLabelOpacity = interpolate(frame, [10, 25], [0, 0.7], {
            extrapolateRight: "clamp",
          });

          return (
            <text
              key={`x-${i}`}
              x={p.x}
              y={marginTop + chartHeight + 30}
              textAnchor="middle"
              fill={tokens.colors.textMuted}
              fontFamily={tokens.fonts.body}
              fontSize={15}
              fontWeight={tokens.fontWeights.medium}
              opacity={xLabelOpacity}
            >
              {String(p.rawX)}
            </text>
          );
        })}
      </svg>

      {/* Source */}
      {source && (
        <div
          style={{
            position: "absolute",
            bottom: tokens.layout.padding - 10,
            left: tokens.layout.padding,
            fontSize: 14,
            color: tokens.colors.textLight,
            fontFamily: tokens.fonts.body,
            opacity: interpolate(frame, [30, 50], [0, 1], {
              extrapolateRight: "clamp",
            }),
          }}
        >
          Source: {source}
        </div>
      )}
    </div>
  );
};

/** Format a numeric value smartly */
function formatValue(val: number): string {
  const abs = Math.abs(val);
  if (abs >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(val / 1_000).toFixed(0)}K`;
  if (abs < 1 && abs > 0) return val.toFixed(2);
  return val.toFixed(0);
}
