import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { tokens } from "../tokens";

type ComparisonItem = {
  label: string;
  value: number;
};

type Props = {
  items: ComparisonItem[];
  title?: string;
  caption?: string;
  source?: string;
  unit?: string;
  /** Legacy props for backward compatibility */
  leftLabel?: string;
  rightLabel?: string;
  leftValue?: number;
  rightValue?: number;
};

export const ComparisonChart: React.FC<Props> = ({
  items: itemsProp,
  title,
  caption,
  source,
  unit = "",
  leftLabel,
  rightLabel,
  leftValue,
  rightValue,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Support legacy props
  const items: ComparisonItem[] =
    itemsProp && itemsProp.length > 0
      ? itemsProp
      : leftLabel && rightLabel && leftValue !== undefined && rightValue !== undefined
        ? [
            { label: leftLabel, value: leftValue },
            { label: rightLabel, value: rightValue },
          ]
        : [];

  const maxValue = Math.max(...items.map((d) => d.value));

  // Title animation
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleSlide = interpolate(frame, [0, 20], [30, 0], {
    extrapolateRight: "clamp",
  });

  // Max bar width — generous, filling most of the frame
  const maxBarWidth = tokens.layout.width - tokens.layout.padding * 2 - 400;

  return (
    <div
      style={{
        width: tokens.layout.width,
        height: tokens.layout.height,
        backgroundColor: tokens.colors.background,
        padding: tokens.layout.padding,
        paddingLeft: tokens.layout.padding + 20,
        paddingRight: tokens.layout.padding + 20,
        fontFamily: tokens.fonts.body,
        color: tokens.colors.text,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      {/* Title */}
      {title && (
        <div
          style={{
            fontSize: 52,
            fontWeight: tokens.fontWeights.bold,
            fontFamily: tokens.fonts.heading,
            color: tokens.colors.primary,
            opacity: titleOpacity,
            transform: `translateY(${titleSlide}px)`,
            marginBottom: 12,
            lineHeight: 1.15,
          }}
        >
          {title}
        </div>
      )}

      {/* Subtitle / caption under title */}
      {caption && (
        <div
          style={{
            fontSize: 20,
            color: tokens.colors.textMuted,
            fontFamily: tokens.fonts.body,
            fontWeight: tokens.fontWeights.regular,
            opacity: interpolate(frame, [10, 25], [0, 1], {
              extrapolateRight: "clamp",
            }),
            marginBottom: 50,
          }}
        >
          {caption}
        </div>
      )}

      {/* Bars */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 36,
          marginTop: title ? 0 : 20,
        }}
      >
        {items.map((item, i) => {
          const barDelay = 15 + i * 12;
          const barProgress = spring({
            frame: frame - barDelay,
            fps,
            config: { damping: 22, stiffness: 60 },
          });

          const barWidth = (item.value / maxValue) * maxBarWidth * barProgress;

          // Number count-up
          const displayValue = Math.round(item.value * barProgress);

          // Label fade
          const labelOpacity = interpolate(
            frame,
            [barDelay - 5, barDelay + 5],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          // Value label fade (appears after bar grows)
          const valueOpacity = interpolate(
            frame,
            [barDelay + 10, barDelay + 20],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          return (
            <div key={item.label}>
              {/* Label row */}
              <div
                style={{
                  fontSize: 22,
                  fontWeight: tokens.fontWeights.semibold,
                  fontFamily: tokens.fonts.body,
                  color: tokens.colors.text,
                  opacity: labelOpacity,
                  marginBottom: 10,
                  letterSpacing: 0.3,
                  textTransform: "uppercase" as const,
                }}
              >
                {item.label}
              </div>

              {/* Bar + value */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                }}
              >
                {/* Bar */}
                <div
                  style={{
                    height: 48,
                    width: Math.max(barWidth, 4),
                    backgroundColor:
                      i === 0
                        ? tokens.colors.chart[0]
                        : tokens.colors.chart[1],
                    borderRadius: 0,
                  }}
                />

                {/* Value at end of bar */}
                <div
                  style={{
                    fontSize: 46,
                    fontWeight: tokens.fontWeights.black,
                    fontFamily: tokens.fonts.heading,
                    color: tokens.colors.primary,
                    opacity: valueOpacity,
                    whiteSpace: "nowrap",
                    lineHeight: 1,
                  }}
                >
                  {displayValue.toLocaleString()}
                  {unit ? ` ${unit}` : ""}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Source */}
      {source && (
        <div
          style={{
            fontSize: 14,
            color: tokens.colors.textLight,
            fontFamily: tokens.fonts.body,
            marginTop: 50,
            opacity: interpolate(frame, [40, 55], [0, 1], {
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
