import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { tokens } from "../tokens";

export type BarChartData = { label: string; value: number };

type Props = {
  data: BarChartData[];
  title?: string;
  caption?: string;
  source?: string;
  yAxisLabel?: string;
  colorOverrides?: string[];
};

export const AnimatedBarChart: React.FC<Props> = ({
  data,
  title,
  caption,
  source,
  yAxisLabel,
  colorOverrides,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const maxValue = Math.max(...data.map((d) => d.value));
  const colors = colorOverrides || tokens.colors.chart;

  // Chart area dimensions
  const chartLeft = tokens.layout.padding + 60;
  const chartRight = tokens.layout.width - tokens.layout.padding;
  const chartWidth = chartRight - chartLeft;
  const chartTop = 200;
  const chartBottom = tokens.layout.height - 200;
  const chartHeight = chartBottom - chartTop;

  // Bar sizing — wide bars with tight gaps
  const totalBars = data.length;
  const gapRatio = 0.25; // gap is 25% of bar width
  const barWidth = Math.min(
    140,
    chartWidth / (totalBars + (totalBars - 1) * gapRatio)
  );
  const barGap = barWidth * gapRatio;
  const totalBarsWidth = totalBars * barWidth + (totalBars - 1) * barGap;
  const barsStartX = chartLeft + (chartWidth - totalBarsWidth) / 2;

  // Title animation
  const titleOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleSlide = interpolate(frame, [0, 18], [25, 0], {
    extrapolateRight: "clamp",
  });

  // Y-axis gridlines (3 lines: 25%, 50%, 75%, 100%)
  const gridLines = [0.25, 0.5, 0.75, 1.0];

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

      {/* Subtitle / caption under title */}
      {caption && (
        <div
          style={{
            position: "absolute",
            top: tokens.layout.padding + 58,
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

      {/* Y-axis label */}
      {yAxisLabel && (
        <div
          style={{
            position: "absolute",
            left: tokens.layout.padding - 10,
            top: chartTop + chartHeight / 2,
            transform: "rotate(-90deg)",
            transformOrigin: "center center",
            fontSize: 14,
            fontWeight: tokens.fontWeights.medium,
            color: tokens.colors.textMuted,
            textTransform: "uppercase" as const,
            letterSpacing: 1.5,
            opacity: interpolate(frame, [10, 25], [0, 0.7], {
              extrapolateRight: "clamp",
            }),
          }}
        >
          {yAxisLabel}
        </div>
      )}

      {/* Grid lines */}
      {gridLines.map((pct) => {
        const y = chartBottom - pct * chartHeight;
        const gridOpacity = interpolate(frame, [5, 20], [0, 0.15], {
          extrapolateRight: "clamp",
        });
        return (
          <div key={pct}>
            <div
              style={{
                position: "absolute",
                left: chartLeft,
                right: tokens.layout.padding,
                top: y,
                height: 1,
                backgroundColor: tokens.colors.textMuted,
                opacity: gridOpacity,
              }}
            />
            <div
              style={{
                position: "absolute",
                right: tokens.layout.width - chartLeft + 12,
                top: y - 8,
                fontSize: 14,
                color: tokens.colors.textMuted,
                fontFamily: tokens.fonts.body,
                textAlign: "right" as const,
                width: 50,
                opacity: interpolate(frame, [5, 20], [0, 0.6], {
                  extrapolateRight: "clamp",
                }),
              }}
            >
              {Math.round(maxValue * pct).toLocaleString()}
            </div>
          </div>
        );
      })}

      {/* Baseline */}
      <div
        style={{
          position: "absolute",
          left: chartLeft,
          right: tokens.layout.padding,
          top: chartBottom,
          height: 2,
          backgroundColor: tokens.colors.textMuted,
          opacity: interpolate(frame, [5, 15], [0, 0.3], {
            extrapolateRight: "clamp",
          }),
        }}
      />

      {/* Bars */}
      {data.map((item, i) => {
        const staggerDelay = 10 + i * 8;
        const barProgress = spring({
          frame: frame - staggerDelay,
          fps,
          config: { damping: 18, stiffness: 80 },
        });

        const barH = (item.value / maxValue) * chartHeight * barProgress;
        const barX = barsStartX + i * (barWidth + barGap);
        const barY = chartBottom - barH;

        // Value label appears after bar grows
        const valueOpacity = interpolate(
          frame,
          [staggerDelay + 12, staggerDelay + 22],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        // X-axis label
        const labelOpacity = interpolate(
          frame,
          [staggerDelay, staggerDelay + 10],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        return (
          <div key={item.label}>
            {/* Value label above bar */}
            <div
              style={{
                position: "absolute",
                left: barX,
                width: barWidth,
                top: barY - 44,
                textAlign: "center" as const,
                fontSize: 28,
                fontWeight: tokens.fontWeights.bold,
                fontFamily: tokens.fonts.heading,
                color: tokens.colors.primary,
                opacity: valueOpacity,
              }}
            >
              {Math.round(item.value * barProgress).toLocaleString()}
            </div>

            {/* Bar */}
            <div
              style={{
                position: "absolute",
                left: barX,
                width: barWidth,
                height: barH,
                top: barY,
                backgroundColor: colors[i % colors.length],
                borderRadius: 0,
              }}
            />

            {/* X-axis label */}
            <div
              style={{
                position: "absolute",
                left: barX - 10,
                width: barWidth + 20,
                top: chartBottom + 16,
                textAlign: "center" as const,
                fontSize: 17,
                fontWeight: tokens.fontWeights.medium,
                color: tokens.colors.textMuted,
                opacity: labelOpacity,
                lineHeight: 1.3,
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
