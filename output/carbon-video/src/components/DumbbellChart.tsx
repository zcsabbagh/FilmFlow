import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { tokens } from "../tokens";

type DumbbellItem = {
  label: string;
  startValue: number;
  endValue: number;
  startColor?: string;
  endColor?: string;
};

type Props = {
  data: DumbbellItem[];
  title?: string;
  source?: string;
  startLabel?: string;
  endLabel?: string;
  valuePrefix?: string;
};

export const DumbbellChart: React.FC<Props> = ({
  data,
  title,
  source,
  startLabel,
  endLabel,
  valuePrefix = "",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const padding = tokens.layout.padding;
  const labelWidth = 220;
  const chartLeft = padding + labelWidth;
  const chartRight = tokens.layout.width - padding - 80;
  const chartWidth = chartRight - chartLeft;
  const chartTop = title ? 200 : 140;
  const rowHeight = Math.min(64, (tokens.layout.height - chartTop - 180) / data.length);
  const dotRadius = 12;

  const allValues = data.flatMap((d) => [d.startValue, d.endValue]);
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const range = maxVal - minVal || 1;
  const scaleBuffer = range * 0.08;
  const scaleMin = minVal - scaleBuffer;
  const scaleMax = maxVal + scaleBuffer;

  const valueToX = (val: number) =>
    chartLeft + ((val - scaleMin) / (scaleMax - scaleMin)) * chartWidth;

  const formatValue = (v: number) => {
    if (v >= 1_000_000) return `${valuePrefix}${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `${valuePrefix}${(v / 1_000).toFixed(v >= 10_000 ? 0 : 1)}k`;
    return `${valuePrefix}${v.toLocaleString()}`;
  };

  // Title animation
  const titleOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleSlide = interpolate(frame, [0, 18], [25, 0], {
    extrapolateRight: "clamp",
  });

  // Axis gridlines
  const gridCount = 5;
  const gridValues = Array.from({ length: gridCount + 1 }, (_, i) =>
    scaleMin + (i / gridCount) * (scaleMax - scaleMin)
  );

  const defaultStartColor = tokens.colors.chart[1]; // slate blue
  const defaultEndColor = tokens.colors.accent;      // salmon/coral

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

      {/* Legend */}
      {(startLabel || endLabel) && (
        <div
          style={{
            position: "absolute",
            top: padding + 60,
            left: padding,
            display: "flex",
            gap: 36,
            fontSize: 16,
            fontWeight: tokens.fontWeights.medium,
            color: tokens.colors.textMuted,
            opacity: interpolate(frame, [8, 22], [0, 1], {
              extrapolateRight: "clamp",
            }),
          }}
        >
          {startLabel && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  backgroundColor: defaultStartColor,
                }}
              />
              {startLabel}
            </div>
          )}
          {endLabel && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  backgroundColor: defaultEndColor,
                }}
              />
              {endLabel}
            </div>
          )}
        </div>
      )}

      {/* Vertical gridlines */}
      {gridValues.map((val, i) => {
        const x = valueToX(val);
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
            <div
              style={{
                position: "absolute",
                left: x,
                top: chartTop - 30,
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
        const staggerDelay = 15 + i * 8;
        const sColor = item.startColor || defaultStartColor;
        const eColor = item.endColor || defaultEndColor;

        const x1 = valueToX(item.startValue);
        const x2 = valueToX(item.endValue);
        const rowY = chartTop + i * rowHeight + rowHeight / 2;

        // First dot pops in
        const dot1Scale = spring({
          frame: frame - staggerDelay,
          fps,
          config: { damping: 12, stiffness: 100 },
        });

        // Connecting line draws between them
        const lineProgress = interpolate(
          frame,
          [staggerDelay + 8, staggerDelay + 20],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        // Second dot pops in
        const dot2Scale = spring({
          frame: frame - (staggerDelay + 16),
          fps,
          config: { damping: 10, stiffness: 120 },
        });

        // Label fades in
        const labelOpacity = interpolate(
          frame,
          [staggerDelay - 2, staggerDelay + 8],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        const lineLeft = Math.min(x1, x2);
        const lineRight = Math.max(x1, x2);
        const lineWidth = (lineRight - lineLeft) * lineProgress;

        return (
          <div key={item.label}>
            {/* Row label */}
            <div
              style={{
                position: "absolute",
                left: padding,
                top: rowY - 11,
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

            {/* Connecting line */}
            <div
              style={{
                position: "absolute",
                left: lineLeft,
                top: rowY - 1.5,
                width: lineWidth,
                height: 3,
                backgroundColor: tokens.colors.textMuted,
                opacity: 0.35,
                borderRadius: 2,
              }}
            />

            {/* Start dot */}
            <div
              style={{
                position: "absolute",
                left: x1 - dotRadius,
                top: rowY - dotRadius,
                width: dotRadius * 2,
                height: dotRadius * 2,
                borderRadius: "50%",
                backgroundColor: sColor,
                transform: `scale(${dot1Scale})`,
              }}
            />

            {/* End dot */}
            <div
              style={{
                position: "absolute",
                left: x2 - dotRadius,
                top: rowY - dotRadius,
                width: dotRadius * 2,
                height: dotRadius * 2,
                borderRadius: "50%",
                backgroundColor: eColor,
                transform: `scale(${dot2Scale})`,
              }}
            />
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
