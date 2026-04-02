import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { tokens } from "../tokens";

type IconType = "person" | "house" | "dollar" | "circle";

type Props = {
  totalIcons: number;
  highlightedIcons: number;
  iconType?: IconType;
  label: string;
  highlightLabel: string;
  title?: string;
  source?: string;
  highlightColor?: string;
  baseColor?: string;
  columns?: number;
};

const PersonIcon: React.FC<{ color: string; size: number }> = ({
  color,
  size,
}) => (
  <svg width={size} height={size} viewBox="0 0 30 30">
    <circle cx="15" cy="9" r="5.5" fill={color} />
    <path
      d="M5 28 C5 20 10 16 15 16 C20 16 25 20 25 28"
      fill={color}
      stroke="none"
    />
  </svg>
);

const HouseIcon: React.FC<{ color: string; size: number }> = ({
  color,
  size,
}) => (
  <svg width={size} height={size} viewBox="0 0 30 30">
    <path d="M15 4 L3 16 L7 16 L7 27 L23 27 L23 16 L27 16 Z" fill={color} />
  </svg>
);

const CircleIcon: React.FC<{ color: string; size: number }> = ({
  color,
  size,
}) => (
  <svg width={size} height={size} viewBox="0 0 30 30">
    <circle cx="15" cy="15" r="12" fill={color} />
  </svg>
);

const iconComponents: Record<
  IconType,
  React.FC<{ color: string; size: number }>
> = {
  person: PersonIcon,
  house: HouseIcon,
  dollar: CircleIcon,
  circle: CircleIcon,
};

export const IconGrid: React.FC<Props> = ({
  totalIcons,
  highlightedIcons,
  iconType = "circle",
  label,
  highlightLabel,
  title,
  source,
  highlightColor = tokens.colors.accent,
  baseColor = tokens.colors.textLight,
  columns = 10,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const IconComponent = iconComponents[iconType];
  const iconSize = 48;
  const iconGap = 10;
  const rows = Math.ceil(totalIcons / columns);

  // Grid dimensions
  const gridWidth = columns * (iconSize + iconGap) - iconGap;
  const gridHeight = rows * (iconSize + iconGap) - iconGap;

  // Title animation
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const titleSlide = interpolate(frame, [0, 15], [20, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Label animation — appears after grid has filled
  const labelDelay = Math.min(totalIcons * 1, 60) + 20;
  const labelOpacity = interpolate(
    frame,
    [labelDelay, labelDelay + 20],
    [0, 1],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );
  const labelSlide = interpolate(
    frame,
    [labelDelay, labelDelay + 20],
    [15, 0],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  // Source animation
  const sourceOpacity = interpolate(
    frame,
    [labelDelay + 10, labelDelay + 25],
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

      {/* Icon Grid */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          width: gridWidth,
          gap: iconGap,
          marginTop: title ? 40 : 0,
        }}
      >
        {Array.from({ length: totalIcons }).map((_, i) => {
          const isHighlighted = i < highlightedIcons;
          const staggerDelay = i * 1;

          // Icon appear animation
          const appearProgress = spring({
            frame: frame - staggerDelay,
            fps,
            config: { damping: 20, stiffness: 120 },
          });

          // Scale pulse for highlighted icons after they appear
          const pulseDelay = staggerDelay + 8;
          const pulseScale = isHighlighted
            ? interpolate(
                spring({
                  frame: frame - pulseDelay,
                  fps,
                  config: { damping: 8, stiffness: 80 },
                }),
                [0, 1],
                [1, 1.15]
              )
            : 1;

          const iconOpacity = interpolate(appearProgress, [0, 0.5], [0, 1], {
            extrapolateRight: "clamp",
          });
          const iconScale = interpolate(appearProgress, [0, 1], [0.3, 1]) * pulseScale;

          const color = isHighlighted ? highlightColor : baseColor;

          return (
            <div
              key={i}
              style={{
                width: iconSize,
                height: iconSize,
                opacity: iconOpacity,
                transform: `scale(${iconScale})`,
                flexShrink: 0,
              }}
            >
              <IconComponent color={color} size={iconSize} />
            </div>
          );
        })}
      </div>

      {/* Labels below grid */}
      <div
        style={{
          marginTop: 40,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          opacity: labelOpacity,
          transform: `translateY(${labelSlide}px)`,
        }}
      >
        <div
          style={{
            fontSize: 36,
            fontFamily: tokens.fonts.heading,
            fontWeight: tokens.fontWeights.bold,
            color: tokens.colors.text,
          }}
        >
          <span style={{ color: highlightColor }}>
            {highlightedIcons}
          </span>{" "}
          <span style={{ color: tokens.colors.textMuted }}>{label}</span>
        </div>
        <div
          style={{
            fontSize: 22,
            fontFamily: tokens.fonts.body,
            fontWeight: tokens.fontWeights.medium,
            color: tokens.colors.textMuted,
            maxWidth: 600,
            textAlign: "center" as const,
          }}
        >
          {highlightLabel}
        </div>
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
