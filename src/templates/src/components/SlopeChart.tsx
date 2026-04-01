import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { tokens } from "../tokens";

type SlopeItem = {
  label: string;
  startValue: number;
  endValue: number;
  color?: string;
};

type Props = {
  data: SlopeItem[];
  startLabel: string;
  endLabel: string;
  title?: string;
  source?: string;
  valuePrefix?: string;
  valueSuffix?: string;
};

export const SlopeChart: React.FC<Props> = ({
  data,
  startLabel,
  endLabel,
  title,
  source,
  valuePrefix = "",
  valueSuffix = "",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const padding = tokens.layout.padding;
  const axisLeft = 380;
  const axisRight = 1540;
  const axisTop = 220;
  const axisBottom = 900;
  const axisHeight = axisBottom - axisTop;

  // Compute global min/max for uniform scale
  const allValues = data.flatMap((d) => [d.startValue, d.endValue]);
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const range = maxVal - minVal || 1;
  const scaleBuffer = range * 0.1; // 10% padding
  const scaleMin = minVal - scaleBuffer;
  const scaleMax = maxVal + scaleBuffer;

  const valueToY = (val: number) => {
    return axisBottom - ((val - scaleMin) / (scaleMax - scaleMin)) * axisHeight;
  };

  const formatValue = (v: number) => {
    if (v >= 1_000_000) return `${valuePrefix}${(v / 1_000_000).toFixed(1)}M${valueSuffix}`;
    if (v >= 1_000) return `${valuePrefix}${(v / 1_000).toFixed(v >= 10_000 ? 0 : 1)}k${valueSuffix}`;
    return `${valuePrefix}${v.toLocaleString()}${valueSuffix}`;
  };

  // Title animation
  const titleOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleSlide = interpolate(frame, [0, 18], [25, 0], {
    extrapolateRight: "clamp",
  });

  // Axis labels animation
  const axisLabelOpacity = interpolate(frame, [5, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Axis lines animation
  const axisLineOpacity = interpolate(frame, [8, 20], [0, 0.3], {
    extrapolateRight: "clamp",
  });

  // Left values appear first
  const leftValuesOpacity = interpolate(frame, [12, 25], [0, 1], {
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
            top: padding - 10,
            left: padding,
            right: padding,
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

      {/* Start axis label */}
      <div
        style={{
          position: "absolute",
          top: axisTop - 60,
          left: axisLeft - 60,
          width: 120,
          textAlign: "center",
          fontSize: 32,
          fontWeight: tokens.fontWeights.bold,
          fontFamily: tokens.fonts.heading,
          color: tokens.colors.primary,
          opacity: axisLabelOpacity,
        }}
      >
        {startLabel}
      </div>

      {/* End axis label */}
      <div
        style={{
          position: "absolute",
          top: axisTop - 60,
          left: axisRight - 60,
          width: 120,
          textAlign: "center",
          fontSize: 32,
          fontWeight: tokens.fontWeights.bold,
          fontFamily: tokens.fonts.heading,
          color: tokens.colors.primary,
          opacity: axisLabelOpacity,
        }}
      >
        {endLabel}
      </div>

      {/* Left axis line */}
      <div
        style={{
          position: "absolute",
          left: axisLeft,
          top: axisTop - 10,
          width: 2,
          height: axisHeight + 20,
          backgroundColor: tokens.colors.textMuted,
          opacity: axisLineOpacity,
        }}
      />

      {/* Right axis line */}
      <div
        style={{
          position: "absolute",
          left: axisRight,
          top: axisTop - 10,
          width: 2,
          height: axisHeight + 20,
          backgroundColor: tokens.colors.textMuted,
          opacity: axisLineOpacity,
        }}
      />

      {/* Slope lines and values */}
      {data.map((item, i) => {
        const isUp = item.endValue >= item.startValue;
        const lineColor =
          item.color || (isUp ? tokens.colors.accent : tokens.colors.textMuted);

        const staggerDelay = 25 + i * 12;

        // Line draw progress
        const lineProgress = spring({
          frame: frame - staggerDelay,
          fps,
          config: { damping: 22, stiffness: 60 },
        });

        // Right value fades in after line
        const rightValueOpacity = interpolate(
          frame,
          [staggerDelay + 15, staggerDelay + 25],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        // Label fades in with right value
        const labelOpacity = interpolate(
          frame,
          [staggerDelay + 18, staggerDelay + 28],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        const y1 = valueToY(item.startValue);
        const y2 = valueToY(item.endValue);

        // Current end point of the drawing line
        const currentX = axisLeft + (axisRight - axisLeft) * lineProgress;
        const currentY = y1 + (y2 - y1) * lineProgress;

        // SVG line coordinates
        const svgWidth = axisRight - axisLeft + 40;
        const svgHeight = Math.abs(y2 - y1) + 60;
        const svgTop = Math.min(y1, y2) - 30;
        const svgLeft = axisLeft - 20;

        const localX1 = 20;
        const localY1 = y1 - svgTop;
        const localX2End = svgWidth - 20;
        const localY2End = y2 - svgTop;
        const localCurrentX = currentX - svgLeft;
        const localCurrentY = currentY - svgTop;

        return (
          <div key={item.label}>
            {/* SVG slope line */}
            <svg
              style={{
                position: "absolute",
                left: svgLeft,
                top: svgTop,
                width: svgWidth,
                height: svgHeight,
                overflow: "visible",
              }}
            >
              <line
                x1={localX1}
                y1={localY1}
                x2={localCurrentX}
                y2={localCurrentY}
                stroke={lineColor}
                strokeWidth={tokens.chart.lineWidth}
                strokeLinecap="round"
              />
              {/* Start dot */}
              <circle
                cx={localX1}
                cy={localY1}
                r={tokens.chart.dotRadius}
                fill={lineColor}
                opacity={leftValuesOpacity}
              />
              {/* End dot — appears as line draws */}
              {lineProgress > 0.9 && (
                <circle
                  cx={localX2End}
                  cy={localY2End}
                  r={tokens.chart.dotRadius}
                  fill={lineColor}
                  opacity={rightValueOpacity}
                />
              )}
            </svg>

            {/* Left value */}
            <div
              style={{
                position: "absolute",
                right: tokens.layout.width - axisLeft + 20,
                top: y1 - 14,
                fontSize: 22,
                fontWeight: tokens.fontWeights.semibold,
                fontFamily: tokens.fonts.body,
                color: lineColor,
                opacity: leftValuesOpacity,
                textAlign: "right",
                whiteSpace: "nowrap",
              }}
            >
              {formatValue(item.startValue)}
            </div>

            {/* Right value */}
            <div
              style={{
                position: "absolute",
                left: axisRight + 20,
                top: y2 - 14,
                fontSize: 22,
                fontWeight: tokens.fontWeights.semibold,
                fontFamily: tokens.fonts.body,
                color: lineColor,
                opacity: rightValueOpacity,
                whiteSpace: "nowrap",
              }}
            >
              {formatValue(item.endValue)}
            </div>

            {/* Label — positioned to the right of the right value */}
            <div
              style={{
                position: "absolute",
                left: axisRight + 120,
                top: y2 - 14,
                fontSize: 18,
                fontWeight: tokens.fontWeights.medium,
                fontFamily: tokens.fonts.body,
                color: tokens.colors.textMuted,
                opacity: labelOpacity,
                whiteSpace: "nowrap",
              }}
            >
              {item.label}
            </div>
          </div>
        );
      })}

      {/* Source */}
      {source && (
        <div
          style={{
            position: "absolute",
            bottom: padding - 20,
            left: padding,
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
