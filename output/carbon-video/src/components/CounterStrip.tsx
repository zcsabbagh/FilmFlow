import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { tokens } from "../tokens";

type Counter = {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  color?: string;
};

type Props = {
  counters: Counter[];
  title?: string;
  source?: string;
};

const formatNumber = (n: number): string => {
  return Math.round(n).toLocaleString();
};

export const CounterStrip: React.FC<Props> = ({ counters, title, source }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title animation
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const titleSlide = interpolate(frame, [0, 15], [20, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Source animation
  const sourceDelay = 15 * counters.length + 50;
  const sourceOpacity = interpolate(
    frame,
    [sourceDelay, sourceDelay + 15],
    [0, 1],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

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
        position: "relative",
        fontFamily: tokens.fonts.body,
      }}
    >
      {/* Title */}
      {title && (
        <div
          style={{
            position: "absolute",
            top: 80,
            left: tokens.layout.padding,
            fontFamily: tokens.fonts.heading,
            fontSize: 42,
            fontWeight: tokens.fontWeights.bold,
            color: tokens.colors.text,
            opacity: titleOpacity,
            transform: `translateY(${titleSlide}px)`,
            maxWidth: 900,
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>
      )}

      {/* Counters row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-evenly",
          width: "100%",
          paddingLeft: tokens.layout.padding,
          paddingRight: tokens.layout.padding,
          marginTop: title ? 60 : 0,
        }}
      >
        {counters.map((counter, i) => {
          const staggerDelay = i * 15;
          const counterColor = counter.color ?? tokens.colors.accent;

          // Count up with spring
          const countProgress = spring({
            frame: frame - staggerDelay,
            fps,
            config: { damping: 35, stiffness: 50 },
          });
          // Snap to final value when spring is very close
          const displayValue =
            countProgress > 0.995
              ? counter.value
              : counter.value * countProgress;

          // Number opacity
          const numberOpacity = interpolate(
            frame,
            [staggerDelay, staggerDelay + 10],
            [0, 1],
            { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
          );

          // Number scale — starts slightly oversized, settles
          const numberScale = interpolate(
            spring({
              frame: frame - staggerDelay,
              fps,
              config: { damping: 12, stiffness: 60 },
            }),
            [0, 1],
            [0.85, 1]
          );

          // Accent line draws after number lands
          const lineDelay = staggerDelay + 25;
          const lineProgress = spring({
            frame: frame - lineDelay,
            fps,
            config: { damping: 20, stiffness: 70 },
          });

          // Label fades in after line
          const labelDelay = lineDelay + 8;
          const labelOpacity = interpolate(
            frame,
            [labelDelay, labelDelay + 15],
            [0, 1],
            { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
          );
          const labelSlide = interpolate(
            frame,
            [labelDelay, labelDelay + 15],
            [12, 0],
            { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
          );

          return (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: 200,
              }}
            >
              {/* Big number */}
              <div
                style={{
                  fontFamily: tokens.fonts.heading,
                  fontSize: 80,
                  fontWeight: tokens.fontWeights.black,
                  color: counterColor,
                  lineHeight: 1,
                  opacity: numberOpacity,
                  transform: `scale(${numberScale})`,
                  whiteSpace: "nowrap" as const,
                }}
              >
                {counter.prefix ?? ""}
                {formatNumber(displayValue)}
                {counter.suffix ?? ""}
              </div>

              {/* Thin accent line */}
              <div
                style={{
                  width: 60 * lineProgress,
                  height: 2,
                  backgroundColor: counterColor,
                  marginTop: 16,
                  marginBottom: 16,
                  opacity: lineProgress * 0.5,
                }}
              />

              {/* Label */}
              <div
                style={{
                  fontFamily: tokens.fonts.body,
                  fontSize: 18,
                  fontWeight: tokens.fontWeights.medium,
                  color: tokens.colors.textMuted,
                  textAlign: "center" as const,
                  opacity: labelOpacity,
                  transform: `translateY(${labelSlide}px)`,
                  maxWidth: 200,
                  lineHeight: 1.4,
                }}
              >
                {counter.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Source */}
      {source && (
        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: tokens.layout.padding,
            fontFamily: tokens.fonts.body,
            fontSize: 14,
            color: tokens.colors.textLight,
            opacity: sourceOpacity,
          }}
        >
          Source: {source}
        </div>
      )}
    </div>
  );
};
