import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { tokens } from "../tokens";

type Props = {
  startYear: number;
  endYear: number;
  frozenStat: string;
  label: string;
  title?: string;
  source?: string;
};

export const CalendarFlip: React.FC<Props> = ({
  startYear,
  endYear,
  frozenStat,
  label,
  title,
  source,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const totalYears = endYear - startYear;
  // Each year visible for ~3-4 frames, cycling starts at frame 15
  const framesPerYear = 3;
  const cycleStart = 15;
  const cycleDuration = totalYears * framesPerYear;
  const cycleEnd = cycleStart + cycleDuration;

  // Determine which year to show
  let displayYear: number;
  if (frame < cycleStart) {
    displayYear = startYear;
  } else if (frame >= cycleEnd) {
    displayYear = endYear;
  } else {
    const elapsed = frame - cycleStart;
    const yearIndex = Math.min(Math.floor(elapsed / framesPerYear), totalYears);
    displayYear = startYear + yearIndex;
  }

  // Year number opacity — fade in at start
  const yearOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Subtle scale pulse when year changes during cycling
  const isCycling = frame >= cycleStart && frame < cycleEnd;
  const withinYearFrame = isCycling ? (frame - cycleStart) % framesPerYear : 0;
  const yearScale = isCycling
    ? interpolate(withinYearFrame, [0, 1, 2], [1.02, 1, 0.99], {
        extrapolateRight: "clamp",
      })
    : 1;

  // Frozen stat — always visible, fades in early
  const statOpacity = interpolate(frame, [5, 18], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const statScale = interpolate(
    spring({ frame, fps, config: { damping: 15, stiffness: 50 } }),
    [0, 1],
    [0.9, 1]
  );

  // Label fades in
  const labelOpacity = interpolate(frame, [20, 35], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const labelSlide = interpolate(frame, [20, 35], [15, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Title
  const titleOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // After cycling ends, the final year gets a subtle emphasis
  const landed = frame >= cycleEnd;
  const landSpring = spring({
    frame: frame - cycleEnd,
    fps,
    config: { damping: 10, stiffness: 80 },
  });
  const finalYearScale = landed ? interpolate(landSpring, [0, 1], [1.05, 1]) : yearScale;
  const finalYearColor = landed
    ? interpolate(landSpring, [0, 0.5], [0, 1], { extrapolateRight: "clamp" })
    : 0;

  // Source
  const sourceOpacity = interpolate(frame, [cycleEnd + 10, cycleEnd + 25], [0, 1], {
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
        position: "relative",
      }}
    >
      {/* Title */}
      {title && (
        <div
          style={{
            position: "absolute",
            top: 80,
            left: tokens.layout.padding,
            fontFamily: tokens.fonts.body,
            fontSize: 16,
            fontWeight: tokens.fontWeights.semibold,
            color: tokens.colors.textMuted,
            textTransform: "uppercase" as const,
            letterSpacing: 3,
            opacity: titleOpacity,
          }}
        >
          {title}
        </div>
      )}

      {/* Year number — large serif, cycles through years */}
      <div
        style={{
          fontSize: 180,
          fontWeight: tokens.fontWeights.black,
          fontFamily: tokens.fonts.heading,
          color: finalYearColor > 0.5 ? tokens.colors.secondary : tokens.colors.primary,
          lineHeight: 1,
          opacity: yearOpacity,
          transform: `scale(${finalYearScale})`,
          marginBottom: 20,
        }}
      >
        {displayYear}
      </div>

      {/* Thin separator */}
      <div
        style={{
          width: 120,
          height: 2,
          backgroundColor: tokens.colors.textMuted,
          opacity: 0.3,
          marginBottom: 30,
        }}
      />

      {/* Frozen stat — stays the same the whole time */}
      <div
        style={{
          fontSize: 120,
          fontWeight: tokens.fontWeights.black,
          fontFamily: tokens.fonts.heading,
          color: tokens.colors.accent,
          lineHeight: 1,
          opacity: statOpacity,
          transform: `scale(${statScale})`,
        }}
      >
        {frozenStat}
      </div>

      {/* Label */}
      <div
        style={{
          fontSize: 28,
          fontFamily: tokens.fonts.body,
          fontWeight: tokens.fontWeights.medium,
          color: tokens.colors.textMuted,
          opacity: labelOpacity,
          transform: `translateY(${labelSlide}px)`,
          textAlign: "center" as const,
          maxWidth: 700,
          lineHeight: 1.4,
          marginTop: 24,
        }}
      >
        {label}
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
