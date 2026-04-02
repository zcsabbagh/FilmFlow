import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { tokens } from "../tokens";

type WaterfallItem = {
  label: string;
  value: number;
  type: "add" | "subtract" | "total";
};

type Props = {
  data: WaterfallItem[];
  title?: string;
  source?: string;
  addColor?: string;
  subtractColor?: string;
};

export const WaterfallChart: React.FC<Props> = ({
  data,
  title,
  source,
  addColor = "#27ae60",
  subtractColor = "#c0392b",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Compute running totals and bar positions
  let runningTotal = 0;
  const bars = data.map((item) => {
    let barStart: number;
    let barEnd: number;

    if (item.type === "total") {
      barStart = 0;
      barEnd = runningTotal;
    } else if (item.type === "add") {
      barStart = runningTotal;
      runningTotal += item.value;
      barEnd = runningTotal;
    } else {
      // subtract
      barStart = runningTotal;
      runningTotal -= item.value;
      barEnd = runningTotal;
    }

    return {
      ...item,
      barStart,
      barEnd,
      runningTotal,
    };
  });

  // Find the min and max values for the Y scale
  const allValues = bars.flatMap((b) => [b.barStart, b.barEnd, 0]);
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  // Add 10% padding
  const range = maxVal - minVal || 1;
  const yMin = minVal - range * 0.1;
  const yMax = maxVal + range * 0.1;

  // Chart area
  const chartLeft = tokens.layout.padding + 60;
  const chartRight = tokens.layout.width - tokens.layout.padding;
  const chartWidth = chartRight - chartLeft;
  const chartTop = 200;
  const chartBottom = tokens.layout.height - 180;
  const chartHeight = chartBottom - chartTop;

  // Map value to Y coordinate
  const valToY = (v: number) =>
    chartBottom - ((v - yMin) / (yMax - yMin)) * chartHeight;

  // Zero line
  const zeroY = valToY(0);

  // Bar sizing
  const totalBars = data.length;
  const gapRatio = 0.35;
  const barWidth = Math.min(
    120,
    chartWidth / (totalBars + (totalBars - 1) * gapRatio),
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

  // Source fade
  const sourceOpacity = interpolate(frame, [40, 55], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Baseline fade
  const baselineOpacity = interpolate(frame, [5, 15], [0, 0.3], {
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

      {/* Zero baseline */}
      <div
        style={{
          position: "absolute",
          left: chartLeft,
          right: tokens.layout.padding,
          top: zeroY,
          height: 2,
          backgroundColor: tokens.colors.textMuted,
          opacity: baselineOpacity,
        }}
      />

      {/* Zero label */}
      <div
        style={{
          position: "absolute",
          left: chartLeft - 40,
          top: zeroY - 8,
          fontSize: 14,
          color: tokens.colors.textMuted,
          fontFamily: tokens.fonts.body,
          opacity: baselineOpacity,
        }}
      >
        0
      </div>

      {/* Bars + connectors */}
      {bars.map((bar, i) => {
        const staggerDelay = 10 + i * 10;
        const barProgress = spring({
          frame: frame - staggerDelay,
          fps,
          config: { damping: 18, stiffness: 80 },
        });

        const barX = barsStartX + i * (barWidth + barGap);

        // Determine bar top/bottom based on type
        const topVal = Math.max(bar.barStart, bar.barEnd);
        const bottomVal = Math.min(bar.barStart, bar.barEnd);
        const barTopY = valToY(topVal);
        const barBottomY = valToY(bottomVal);
        const fullBarHeight = barBottomY - barTopY;

        // Animate: bar grows from its start position
        let animatedTop: number;
        let animatedHeight: number;

        if (bar.type === "total") {
          // Total bars grow from zero line
          const targetTop = barTopY;
          const targetHeight = fullBarHeight;
          animatedHeight = targetHeight * barProgress;
          animatedTop = zeroY - animatedHeight; // grows upward from zero
          if (bar.barEnd < 0) {
            animatedTop = zeroY;
            animatedHeight = targetHeight * barProgress;
          }
        } else if (bar.type === "add") {
          // Add bars grow upward from barStart
          const startY = valToY(bar.barStart);
          animatedHeight = fullBarHeight * barProgress;
          animatedTop = startY - animatedHeight;
        } else {
          // Subtract bars grow downward from barStart
          const startY = valToY(bar.barStart);
          animatedHeight = fullBarHeight * barProgress;
          animatedTop = startY;
        }

        // Bar color
        const barColor =
          bar.type === "subtract"
            ? subtractColor
            : bar.type === "add"
              ? addColor
              : tokens.colors.chart[1]; // slate blue for totals

        // Value label
        const valueOpacity = interpolate(
          frame,
          [staggerDelay + 8, staggerDelay + 18],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );

        const displayValue = bar.type === "total"
          ? bar.barEnd
          : bar.type === "subtract"
            ? -bar.value
            : bar.value;

        const formattedValue =
          displayValue >= 0
            ? `+${Math.round(Math.abs(displayValue) * barProgress).toLocaleString()}`
            : `-${Math.round(Math.abs(displayValue) * barProgress).toLocaleString()}`;

        const totalFormatted = Math.round(
          bar.barEnd * barProgress,
        ).toLocaleString();

        // Connector line to next bar
        const nextBar = i < bars.length - 1 ? bars[i + 1] : null;
        const connectorOpacity = interpolate(
          frame,
          [staggerDelay + 6, staggerDelay + 14],
          [0, 0.4],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );

        // X-axis label
        const labelOpacity = interpolate(
          frame,
          [staggerDelay, staggerDelay + 10],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );

        return (
          <div key={`bar-${i}`}>
            {/* Bar */}
            <div
              style={{
                position: "absolute",
                left: barX,
                width: barWidth,
                height: Math.max(0, animatedHeight),
                top: animatedTop,
                backgroundColor: barColor,
                borderRadius: 0,
              }}
            />

            {/* Value label above/below bar */}
            <div
              style={{
                position: "absolute",
                left: barX - 10,
                width: barWidth + 20,
                top:
                  bar.type === "subtract"
                    ? animatedTop + animatedHeight + 8
                    : animatedTop - 40,
                textAlign: "center" as const,
                fontSize: 22,
                fontWeight: tokens.fontWeights.bold,
                fontFamily: tokens.fonts.heading,
                color: barColor,
                opacity: valueOpacity,
              }}
            >
              {bar.type === "total" ? totalFormatted : formattedValue}
            </div>

            {/* Connector line to next bar */}
            {nextBar && (
              <div
                style={{
                  position: "absolute",
                  left: barX + barWidth,
                  width: barGap,
                  top: valToY(bar.runningTotal) - 1,
                  height: 0,
                  borderTop: `1px dashed ${tokens.colors.textMuted}`,
                  opacity: connectorOpacity,
                }}
              />
            )}

            {/* X-axis label */}
            <div
              style={{
                position: "absolute",
                left: barX - 10,
                width: barWidth + 20,
                top: chartBottom + 16,
                textAlign: "center" as const,
                fontSize: 15,
                fontWeight: tokens.fontWeights.medium,
                color: tokens.colors.textMuted,
                opacity: labelOpacity,
                lineHeight: 1.3,
              }}
            >
              {bar.label}
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
            opacity: sourceOpacity,
          }}
        >
          Source: {source}
        </div>
      )}
    </div>
  );
};
