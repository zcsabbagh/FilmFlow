import { useCurrentFrame, interpolate, useVideoConfig } from "remotion";
import { tokens } from "../tokens";

type AreaChartPoint = { x: string | number; y: number; label?: string };

type Props = {
  data: AreaChartPoint[];
  title?: string;
  source?: string;
  color?: string;
  fillOpacity?: number;
};

export const AreaChart: React.FC<Props> = ({
  data,
  title,
  source,
  color = tokens.colors.accent,
  fillOpacity = 0.35,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const marginLeft = 100;
  const marginRight = 120;
  const marginTop = title ? 140 : 80;
  const marginBottom = 100;

  const svgWidth = tokens.layout.width - tokens.layout.padding * 2;
  const svgHeight = tokens.layout.height - tokens.layout.padding * 2;
  const chartWidth = svgWidth - marginLeft - marginRight;
  const chartHeight = svgHeight - marginTop - marginBottom;

  const maxY = Math.max(...data.map((d) => d.y));
  const minY = Math.min(...data.map((d) => d.y));
  const yRange = maxY - minY || 1;
  const yPadding = yRange * 0.1;
  const yMin = minY - yPadding;
  const yMax = maxY + yPadding;
  const yRangeAdj = yMax - yMin;

  const points = data.map((d, i) => ({
    x: marginLeft + (i / (data.length - 1)) * chartWidth,
    y: marginTop + chartHeight - ((d.y - yMin) / yRangeAdj) * chartHeight,
    rawX: d.x,
    rawY: d.y,
    label: d.label,
  }));

  // Progressive draw — 5 frames per point
  const drawDuration = data.length * 5;
  const progress = interpolate(frame, [15, 15 + drawDuration], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const visibleCount = Math.ceil(points.length * progress);

  // Fractional progress for smooth partial segment
  const exactIndex = (points.length - 1) * progress;
  const lastFullIndex = Math.floor(exactIndex);
  const frac = exactIndex - lastFullIndex;

  // Build line path and area path
  const visiblePoints = points.slice(0, visibleCount);
  // Add interpolated point for smooth drawing
  if (
    visibleCount > 0 &&
    visibleCount <= points.length &&
    lastFullIndex < points.length - 1 &&
    frac > 0
  ) {
    const p1 = points[lastFullIndex];
    const p2 = points[lastFullIndex + 1];
    const interpPoint = {
      x: p1.x + (p2.x - p1.x) * frac,
      y: p1.y + (p2.y - p1.y) * frac,
      rawX: p2.rawX,
      rawY: p2.rawY,
      label: undefined,
    };
    // Replace last point with interpolated if it would be beyond
    if (visiblePoints.length > lastFullIndex + 1) {
      visiblePoints[lastFullIndex + 1] = interpPoint;
    } else {
      visiblePoints.push(interpPoint);
    }
  }

  const linePath = visiblePoints
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  // Area path: line path + close along bottom
  const baselineY = marginTop + chartHeight;
  const areaPath =
    visiblePoints.length > 1
      ? linePath +
        ` L ${visiblePoints[visiblePoints.length - 1].x} ${baselineY}` +
        ` L ${visiblePoints[0].x} ${baselineY} Z`
      : "";

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
    return yMin + pct * yRangeAdj;
  });

  // Gradient ID unique per component instance
  const gradientId = `area-grad-${color.replace("#", "")}`;

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

      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        style={{ overflow: "visible" }}
      >
        <defs>
          {/* Vertical gradient: accent color at top to transparent at bottom */}
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={fillOpacity} />
            <stop offset="100%" stopColor={color} stopOpacity={0.03} />
          </linearGradient>
        </defs>

        {/* Y-axis gridlines */}
        {yGridValues.map((val, i) => {
          const y =
            marginTop + chartHeight - ((val - yMin) / yRangeAdj) * chartHeight;
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
          y1={baselineY}
          x2={marginLeft + chartWidth}
          y2={baselineY}
          stroke={tokens.colors.textMuted}
          strokeWidth={2}
          opacity={interpolate(frame, [5, 15], [0, 0.3], {
            extrapolateRight: "clamp",
          })}
        />

        {/* Filled area — gradient */}
        {visiblePoints.length > 1 && (
          <path
            d={areaPath}
            fill={`url(#${gradientId})`}
          />
        )}

        {/* Line on top of area */}
        {visiblePoints.length > 1 && (
          <path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth={4.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Dots at data points — only for fully revealed points */}
        {points.slice(0, Math.min(visibleCount, lastFullIndex + 1)).map((p, i) => {
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
              fill={color}
              stroke={tokens.colors.background}
              strokeWidth={2}
              opacity={dotOpacity}
            />
          );
        })}

        {/* Call-out labels */}
        {points.slice(0, visibleCount).map((p, i) => {
          if (!p.label) return null;

          const labelDelay = 15 + i * 5 + 8;
          const labelOpacity = interpolate(
            frame,
            [labelDelay, labelDelay + 12],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          const labelSlideY = interpolate(
            frame,
            [labelDelay, labelDelay + 12],
            [10, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          const labelX = Math.min(
            Math.max(p.x, marginLeft + 40),
            marginLeft + chartWidth - 40
          );
          const labelY = Math.max(p.y - 30, marginTop + 20);
          const isRightEdge = p.x > marginLeft + chartWidth * 0.85;
          const isLeftEdge = p.x < marginLeft + chartWidth * 0.15;
          const anchor = isRightEdge ? "end" : isLeftEdge ? "start" : "middle";

          return (
            <text
              key={`label-${i}`}
              x={labelX}
              y={labelY + labelSlideY}
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

        {/* X-axis labels — appear as line reaches each point */}
        {points.map((p, i) => {
          const showEvery =
            data.length <= 10 ? 1 : Math.ceil(data.length / 8);
          if (i % showEvery !== 0 && i !== data.length - 1) return null;

          // Label appears when line reaches this point
          const pointFrame = 15 + i * 5;
          const xLabelOpacity = interpolate(
            frame,
            [pointFrame - 2, pointFrame + 6],
            [0, 0.7],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          return (
            <text
              key={`x-${i}`}
              x={p.x}
              y={baselineY + 30}
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

function formatValue(val: number): string {
  const abs = Math.abs(val);
  if (abs >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(val / 1_000).toFixed(0)}K`;
  if (abs < 1 && abs > 0) return val.toFixed(2);
  return val.toFixed(0);
}
