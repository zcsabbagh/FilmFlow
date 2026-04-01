import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { tokens } from "../tokens";

type BubbleData = {
  label: string;
  value: number;
  color?: string;
};

type Props = {
  data: BubbleData[];
  title?: string;
  source?: string;
  showValues?: boolean;
  valuePrefix?: string;
  valueSuffix?: string;
};

export const BubbleScale: React.FC<Props> = ({
  data,
  title,
  source,
  showValues = true,
  valuePrefix = "",
  valueSuffix = "",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Sort by value descending so largest appears first in animation
  const sorted = [...data].sort((a, b) => b.value - a.value);

  // Compute radii proportional to area (area = value, so r = sqrt(value))
  const maxValue = Math.max(...sorted.map((d) => d.value));
  const sqrtMax = Math.sqrt(maxValue);

  // Available space for bubbles
  const chartLeft = tokens.layout.padding + 40;
  const chartRight = tokens.layout.width - tokens.layout.padding - 40;
  const chartWidth = chartRight - chartLeft;
  const centerY = tokens.layout.height / 2 + (title ? 20 : 0);

  // Maximum radius: constrained by available height and width
  const maxAvailableHeight =
    (tokens.layout.height - (title ? 320 : 220)) / 2;
  const maxRadiusByWidth = chartWidth / (sorted.length * 2.4);
  const maxRadius = Math.min(maxAvailableHeight, maxRadiusByWidth, 200);

  // Calculate actual radii
  const radii = sorted.map((d) => (Math.sqrt(d.value) / sqrtMax) * maxRadius);

  // Position bubbles horizontally: align bottoms to a common baseline
  // This creates the classic "scale comparison" look
  const bubbleBaseline = centerY + maxRadius * 0.4;

  // Calculate total width needed and center the group
  const bubbleSpacing = 24;
  const totalWidth =
    radii.reduce((sum, r) => sum + r * 2, 0) +
    (sorted.length - 1) * bubbleSpacing;
  const startX = chartLeft + (chartWidth - totalWidth) / 2;

  // Compute x positions
  const positions: number[] = [];
  let currentX = startX;
  for (let i = 0; i < sorted.length; i++) {
    positions.push(currentX + radii[i]);
    currentX += radii[i] * 2 + bubbleSpacing;
  }

  // Title animation
  const titleOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleSlide = interpolate(frame, [0, 18], [25, 0], {
    extrapolateRight: "clamp",
  });

  // Format value with prefix/suffix
  const formatValue = (val: number): string => {
    if (val >= 1000000) {
      return `${valuePrefix}${(val / 1000000).toFixed(1)}M${valueSuffix}`;
    }
    if (val >= 10000) {
      return `${valuePrefix}${(val / 1000).toFixed(1)}k${valueSuffix}`;
    }
    if (val >= 1000) {
      return `${valuePrefix}${val.toLocaleString()}${valueSuffix}`;
    }
    return `${valuePrefix}${val.toLocaleString()}${valueSuffix}`;
  };

  // Determine if a color is dark (for text contrast)
  const isDark = (hex: string): boolean => {
    const c = hex.replace("#", "");
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
  };

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

      {/* Bubbles */}
      {sorted.map((item, i) => {
        const r = radii[i];
        const cx = positions[i];
        const cy = bubbleBaseline - r; // bottom-aligned to baseline
        const color = item.color || tokens.colors.chart[i % tokens.colors.chart.length];

        // Stagger: largest first, 15 frames apart
        const delay = 8 + i * 15;
        const scaleProgress = spring({
          frame: frame - delay,
          fps,
          config: { damping: 14, stiffness: 60 },
        });

        // Value label appears after bubble lands
        const valueLabelDelay = delay + 18;
        const valueOpacity = interpolate(
          frame,
          [valueLabelDelay, valueLabelDelay + 12],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        const valueSlide = interpolate(
          frame,
          [valueLabelDelay, valueLabelDelay + 12],
          [8, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        // Determine if value fits inside the bubble
        const valueInside = r > 40;
        const fontSize = Math.max(16, Math.min(32, r * 0.45));
        const labelFontSize = Math.max(14, Math.min(20, r * 0.28));

        return (
          <div key={item.label}>
            {/* Bubble circle */}
            <div
              style={{
                position: "absolute",
                left: cx - r,
                top: cy - r,
                width: r * 2,
                height: r * 2,
                borderRadius: "50%",
                backgroundColor: color,
                transform: `scale(${scaleProgress})`,
                opacity: interpolate(scaleProgress, [0, 0.3], [0, 1], {
                  extrapolateRight: "clamp",
                }),
              }}
            />

            {/* Value label inside bubble */}
            {showValues && valueInside && (
              <div
                style={{
                  position: "absolute",
                  left: cx - r,
                  top: cy - fontSize / 2 - 2,
                  width: r * 2,
                  textAlign: "center" as const,
                  fontSize,
                  fontWeight: tokens.fontWeights.bold,
                  fontFamily: tokens.fonts.heading,
                  color: isDark(color) ? "#ffffff" : tokens.colors.primary,
                  opacity: valueOpacity,
                  transform: `translateY(${valueSlide}px)`,
                  textShadow: isDark(color)
                    ? "0 1px 4px rgba(0,0,0,0.3)"
                    : "0 1px 2px rgba(255,255,255,0.4)",
                }}
              >
                {formatValue(item.value)}
              </div>
            )}

            {/* Value label below bubble (for small bubbles) */}
            {showValues && !valueInside && (
              <div
                style={{
                  position: "absolute",
                  left: cx - 60,
                  top: bubbleBaseline + 8,
                  width: 120,
                  textAlign: "center" as const,
                  fontSize: 18,
                  fontWeight: tokens.fontWeights.bold,
                  fontFamily: tokens.fonts.heading,
                  color: tokens.colors.primary,
                  opacity: valueOpacity,
                  transform: `translateY(${valueSlide}px)`,
                }}
              >
                {formatValue(item.value)}
              </div>
            )}

            {/* Label below bubble */}
            <div
              style={{
                position: "absolute",
                left: cx - 80,
                top: bubbleBaseline + (valueInside ? 12 : 34),
                width: 160,
                textAlign: "center" as const,
                fontSize: labelFontSize,
                fontWeight: tokens.fontWeights.medium,
                color: tokens.colors.textMuted,
                opacity: valueOpacity,
                transform: `translateY(${valueSlide}px)`,
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
