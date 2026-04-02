import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { tokens } from "../tokens";

type IconType = "person" | "house" | "dollar" | "car" | "tree";

type Props = {
  count: number;
  iconType: IconType;
  label: string;
  title?: string;
  source?: string;
  iconSize?: number;
  perRow?: number;
  highlightCount?: number;
  highlightColor?: string;
};

/** Simple SVG icon paths — minimal, clean shapes */
const renderIcon = (
  type: IconType,
  size: number,
  fill: string,
) => {
  const s = size;
  const half = s / 2;

  switch (type) {
    case "person":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          {/* Head */}
          <circle cx="20" cy="10" r="6" fill={fill} />
          {/* Shoulders/body */}
          <path
            d="M8 34 C8 22 14 18 20 18 C26 18 32 22 32 34"
            fill={fill}
          />
        </svg>
      );
    case "house":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          {/* Roof triangle */}
          <polygon points="20,4 4,20 36,20" fill={fill} />
          {/* Body rectangle */}
          <rect x="8" y="20" width="24" height="16" fill={fill} />
          {/* Door */}
          <rect x="16" y="26" width="8" height="10" fill={tokens.colors.background} />
        </svg>
      );
    case "dollar":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="16" fill={fill} />
          <text
            x="20"
            y="26"
            textAnchor="middle"
            fontFamily={tokens.fonts.body}
            fontSize="18"
            fontWeight="700"
            fill={tokens.colors.background}
          >
            $
          </text>
        </svg>
      );
    case "car":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          {/* Car body */}
          <rect x="4" y="18" width="32" height="12" rx="3" fill={fill} />
          {/* Roof */}
          <path d="M10 18 L14 8 L26 8 L30 18" fill={fill} />
          {/* Wheels */}
          <circle cx="12" cy="30" r="4" fill={fill} />
          <circle cx="28" cy="30" r="4" fill={fill} />
          <circle cx="12" cy="30" r="2" fill={tokens.colors.background} />
          <circle cx="28" cy="30" r="2" fill={tokens.colors.background} />
        </svg>
      );
    case "tree":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          {/* Trunk */}
          <rect x="17" y="28" width="6" height="10" fill={fill} opacity={0.7} />
          {/* Foliage layers */}
          <polygon points="20,2 8,20 32,20" fill={fill} />
          <polygon points="20,10 6,28 34,28" fill={fill} />
        </svg>
      );
    default:
      return null;
  }
};

export const Pictogram: React.FC<Props> = ({
  count,
  iconType,
  label,
  title,
  source,
  iconSize = 40,
  perRow = 10,
  highlightCount,
  highlightColor = tokens.colors.accent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const highlightN = highlightCount ?? count;
  const rows = Math.ceil(count / perRow);

  // Grid layout
  const gap = 8;
  const gridWidth = perRow * (iconSize + gap) - gap;
  const gridHeight = rows * (iconSize + gap) - gap;
  const gridLeft = (tokens.layout.width - gridWidth) / 2;
  const gridTop = (tokens.layout.height - gridHeight) / 2 - 20;

  // Title fade
  const titleOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Source fade
  const sourceOpacity = interpolate(frame, [50, 65], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Count number appears after all icons
  const allIconsDelay = 10 + count * 2;
  const countOpacity = interpolate(
    frame,
    [allIconsDelay, allIconsDelay + 15],
    [0, 1],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" },
  );
  const countSlide = interpolate(
    frame,
    [allIconsDelay, allIconsDelay + 15],
    [20, 0],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" },
  );

  // Label
  const labelOpacity = interpolate(
    frame,
    [allIconsDelay + 5, allIconsDelay + 20],
    [0, 1],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" },
  );

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

      {/* Icon grid */}
      {Array.from({ length: count }).map((_, i) => {
        const row = Math.floor(i / perRow);
        const col = i % perRow;
        const x = gridLeft + col * (iconSize + gap);
        const y = gridTop + row * (iconSize + gap);

        // Stagger: 2-frame delay per icon
        const staggerDelay = 10 + i * 2;
        const iconScale = spring({
          frame: frame - staggerDelay,
          fps,
          config: { damping: 14, stiffness: 120 },
        });

        const isHighlighted = i < highlightN;
        const fillColor = isHighlighted ? highlightColor : tokens.colors.textLight;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: iconSize,
              height: iconSize,
              transform: `scale(${iconScale})`,
              transformOrigin: "center center",
              opacity: iconScale > 0.01 ? 1 : 0,
            }}
          >
            {renderIcon(iconType, iconSize, fillColor)}
          </div>
        );
      })}

      {/* Count number */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: gridTop + gridHeight + 40,
          textAlign: "center" as const,
          opacity: countOpacity,
          transform: `translateY(${countSlide}px)`,
        }}
      >
        <span
          style={{
            fontFamily: tokens.fonts.heading,
            fontSize: 64,
            fontWeight: tokens.fontWeights.black,
            color: highlightColor,
          }}
        >
          {highlightCount != null
            ? `${highlightCount} / ${count}`
            : count.toLocaleString()}
        </span>
      </div>

      {/* Label */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: gridTop + gridHeight + 120,
          textAlign: "center" as const,
          fontSize: 28,
          fontFamily: tokens.fonts.body,
          fontWeight: tokens.fontWeights.medium,
          color: tokens.colors.textMuted,
          opacity: labelOpacity,
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
