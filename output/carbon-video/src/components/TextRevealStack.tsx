import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { tokens } from "../tokens";

type LineItem = {
  text: string;
  highlight?: boolean;
  color?: string;
};

type Props = {
  lines: LineItem[];
  title?: string;
  source?: string;
  staggerFrames?: number;
  startFrame?: number;
};

export const TextRevealStack: React.FC<Props> = ({
  lines,
  title,
  source,
  staggerFrames = 20,
  startFrame = 15,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title fade in
  const titleOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const titleSlide = interpolate(frame, [0, 12], [10, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Source fades in after all lines
  const lastLineFrame = startFrame + (lines.length - 1) * staggerFrames;
  const sourceOpacity = interpolate(
    frame,
    [lastLineFrame + 20, lastLineFrame + 35],
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
        justifyContent: "center",
        paddingLeft: tokens.layout.padding + 40,
        paddingRight: tokens.layout.padding + 40,
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
            top: 80,
            left: tokens.layout.padding + 40,
            fontFamily: tokens.fonts.heading,
            fontSize: 42,
            fontWeight: tokens.fontWeights.bold,
            color: tokens.colors.primary,
            opacity: titleOpacity,
            transform: `translateY(${titleSlide}px)`,
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>
      )}

      {/* Lines stack */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          marginTop: title ? 40 : 0,
        }}
      >
        {lines.map((line, i) => {
          const lineStart = startFrame + i * staggerFrames;
          const lineOpacity = interpolate(
            frame,
            [lineStart, lineStart + 12],
            [0, 1],
            { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
          );
          const lineSlideX = interpolate(
            frame,
            [lineStart, lineStart + 12],
            [40, 0],
            { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
          );

          // Accent left border for highlighted items — draws in
          const borderHeight = line.highlight
            ? interpolate(
                spring({
                  frame: frame - lineStart - 5,
                  fps,
                  config: { damping: 20, stiffness: 60 },
                }),
                [0, 1],
                [0, 1]
              )
            : 0;

          const textColor = line.color
            ? line.color
            : line.highlight
              ? tokens.colors.accent
              : tokens.colors.text;

          const fontSize = line.highlight ? 34 : 28;

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                opacity: lineOpacity,
                transform: `translateX(${lineSlideX}px)`,
              }}
            >
              {/* Accent border for highlighted lines */}
              <div
                style={{
                  width: 4,
                  height: fontSize * 1.4 * borderHeight,
                  backgroundColor: line.color ?? tokens.colors.accent,
                  borderRadius: 2,
                  opacity: line.highlight ? 1 : 0,
                  flexShrink: 0,
                }}
              />

              {/* Text */}
              <div
                style={{
                  fontSize,
                  fontFamily: tokens.fonts.body,
                  fontWeight: line.highlight
                    ? tokens.fontWeights.semibold
                    : tokens.fontWeights.regular,
                  color: textColor,
                  lineHeight: 1.4,
                  paddingLeft: line.highlight ? 0 : 20,
                }}
              >
                {line.text}
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
