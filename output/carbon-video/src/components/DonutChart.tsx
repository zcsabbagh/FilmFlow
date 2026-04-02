import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { tokens } from "../tokens";

type Props = {
  value: number;
  label: string;
  title?: string;
  source?: string;
  color?: string;
  compareValue?: number;
  compareLabel?: string;
  compareColor?: string;
};

const DonutRing: React.FC<{
  value: number;
  label: string;
  color: string;
  radius: number;
  strokeWidth: number;
  frame: number;
  fps: number;
  delay: number;
}> = ({ value, label, color, radius, strokeWidth, frame, fps, delay }) => {
  const clampedValue = Math.min(100, Math.max(0, value));
  const circumference = 2 * Math.PI * radius;

  // Ring fill animation
  const fillSpring = spring({
    frame: frame - delay,
    fps,
    config: { damping: 30, stiffness: 40 },
  });
  const fillLength = (clampedValue / 100) * circumference * fillSpring;
  const gapLength = circumference - fillLength;

  // Number count-up
  const displayValue = Math.round(clampedValue * fillSpring);

  // Number opacity
  const numberOpacity = interpolate(frame, [delay, delay + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Label fade
  const labelOpacity = interpolate(frame, [delay + 25, delay + 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const labelSlide = interpolate(frame, [delay + 25, delay + 40], [10, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const size = (radius + strokeWidth / 2) * 2 + 8;
  const center = size / 2;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24,
      }}
    >
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          {/* Background ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={tokens.colors.backgroundAlt}
            strokeWidth={strokeWidth}
          />
          {/* Filled ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${fillLength} ${gapLength}`}
            strokeLinecap="butt"
          />
        </svg>
        {/* Center number */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: size,
            height: size,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: numberOpacity,
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
            {displayValue}%
          </span>
        </div>
      </div>
      {/* Label */}
      <div
        style={{
          fontSize: 24,
          fontFamily: tokens.fonts.body,
          fontWeight: tokens.fontWeights.medium,
          color: tokens.colors.textMuted,
          opacity: labelOpacity,
          transform: `translateY(${labelSlide}px)`,
          textAlign: "center" as const,
          maxWidth: 280,
          lineHeight: 1.4,
        }}
      >
        {label}
      </div>
    </div>
  );
};

export const DonutChart: React.FC<Props> = ({
  value,
  label,
  title,
  source,
  color = tokens.colors.accent,
  compareValue,
  compareLabel,
  compareColor = tokens.colors.chart[1],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isComparing = compareValue !== undefined;
  const radius = 120;
  const strokeWidth = 24;

  // Title animation
  const titleOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleSlide = interpolate(frame, [0, 18], [20, 0], {
    extrapolateRight: "clamp",
  });

  // Source animation
  const sourceOpacity = interpolate(frame, [60, 75], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
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

      {/* Donut(s) centered */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: tokens.layout.width,
          height: tokens.layout.height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: isComparing ? 140 : 0,
        }}
      >
        <DonutRing
          value={value}
          label={label}
          color={color}
          radius={radius}
          strokeWidth={strokeWidth}
          frame={frame}
          fps={fps}
          delay={10}
        />
        {isComparing && compareLabel && (
          <DonutRing
            value={compareValue}
            label={compareLabel}
            color={compareColor}
            radius={radius}
            strokeWidth={strokeWidth}
            frame={frame}
            fps={fps}
            delay={25}
          />
        )}
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
