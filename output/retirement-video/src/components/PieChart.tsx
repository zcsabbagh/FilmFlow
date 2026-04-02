import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { tokens } from "../tokens";

type PieSlice = {
  label: string;
  value: number;
  color?: string;
};

type Props = {
  data: PieSlice[];
  title?: string;
  source?: string;
  showPercentages?: boolean;
};

export const PieChart: React.FC<Props> = ({
  data,
  title,
  source,
  showPercentages = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const total = data.reduce((sum, d) => sum + d.value, 0);

  // Pie geometry
  const centerX = tokens.layout.width / 2;
  const centerY = tokens.layout.height / 2 + (title ? 30 : 0);
  const radius = 280;
  const labelRadius = radius + 60;
  const connectorStart = radius + 8;
  const connectorEnd = radius + 40;

  // Build slice angles (start from 12 o'clock = -PI/2)
  const slices = data.map((d, i) => {
    const angle = (d.value / total) * 2 * Math.PI;
    const color = d.color ?? tokens.colors.chart[i % tokens.colors.chart.length];
    return { ...d, angle, color };
  });

  // Compute cumulative start angles
  let cumAngle = -Math.PI / 2;
  const sliceAngles = slices.map((s) => {
    const startAngle = cumAngle;
    cumAngle += s.angle;
    return { ...s, startAngle, endAngle: cumAngle };
  });

  // SVG arc path helper
  const describeArc = (
    cx: number,
    cy: number,
    r: number,
    startAngle: number,
    endAngle: number
  ): string => {
    // Clamp to avoid degenerate arcs
    const sweepAngle = endAngle - startAngle;
    if (sweepAngle <= 0) return "";

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = sweepAngle > Math.PI ? 1 : 0;

    return [
      `M ${cx} ${cy}`,
      `L ${x1} ${y1}`,
      `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
      "Z",
    ].join(" ");
  };

  // Title animation
  const titleOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleSlide = interpolate(frame, [0, 18], [25, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: tokens.layout.width,
        height: tokens.layout.height,
        backgroundColor: tokens.colors.background,
        position: "relative",
        fontFamily: tokens.fonts.body,
        color: tokens.colors.text,
      }}
    >
      {/* Title */}
      {title && (
        <div
          style={{
            position: "absolute",
            top: tokens.layout.padding - 10,
            left: tokens.layout.padding,
            right: tokens.layout.padding,
            fontSize: 48,
            fontWeight: tokens.fontWeights.bold,
            fontFamily: tokens.fonts.heading,
            color: tokens.colors.primary,
            opacity: titleOpacity,
            transform: `translateY(${titleSlide}px)`,
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>
      )}

      {/* Pie SVG */}
      <svg
        width={tokens.layout.width}
        height={tokens.layout.height}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        {sliceAngles.map((slice, i) => {
          const staggerDelay = 12 + i * 10;

          // Clockwise draw: animate the sweep of each segment
          const drawProgress = spring({
            frame: frame - staggerDelay,
            fps,
            config: { damping: 28, stiffness: 50 },
          });
          const clampedProgress = Math.min(drawProgress, 1);

          // Animated end angle
          const animatedEnd =
            slice.startAngle + slice.angle * clampedProgress;

          const path = describeArc(
            centerX,
            centerY,
            radius,
            slice.startAngle,
            animatedEnd
          );

          // Connector line and label
          const midAngle =
            slice.startAngle + (slice.angle * clampedProgress) / 2;
          const connStartX = centerX + connectorStart * Math.cos(midAngle);
          const connStartY = centerY + connectorStart * Math.sin(midAngle);
          const connEndX = centerX + connectorEnd * Math.cos(midAngle);
          const connEndY = centerY + connectorEnd * Math.sin(midAngle);

          // Label position
          const labelX = centerX + labelRadius * Math.cos(midAngle);
          const labelY = centerY + labelRadius * Math.sin(midAngle);
          const isRight = Math.cos(midAngle) >= 0;

          // Label appears after segment is mostly drawn
          const labelOpacity = interpolate(
            frame,
            [staggerDelay + 10, staggerDelay + 20],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          const pct = ((slice.value / total) * 100).toFixed(1);

          return (
            <g key={slice.label}>
              {/* Pie segment */}
              {path && (
                <path
                  d={path}
                  fill={slice.color}
                  stroke={tokens.colors.background}
                  strokeWidth={2}
                />
              )}

              {/* Connector line */}
              <line
                x1={connStartX}
                y1={connStartY}
                x2={connEndX}
                y2={connEndY}
                stroke={tokens.colors.textMuted}
                strokeWidth={1}
                opacity={labelOpacity * 0.6}
              />

              {/* Label text */}
              <text
                x={labelX + (isRight ? 10 : -10)}
                y={labelY}
                textAnchor={isRight ? "start" : "end"}
                dominantBaseline="middle"
                fontFamily={tokens.fonts.body}
                fontSize={18}
                fontWeight={tokens.fontWeights.medium}
                fill={tokens.colors.text}
                opacity={labelOpacity}
              >
                {slice.label}
              </text>

              {/* Percentage */}
              {showPercentages && (
                <text
                  x={labelX + (isRight ? 10 : -10)}
                  y={labelY + 22}
                  textAnchor={isRight ? "start" : "end"}
                  dominantBaseline="middle"
                  fontFamily={tokens.fonts.heading}
                  fontSize={16}
                  fontWeight={tokens.fontWeights.bold}
                  fill={tokens.colors.textMuted}
                  opacity={labelOpacity}
                >
                  {pct}%
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Source */}
      {source && (
        <div
          style={{
            position: "absolute",
            bottom: tokens.layout.padding - 20,
            left: tokens.layout.padding,
            fontSize: 14,
            color: tokens.colors.textLight,
            fontFamily: tokens.fonts.body,
            opacity: interpolate(frame, [30, 45], [0, 1], {
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
