import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { tokens } from "../tokens";

type Props = {
  value: number;
  total: number;
  label: string;
  title?: string;
  source?: string;
  barColor?: string;
  showPercentage?: boolean;
};

export const ProgressBar: React.FC<Props> = ({
  value,
  total,
  label,
  title,
  source,
  barColor = tokens.colors.accent,
  showPercentage = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const percentage = Math.min(100, Math.max(0, (value / total) * 100));
  const barFullWidth = tokens.layout.width - tokens.layout.padding * 2;
  const barHeight = 48;

  // Phase 1: Title appears (frames 0-18)
  const titleOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleSlide = interpolate(frame, [0, 18], [20, 0], {
    extrapolateRight: "clamp",
  });

  // Phase 2: Label appears (frames 10-25)
  const labelOpacity = interpolate(frame, [10, 25], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const labelSlide = interpolate(frame, [10, 25], [10, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Phase 3: Total number counts up (frames 15-40)
  const totalSpring = spring({
    frame: frame - 15,
    fps,
    config: { damping: 35, stiffness: 50 },
  });
  const displayTotal = Math.round(total * totalSpring);
  const totalOpacity = interpolate(frame, [15, 25], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Phase 4: Bar background appears (frames 25-35)
  const barBgOpacity = interpolate(frame, [25, 35], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Phase 5: Bar fills (frames 35+)
  const barFillSpring = spring({
    frame: frame - 35,
    fps,
    config: { damping: 22, stiffness: 60 },
  });
  const barFillWidth = (percentage / 100) * barFullWidth * barFillSpring;

  // Phase 6: Current value appears (frames 55+)
  const valueSpring = spring({
    frame: frame - 55,
    fps,
    config: { damping: 30, stiffness: 50 },
  });
  const displayValue = Math.round(value * valueSpring);
  const valueOpacity = interpolate(frame, [55, 65], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Percentage label at end of bar
  const pctOpacity = interpolate(frame, [50, 62], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const displayPct = Math.round(percentage * barFillSpring);

  // Source animation
  const sourceOpacity = interpolate(frame, [65, 80], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Vertical centering
  const centerY = tokens.layout.height / 2;
  const barTop = centerY - barHeight / 2;

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

      {/* Label */}
      <div
        style={{
          position: "absolute",
          top: barTop - 60,
          left: tokens.layout.padding,
          fontSize: 24,
          fontFamily: tokens.fonts.body,
          fontWeight: tokens.fontWeights.medium,
          color: tokens.colors.textMuted,
          opacity: labelOpacity,
          transform: `translateY(${labelSlide}px)`,
          lineHeight: 1.4,
        }}
      >
        {label}
      </div>

      {/* Bar background */}
      <div
        style={{
          position: "absolute",
          top: barTop,
          left: tokens.layout.padding,
          width: barFullWidth,
          height: barHeight,
          backgroundColor: tokens.colors.backgroundAlt,
          borderRadius: 0,
          opacity: barBgOpacity,
        }}
      />

      {/* Bar fill */}
      <div
        style={{
          position: "absolute",
          top: barTop,
          left: tokens.layout.padding,
          width: barFillWidth,
          height: barHeight,
          backgroundColor: barColor,
          borderRadius: 0,
        }}
      />

      {/* Percentage at end of bar */}
      {showPercentage && (
        <div
          style={{
            position: "absolute",
            top: barTop + barHeight / 2 - 14,
            left: tokens.layout.padding + barFillWidth + 16,
            fontSize: 22,
            fontWeight: tokens.fontWeights.bold,
            fontFamily: tokens.fonts.body,
            color: tokens.colors.textMuted,
            opacity: pctOpacity,
            whiteSpace: "nowrap",
          }}
        >
          {displayPct}%
        </div>
      )}

      {/* Current value — big serif */}
      <div
        style={{
          position: "absolute",
          top: barTop + barHeight + 28,
          left: tokens.layout.padding,
          display: "flex",
          alignItems: "baseline",
          gap: 12,
          opacity: valueOpacity,
        }}
      >
        <span
          style={{
            fontSize: 72,
            fontWeight: tokens.fontWeights.black,
            fontFamily: tokens.fonts.heading,
            color: tokens.colors.primary,
            lineHeight: 1,
          }}
        >
          {displayValue.toLocaleString()}
        </span>
        <span
          style={{
            fontSize: 28,
            fontFamily: tokens.fonts.body,
            fontWeight: tokens.fontWeights.medium,
            color: tokens.colors.textMuted,
          }}
        >
          of {displayTotal.toLocaleString()}
        </span>
      </div>

      {/* Total at far right of bar */}
      <div
        style={{
          position: "absolute",
          top: barTop + barHeight + 28,
          right: tokens.layout.padding,
          fontSize: 20,
          fontFamily: tokens.fonts.body,
          fontWeight: tokens.fontWeights.medium,
          color: tokens.colors.textLight,
          opacity: totalOpacity,
          textAlign: "right" as const,
        }}
      >
        Goal: {displayTotal.toLocaleString()}
      </div>

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
