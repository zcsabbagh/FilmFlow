import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { tokens } from "../tokens";

type ScatterPoint = {
  x: number;
  y: number;
  label: string;
  size?: number;
  color?: string;
};

type Props = {
  data: ScatterPoint[];
  xLabel: string;
  yLabel: string;
  title?: string;
  source?: string;
};

export const ScatterPlot: React.FC<Props> = ({
  data,
  xLabel,
  yLabel,
  title,
  source,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Chart area
  const chartLeft = tokens.layout.padding + 80;
  const chartRight = tokens.layout.width - tokens.layout.padding - 40;
  const chartTop = title ? 200 : 120;
  const chartBottom = tokens.layout.height - 180;
  const chartWidth = chartRight - chartLeft;
  const chartHeight = chartBottom - chartTop;

  // Data ranges
  const xValues = data.map((d) => d.x);
  const yValues = data.map((d) => d.y);
  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);

  // Add 10% padding to ranges
  const xRange = xMax - xMin || 1;
  const yRange = yMax - yMin || 1;
  const xPadded = { min: xMin - xRange * 0.05, max: xMax + xRange * 0.05 };
  const yPadded = { min: yMin - yRange * 0.05, max: yMax + yRange * 0.05 };

  // Map data to pixel coordinates
  const toPixelX = (v: number) =>
    chartLeft + ((v - xPadded.min) / (xPadded.max - xPadded.min)) * chartWidth;
  const toPixelY = (v: number) =>
    chartBottom - ((v - yPadded.min) / (yPadded.max - yPadded.min)) * chartHeight;

  // Sort data left-to-right for stagger
  const sorted = [...data].sort((a, b) => a.x - b.x);

  // Axis draw animation
  const axisProgress = interpolate(frame, [5, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Grid lines at 25/50/75/100%
  const gridPcts = [0.25, 0.5, 0.75, 1.0];
  const gridOpacity = interpolate(frame, [10, 28], [0, 0.12], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Title animation
  const titleOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleSlide = interpolate(frame, [0, 18], [25, 0], {
    extrapolateRight: "clamp",
  });

  // Simple label collision avoidance: push labels that overlap
  const labelPositions = sorted.map((pt, i) => {
    const px = toPixelX(pt.x);
    const py = toPixelY(pt.y);
    const r = pt.size ?? tokens.chart.dotRadius;

    // Default: label above-right
    let labelX = px + r + 8;
    let labelY = py - r - 4;
    let anchor: "left" | "right" = "left";

    // If too far right, flip to left
    if (labelX + 100 > chartRight) {
      labelX = px - r - 8;
      anchor = "right";
    }
    // If too high, go below
    if (labelY - 20 < chartTop) {
      labelY = py + r + 20;
    }

    return { labelX, labelY, anchor, px, py };
  });

  // Nudge vertically if labels overlap
  for (let i = 1; i < labelPositions.length; i++) {
    for (let j = 0; j < i; j++) {
      const a = labelPositions[i];
      const b = labelPositions[j];
      const dx = Math.abs(a.labelX - b.labelX);
      const dy = Math.abs(a.labelY - b.labelY);
      if (dx < 120 && dy < 28) {
        labelPositions[i].labelY = b.labelY + 30;
      }
    }
  }

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

      {/* Horizontal grid lines */}
      {gridPcts.map((pct) => {
        const y = chartBottom - pct * chartHeight;
        return (
          <div
            key={`hg-${pct}`}
            style={{
              position: "absolute",
              left: chartLeft,
              width: chartWidth,
              top: y,
              height: 1,
              backgroundColor: tokens.colors.textMuted,
              opacity: gridOpacity,
            }}
          />
        );
      })}

      {/* Vertical grid lines */}
      {gridPcts.map((pct) => {
        const x = chartLeft + pct * chartWidth;
        return (
          <div
            key={`vg-${pct}`}
            style={{
              position: "absolute",
              left: x,
              top: chartTop,
              width: 1,
              height: chartHeight,
              backgroundColor: tokens.colors.textMuted,
              opacity: gridOpacity,
            }}
          />
        );
      })}

      {/* X axis line */}
      <div
        style={{
          position: "absolute",
          left: chartLeft,
          top: chartBottom,
          width: chartWidth * axisProgress,
          height: 2,
          backgroundColor: tokens.colors.textMuted,
          opacity: 0.4,
        }}
      />

      {/* Y axis line */}
      <div
        style={{
          position: "absolute",
          left: chartLeft,
          bottom: tokens.layout.height - chartBottom,
          width: 2,
          height: chartHeight * axisProgress,
          backgroundColor: tokens.colors.textMuted,
          opacity: 0.4,
        }}
      />

      {/* X axis label */}
      <div
        style={{
          position: "absolute",
          left: chartLeft,
          width: chartWidth,
          top: chartBottom + 40,
          textAlign: "center" as const,
          fontSize: 18,
          fontWeight: tokens.fontWeights.medium,
          color: tokens.colors.textMuted,
          textTransform: "uppercase" as const,
          letterSpacing: 1.5,
          opacity: interpolate(frame, [15, 30], [0, 0.8], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {xLabel}
      </div>

      {/* Y axis label */}
      <div
        style={{
          position: "absolute",
          left: tokens.layout.padding - 10,
          top: chartTop + chartHeight / 2,
          transform: "rotate(-90deg)",
          transformOrigin: "center center",
          fontSize: 18,
          fontWeight: tokens.fontWeights.medium,
          color: tokens.colors.textMuted,
          textTransform: "uppercase" as const,
          letterSpacing: 1.5,
          opacity: interpolate(frame, [15, 30], [0, 0.8], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {yLabel}
      </div>

      {/* Axis tick values */}
      {/* X axis ticks */}
      {[0, 0.5, 1.0].map((pct) => {
        const val = xPadded.min + pct * (xPadded.max - xPadded.min);
        const x = chartLeft + pct * chartWidth;
        return (
          <div
            key={`xt-${pct}`}
            style={{
              position: "absolute",
              left: x - 30,
              width: 60,
              top: chartBottom + 12,
              textAlign: "center" as const,
              fontSize: 13,
              color: tokens.colors.textMuted,
              opacity: interpolate(frame, [15, 30], [0, 0.6], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            {Number.isInteger(val) ? val : val.toFixed(1)}
          </div>
        );
      })}

      {/* Y axis ticks */}
      {[0, 0.5, 1.0].map((pct) => {
        const val = yPadded.min + pct * (yPadded.max - yPadded.min);
        const y = chartBottom - pct * chartHeight;
        return (
          <div
            key={`yt-${pct}`}
            style={{
              position: "absolute",
              right: tokens.layout.width - chartLeft + 12,
              top: y - 8,
              width: 55,
              textAlign: "right" as const,
              fontSize: 13,
              color: tokens.colors.textMuted,
              opacity: interpolate(frame, [15, 30], [0, 0.6], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            {Number.isInteger(val) ? val : val.toFixed(1)}
          </div>
        );
      })}

      {/* Dots and labels */}
      {sorted.map((pt, i) => {
        const staggerDelay = 18 + i * 6;
        const dotR = pt.size ?? tokens.chart.dotRadius;
        const color = pt.color ?? tokens.colors.chart[i % tokens.colors.chart.length];
        const { px, py, labelX, labelY, anchor } = labelPositions[i];

        // Dot fade in
        const dotScale = spring({
          frame: frame - staggerDelay,
          fps,
          config: { damping: 14, stiffness: 100 },
        });

        // Label appears shortly after dot
        const labelOpacity = interpolate(
          frame,
          [staggerDelay + 6, staggerDelay + 16],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        return (
          <div key={pt.label}>
            {/* Dot */}
            <div
              style={{
                position: "absolute",
                left: px - dotR,
                top: py - dotR,
                width: dotR * 2,
                height: dotR * 2,
                borderRadius: "50%",
                backgroundColor: color,
                transform: `scale(${Math.min(dotScale, 1)})`,
                opacity: interpolate(dotScale, [0, 0.3], [0, 1], {
                  extrapolateRight: "clamp",
                }),
              }}
            />

            {/* Label */}
            <div
              style={{
                position: "absolute",
                left: anchor === "left" ? labelX : undefined,
                right:
                  anchor === "right"
                    ? tokens.layout.width - labelX
                    : undefined,
                top: labelY - 10,
                fontSize: 16,
                fontWeight: tokens.fontWeights.medium,
                color: tokens.colors.text,
                opacity: labelOpacity,
                whiteSpace: "nowrap" as const,
                lineHeight: 1,
              }}
            >
              {pt.label}
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
