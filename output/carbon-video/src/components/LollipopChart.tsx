import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { tokens } from "../tokens";

type LollipopItem = {
  label: string;
  value: number;
  color?: string;
};

type Props = {
  data: LollipopItem[];
  title?: string;
  source?: string;
  valuePrefix?: string;
  valueSuffix?: string;
};

export const LollipopChart: React.FC<Props> = ({
  data,
  title,
  source,
  valuePrefix = "",
  valueSuffix = "",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const padding = tokens.layout.padding;
  const labelWidth = 220;
  const chartLeft = padding + labelWidth;
  const chartRight = tokens.layout.width - padding - 100;
  const chartWidth = chartRight - chartLeft;
  const chartTop = title ? 180 : 120;
  const rowHeight = Math.min(60, (tokens.layout.height - chartTop - 160) / data.length);
  const dotRadius = 12;
  const stemWidth = 2;

  const maxValue = Math.max(...data.map((d) => d.value));

  // Title animation
  const titleOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleSlide = interpolate(frame, [0, 18], [25, 0], {
    extrapolateRight: "clamp",
  });

  const formatValue = (v: number) => {
    if (v >= 1_000_000) return `${valuePrefix}${(v / 1_000_000).toFixed(1)}M${valueSuffix}`;
    if (v >= 1_000) return `${valuePrefix}${(v / 1_000).toFixed(v >= 10_000 ? 0 : 1)}k${valueSuffix}`;
    return `${valuePrefix}${v.toLocaleString()}${valueSuffix}`;
  };

  // Gridlines
  const gridCount = 4;
  const gridValues = Array.from({ length: gridCount + 1 }, (_, i) => (i / gridCount) * maxValue);

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

      {/* Vertical gridlines */}
      {gridValues.map((val, i) => {
        const x = chartLeft + (val / maxValue) * chartWidth;
        const gridOpacity = interpolate(frame, [5, 20], [0, 0.12], {
          extrapolateRight: "clamp",
        });
        return (
          <div key={i}>
            <div
              style={{
                position: "absolute",
                left: x,
                top: chartTop - 10,
                width: 1,
                height: data.length * rowHeight + 20,
                backgroundColor: tokens.colors.textMuted,
                opacity: gridOpacity,
              }}
            />
            {/* Grid value label at top */}
            <div
              style={{
                position: "absolute",
                left: x,
                top: chartTop - 34,
                transform: "translateX(-50%)",
                fontSize: 13,
                color: tokens.colors.textMuted,
                fontFamily: tokens.fonts.body,
                opacity: interpolate(frame, [5, 20], [0, 0.5], {
                  extrapolateRight: "clamp",
                }),
              }}
            >
              {formatValue(val)}
            </div>
          </div>
        );
      })}

      {/* Rows */}
      {data.map((item, i) => {
        const staggerDelay = 12 + i * 6;
        const itemColor = item.color || tokens.colors.chart[i % tokens.colors.chart.length];

        // Stem draws left to right
        const stemProgress = interpolate(
          frame,
          [staggerDelay, staggerDelay + 18],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        const stemEndX = (item.value / maxValue) * chartWidth * stemProgress;

        // Dot pops in with spring at the tip
        const dotScale = spring({
          frame: frame - (staggerDelay + 14),
          fps,
          config: { damping: 10, stiffness: 120 },
        });

        // Value label fades in after dot
        const valueOpacity = interpolate(
          frame,
          [staggerDelay + 20, staggerDelay + 30],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        // Label fades in
        const labelOpacity = interpolate(
          frame,
          [staggerDelay - 2, staggerDelay + 8],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        const rowY = chartTop + i * rowHeight + rowHeight / 2;
        const dotX = chartLeft + (item.value / maxValue) * chartWidth;

        return (
          <div key={item.label}>
            {/* Row label — left-aligned */}
            <div
              style={{
                position: "absolute",
                left: padding,
                top: rowY - 10,
                width: labelWidth - 16,
                fontSize: 18,
                fontWeight: tokens.fontWeights.medium,
                fontFamily: tokens.fonts.body,
                color: tokens.colors.text,
                opacity: labelOpacity,
                textAlign: "right",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {item.label}
            </div>

            {/* Stem — thin line */}
            <div
              style={{
                position: "absolute",
                left: chartLeft,
                top: rowY - stemWidth / 2,
                width: stemEndX,
                height: stemWidth,
                backgroundColor: itemColor,
                borderRadius: 1,
              }}
            />

            {/* Dot at the tip */}
            <div
              style={{
                position: "absolute",
                left: dotX - dotRadius,
                top: rowY - dotRadius,
                width: dotRadius * 2,
                height: dotRadius * 2,
                borderRadius: "50%",
                backgroundColor: itemColor,
                transform: `scale(${dotScale})`,
              }}
            />

            {/* Value label — serif, right of dot */}
            <div
              style={{
                position: "absolute",
                left: dotX + dotRadius + 12,
                top: rowY - 12,
                fontSize: 20,
                fontWeight: tokens.fontWeights.bold,
                fontFamily: tokens.fonts.heading,
                color: tokens.colors.primary,
                opacity: valueOpacity,
                whiteSpace: "nowrap",
              }}
            >
              {formatValue(item.value)}
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
