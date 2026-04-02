import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { tokens } from "../tokens";

type Props = {
  value: number;
  label: string;
  title?: string;
  source?: string;
  filledColor?: string;
  emptyColor?: string;
};

export const WaffleChart: React.FC<Props> = ({
  value,
  label,
  title,
  source,
  filledColor = tokens.colors.accent,
  emptyColor = tokens.colors.backgroundAlt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const clampedValue = Math.min(100, Math.max(0, value));
  const filledCount = Math.round(clampedValue);

  // Title animation
  const titleOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleSlide = interpolate(frame, [0, 18], [20, 0], {
    extrapolateRight: "clamp",
  });

  // Grid dimensions
  const squareSize = 40;
  const gap = 6;
  const cols = 10;
  const rows = 10;
  const gridWidth = cols * squareSize + (cols - 1) * gap;
  const gridHeight = rows * squareSize + (rows - 1) * gap;

  // Number count-up synced to grid fill
  const totalStaggerDuration = 60; // all squares animate within ~60 frames
  const overallProgress = interpolate(frame, [8, 8 + totalStaggerDuration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const displayValue = Math.round(clampedValue * overallProgress);

  // Number animation
  const numberSpring = spring({
    frame: frame - 5,
    fps,
    config: { damping: 30, stiffness: 40 },
  });
  const numberOpacity = interpolate(frame, [5, 15], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Label animation
  const labelOpacity = interpolate(frame, [40, 55], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const labelSlide = interpolate(frame, [40, 55], [12, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Source animation
  const sourceOpacity = interpolate(frame, [55, 70], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Center the grid + number layout
  const layoutGap = 80;
  const numberWidth = 280;
  const totalContentWidth = gridWidth + layoutGap + numberWidth;
  const contentStartX = (tokens.layout.width - totalContentWidth) / 2;
  const contentCenterY = tokens.layout.height / 2;

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

      {/* Grid */}
      <div
        style={{
          position: "absolute",
          left: contentStartX,
          top: contentCenterY - gridHeight / 2,
          width: gridWidth,
          height: gridHeight,
          display: "flex",
          flexWrap: "wrap",
          gap,
        }}
      >
        {Array.from({ length: 100 }).map((_, i) => {
          const row = Math.floor(i / cols);
          const col = i % cols;
          const index = row * cols + col;
          const isFilled = index < filledCount;

          // Stagger: each square gets a slightly delayed spring
          const staggerDelay = 8 + index * 0.5;
          const scaleSpring = spring({
            frame: frame - staggerDelay,
            fps,
            config: { damping: 14, stiffness: 120 },
          });

          return (
            <div
              key={i}
              style={{
                width: squareSize,
                height: squareSize,
                borderRadius: 4,
                backgroundColor: isFilled ? filledColor : emptyColor,
                transform: `scale(${scaleSpring})`,
              }}
            />
          );
        })}
      </div>

      {/* Big percentage number */}
      <div
        style={{
          position: "absolute",
          left: contentStartX + gridWidth + layoutGap,
          top: contentCenterY - 60,
          width: numberWidth,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          opacity: numberOpacity,
        }}
      >
        <div
          style={{
            fontSize: 120,
            fontWeight: tokens.fontWeights.black,
            fontFamily: tokens.fonts.heading,
            color: tokens.colors.primary,
            lineHeight: 1,
            transform: `scale(${interpolate(numberSpring, [0, 1], [0.85, 1])})`,
            transformOrigin: "left center",
          }}
        >
          {displayValue}%
        </div>
      </div>

      {/* Label */}
      <div
        style={{
          position: "absolute",
          left: contentStartX,
          top: contentCenterY + gridHeight / 2 + 32,
          width: gridWidth + layoutGap + numberWidth,
          fontSize: 26,
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
