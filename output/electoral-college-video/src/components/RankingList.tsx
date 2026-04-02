import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { tokens } from "../tokens";

type RankingItem = {
  label: string;
  value: number;
  highlight?: boolean;
};

type Props = {
  data: RankingItem[];
  title?: string;
  source?: string;
  valuePrefix?: string;
  valueSuffix?: string;
  maxItems?: number;
};

export const RankingList: React.FC<Props> = ({
  data,
  title,
  source,
  valuePrefix = "",
  valueSuffix = "",
  maxItems = 8,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Sort descending and limit
  const sorted = [...data].sort((a, b) => b.value - a.value).slice(0, maxItems);
  const maxValue = Math.max(...sorted.map((d) => d.value));

  // Chart area
  const chartTop = title ? 190 : 100;
  const chartBottom = tokens.layout.height - (source ? 120 : 80);
  const chartHeight = chartBottom - chartTop;
  const labelColumnWidth = 260;
  const valueColumnWidth = 140;
  const barLeft = tokens.layout.padding + 60 + labelColumnWidth;
  const barRight = tokens.layout.width - tokens.layout.padding - valueColumnWidth - 20;
  const barMaxWidth = barRight - barLeft;

  // Row sizing
  const rowHeight = Math.min(70, chartHeight / sorted.length);
  const rowGap = Math.max(4, (chartHeight - rowHeight * sorted.length) / Math.max(sorted.length - 1, 1));
  const totalListHeight = sorted.length * rowHeight + (sorted.length - 1) * rowGap;
  const listStartY = chartTop + (chartHeight - totalListHeight) / 2;

  // Title animation
  const titleOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleSlide = interpolate(frame, [0, 18], [25, 0], {
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
            top: tokens.layout.padding - 10,
            left: tokens.layout.padding,
            right: tokens.layout.padding,
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

      {/* Ranking rows */}
      {sorted.map((item, i) => {
        const staggerDelay = 10 + i * 12;
        const y = listStartY + i * (rowHeight + rowGap);

        // Slide up from below
        const slideProgress = spring({
          frame: frame - staggerDelay,
          fps,
          config: { damping: 22, stiffness: 80 },
        });
        const slideY = interpolate(slideProgress, [0, 1], [60, 0], {
          extrapolateRight: "clamp",
        });
        const rowOpacity = interpolate(slideProgress, [0, 0.3], [0, 1], {
          extrapolateRight: "clamp",
        });

        // Bar grows right
        const barProgress = spring({
          frame: frame - staggerDelay - 4,
          fps,
          config: { damping: 20, stiffness: 60 },
        });
        const barWidth = (item.value / maxValue) * barMaxWidth * Math.min(barProgress, 1);

        // Value appears after bar
        const valueOpacity = interpolate(
          frame,
          [staggerDelay + 14, staggerDelay + 24],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        const barColor = item.highlight
          ? tokens.colors.accent
          : tokens.colors.backgroundAlt;
        const barHeight = Math.min(rowHeight - 12, 40);

        return (
          <div
            key={item.label}
            style={{
              position: "absolute",
              left: tokens.layout.padding,
              right: tokens.layout.padding,
              top: y,
              height: rowHeight,
              opacity: rowOpacity,
              transform: `translateY(${slideY}px)`,
              display: "flex",
              alignItems: "center",
            }}
          >
            {/* Rank number */}
            <div
              style={{
                width: 50,
                fontSize: 32,
                fontWeight: tokens.fontWeights.bold,
                fontFamily: tokens.fonts.heading,
                color: item.highlight
                  ? tokens.colors.accent
                  : tokens.colors.textMuted,
                textAlign: "right" as const,
                marginRight: 16,
                lineHeight: 1,
              }}
            >
              {i + 1}
            </div>

            {/* Label */}
            <div
              style={{
                width: labelColumnWidth,
                fontSize: 22,
                fontWeight: tokens.fontWeights.medium,
                fontFamily: tokens.fonts.body,
                color: tokens.colors.text,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap" as const,
                lineHeight: 1,
              }}
            >
              {item.label}
            </div>

            {/* Bar */}
            <div
              style={{
                position: "relative",
                flexGrow: 1,
                height: barHeight,
                marginRight: 16,
              }}
            >
              {/* Track */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: "100%",
                  height: barHeight,
                  backgroundColor: tokens.colors.backgroundAlt,
                  borderRadius: 0,
                  opacity: 0.5,
                }}
              />
              {/* Fill */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: barWidth,
                  height: barHeight,
                  backgroundColor: barColor,
                  borderRadius: 0,
                }}
              />
            </div>

            {/* Value */}
            <div
              style={{
                width: valueColumnWidth,
                fontSize: 26,
                fontWeight: tokens.fontWeights.bold,
                fontFamily: tokens.fonts.heading,
                color: tokens.colors.primary,
                textAlign: "right" as const,
                opacity: valueOpacity,
                lineHeight: 1,
              }}
            >
              {valuePrefix}
              {Math.round(item.value * Math.min(barProgress, 1)).toLocaleString()}
              {valueSuffix}
            </div>
          </div>
        );
      })}

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
            opacity: interpolate(frame, [30, 45], [0, 1], {
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
