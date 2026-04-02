import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { tokens } from "../tokens";

type TimelineEvent = {
  date: string;
  title: string;
  description?: string;
  highlight?: boolean;
};

type Props = {
  events: TimelineEvent[];
  title?: string;
  source?: string;
};

export const HorizontalTimeline: React.FC<Props> = ({ events, title, source }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pad = tokens.layout.padding;
  const lineY = tokens.layout.height * 0.6;
  const lineLeft = pad + 40;
  const lineRight = tokens.layout.width - pad - 40;
  const lineWidth = lineRight - lineLeft;

  // Horizontal line draws left-to-right over ~30 frames
  const lineProgress = interpolate(frame, [8, 38], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const drawnLineWidth = lineWidth * lineProgress;

  // Title animation
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleSlide = interpolate(frame, [0, 15], [20, 0], {
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
            top: pad,
            left: pad,
            right: pad,
            fontSize: 46,
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

      {/* Horizontal line */}
      <div
        style={{
          position: "absolute",
          left: lineLeft,
          top: lineY,
          width: drawnLineWidth,
          height: 3,
          backgroundColor: tokens.colors.textMuted,
          borderRadius: 1.5,
        }}
      />

      {/* Events */}
      {events.map((event, i) => {
        const count = events.length;
        // Position events evenly along the line
        const eventX = lineLeft + (i / Math.max(count - 1, 1)) * lineWidth;

        // Each event triggers when the line reaches its position
        const eventLinePos = i / Math.max(count - 1, 1);
        const lineReachesFrame = 8 + eventLinePos * 30; // line draws 8-38

        // Stem draws upward after line arrives
        const stemHeight = 60;
        const stemProgress = spring({
          frame: frame - lineReachesFrame,
          fps,
          config: { damping: 22, stiffness: 120 },
        });

        // Label fades in after stem
        const labelOpacity = interpolate(
          frame,
          [lineReachesFrame + 6, lineReachesFrame + 16],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );
        const labelSlide = interpolate(
          frame,
          [lineReachesFrame + 6, lineReachesFrame + 16],
          [12, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );

        // Date fades in slightly after stem
        const dateOpacity = interpolate(
          frame,
          [lineReachesFrame + 4, lineReachesFrame + 14],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );

        const isHighlight = event.highlight ?? false;
        const stemColor = isHighlight ? tokens.colors.accent : tokens.colors.textMuted;
        const dotColor = isHighlight ? tokens.colors.accent : tokens.colors.primary;

        return (
          <div key={i}>
            {/* Vertical stem (draws upward from the line) */}
            <div
              style={{
                position: "absolute",
                left: eventX - 1.5,
                top: lineY - stemHeight * stemProgress,
                width: 3,
                height: stemHeight * stemProgress,
                backgroundColor: stemColor,
                borderRadius: 1.5,
              }}
            />

            {/* Dot at top of stem */}
            <div
              style={{
                position: "absolute",
                left: eventX - 6,
                top: lineY - stemHeight * stemProgress - 6,
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: dotColor,
                opacity: stemProgress,
              }}
            />

            {/* Title above stem */}
            <div
              style={{
                position: "absolute",
                left: eventX - 90,
                width: 180,
                top: lineY - stemHeight - 58,
                textAlign: "center" as const,
                fontSize: 22,
                fontWeight: isHighlight
                  ? tokens.fontWeights.bold
                  : tokens.fontWeights.semibold,
                fontFamily: tokens.fonts.heading,
                color: isHighlight ? tokens.colors.accent : tokens.colors.primary,
                opacity: labelOpacity,
                transform: `translateY(${labelSlide}px)`,
                lineHeight: 1.3,
              }}
            >
              {event.title}
            </div>

            {/* Description above title */}
            {event.description && (
              <div
                style={{
                  position: "absolute",
                  left: eventX - 100,
                  width: 200,
                  top: lineY - stemHeight - 100,
                  textAlign: "center" as const,
                  fontSize: 16,
                  fontWeight: tokens.fontWeights.regular,
                  fontFamily: tokens.fonts.body,
                  color: tokens.colors.textMuted,
                  opacity: labelOpacity,
                  transform: `translateY(${labelSlide}px)`,
                  lineHeight: 1.3,
                }}
              >
                {event.description}
              </div>
            )}

            {/* Date below the line */}
            <div
              style={{
                position: "absolute",
                left: eventX - 70,
                width: 140,
                top: lineY + 14,
                textAlign: "center" as const,
                fontSize: 17,
                fontWeight: tokens.fontWeights.medium,
                fontFamily: tokens.fonts.body,
                color: tokens.colors.textMuted,
                opacity: dateOpacity,
              }}
            >
              {event.date}
            </div>
          </div>
        );
      })}

      {/* Source */}
      {source && (
        <div
          style={{
            position: "absolute",
            bottom: pad - 20,
            left: pad,
            fontSize: 14,
            color: tokens.colors.textLight,
            fontFamily: tokens.fonts.body,
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
