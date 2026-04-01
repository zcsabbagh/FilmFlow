import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { tokens } from "../tokens";

type Props = {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  caption?: string;
  source?: string;
};

export const StatCard: React.FC<Props> = ({
  value,
  label,
  prefix = "",
  suffix = "",
  caption,
  source,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Beat 1: Number counts up (frames 0-40)
  const countProgress = spring({
    frame,
    fps,
    config: { damping: 35, stiffness: 50 },
  });
  const displayValue = Math.round(value * countProgress);

  // Number scale — starts slightly large, settles
  const numberScale = interpolate(
    spring({ frame, fps, config: { damping: 12, stiffness: 60 } }),
    [0, 1],
    [0.85, 1]
  );
  const numberOpacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Beat 2: Horizontal rule draws across (frames 25-50)
  const ruleProgress = spring({
    frame: frame - 25,
    fps,
    config: { damping: 25, stiffness: 60 },
  });
  const ruleWidth = 280 * ruleProgress;

  // Beat 3: Label fades in (frames 35-55)
  const labelOpacity = interpolate(frame, [35, 50], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const labelSlide = interpolate(frame, [35, 50], [15, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Beat 4: Caption + source fade in (frames 50-70)
  const captionOpacity = interpolate(frame, [50, 65], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const captionSlide = interpolate(frame, [50, 65], [12, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  return (
    <div
      style={{
        width: tokens.layout.width,
        height: tokens.layout.height,
        backgroundColor: tokens.colors.background,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: tokens.fonts.heading,
        color: tokens.colors.text,
      }}
    >
      {/* Big serif number */}
      <div
        style={{
          fontSize: 140,
          fontWeight: tokens.fontWeights.black,
          fontFamily: tokens.fonts.heading,
          color: tokens.colors.primary,
          lineHeight: 1,
          transform: `scale(${numberScale})`,
          opacity: numberOpacity,
        }}
      >
        {prefix}
        {displayValue.toLocaleString()}
        {suffix}
      </div>

      {/* Horizontal rule */}
      <div
        style={{
          width: ruleWidth,
          height: 2,
          backgroundColor: tokens.colors.textMuted,
          marginTop: 28,
          marginBottom: 28,
          opacity: ruleProgress * 0.4,
        }}
      />

      {/* Label */}
      <div
        style={{
          fontSize: 32,
          fontFamily: tokens.fonts.body,
          fontWeight: tokens.fontWeights.medium,
          color: tokens.colors.textMuted,
          opacity: labelOpacity,
          transform: `translateY(${labelSlide}px)`,
          textAlign: "center" as const,
          maxWidth: 700,
          lineHeight: 1.4,
        }}
      >
        {label}
      </div>

      {/* Caption + source */}
      {(caption || source) && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            marginTop: 30,
            opacity: captionOpacity,
            transform: `translateY(${captionSlide}px)`,
          }}
        >
          {caption && (
            <div
              style={{
                fontSize: 20,
                color: tokens.colors.textMuted,
                fontFamily: tokens.fonts.body,
                fontWeight: tokens.fontWeights.regular,
                textAlign: "center" as const,
                maxWidth: 600,
                lineHeight: 1.5,
              }}
            >
              {caption}
            </div>
          )}
          {source && (
            <div
              style={{
                fontSize: 14,
                color: tokens.colors.textLight,
                fontFamily: tokens.fonts.body,
              }}
            >
              Source: {source}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
