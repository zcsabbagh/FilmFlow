import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { tokens } from "../tokens";

type Segment = {
  value: number;
  color: string;
  label?: string;
};

type BarData = {
  label: string;
  segments: Segment[];
};

type Props = {
  data: BarData[];
  title?: string;
  source?: string;
  orientation?: "horizontal" | "vertical";
  showLabels?: boolean;
};

export const StackedBarChart: React.FC<Props> = ({
  data,
  title,
  source,
  orientation = "vertical",
  showLabels = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isVertical = orientation === "vertical";

  // Determine if a color is dark (for text contrast)
  const isDark = (hex: string): boolean => {
    const c = hex.replace("#", "");
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
  };

  // Compute max total value across all bars for scaling
  const maxTotal = Math.max(
    ...data.map((bar) => bar.segments.reduce((sum, s) => sum + s.value, 0))
  );

  // Collect unique segment labels for legend
  const legendItems: Array<{ label: string; color: string }> = [];
  const seenLabels = new Set<string>();
  for (const bar of data) {
    for (const seg of bar.segments) {
      if (seg.label && !seenLabels.has(seg.label)) {
        seenLabels.add(seg.label);
        legendItems.push({ label: seg.label, color: seg.color });
      }
    }
  }

  // Chart area
  const chartLeft = tokens.layout.padding + 70;
  const chartRight = tokens.layout.width - tokens.layout.padding;
  const chartWidth = chartRight - chartLeft;
  const chartTop = title ? 200 : 140;
  const chartBottom = tokens.layout.height - 180;
  const chartHeight = chartBottom - chartTop;

  // Title animation
  const titleOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleSlide = interpolate(frame, [0, 18], [25, 0], {
    extrapolateRight: "clamp",
  });

  if (isVertical) {
    // Vertical: bars grow upward
    const totalBars = data.length;
    const barWidth = Math.min(80, Math.max(60, chartWidth / (totalBars * 1.6)));
    const barGap = barWidth * 0.35;
    const totalBarsWidth = totalBars * barWidth + (totalBars - 1) * barGap;
    const barsStartX = chartLeft + (chartWidth - totalBarsWidth) / 2;

    // Grid lines
    const gridLines = [0.25, 0.5, 0.75, 1.0];

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

        {/* Legend */}
        {legendItems.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: title ? tokens.layout.padding + 58 : tokens.layout.padding,
              left: tokens.layout.padding,
              display: "flex",
              gap: 28,
              opacity: interpolate(frame, [8, 22], [0, 1], {
                extrapolateRight: "clamp",
              }),
            }}
          >
            {legendItems.map((item) => (
              <div
                key={item.label}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <div
                  style={{
                    width: 14,
                    height: 14,
                    backgroundColor: item.color,
                    borderRadius: 2,
                  }}
                />
                <span
                  style={{
                    fontSize: 18,
                    color: tokens.colors.textMuted,
                    fontFamily: tokens.fonts.body,
                    fontWeight: tokens.fontWeights.medium,
                  }}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Grid lines */}
        {gridLines.map((pct) => {
          const y = chartBottom - pct * chartHeight;
          const gridOpacity = interpolate(frame, [5, 20], [0, 0.15], {
            extrapolateRight: "clamp",
          });
          return (
            <div key={pct}>
              <div
                style={{
                  position: "absolute",
                  left: chartLeft,
                  right: tokens.layout.padding,
                  top: y,
                  height: 1,
                  backgroundColor: tokens.colors.textMuted,
                  opacity: gridOpacity,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  right: tokens.layout.width - chartLeft + 12,
                  top: y - 8,
                  fontSize: 14,
                  color: tokens.colors.textMuted,
                  fontFamily: tokens.fonts.body,
                  textAlign: "right" as const,
                  width: 50,
                  opacity: interpolate(frame, [5, 20], [0, 0.6], {
                    extrapolateRight: "clamp",
                  }),
                }}
              >
                {Math.round(maxTotal * pct).toLocaleString()}
              </div>
            </div>
          );
        })}

        {/* Baseline */}
        <div
          style={{
            position: "absolute",
            left: chartLeft,
            right: tokens.layout.padding,
            top: chartBottom,
            height: 2,
            backgroundColor: tokens.colors.textMuted,
            opacity: interpolate(frame, [5, 15], [0, 0.3], {
              extrapolateRight: "clamp",
            }),
          }}
        />

        {/* Bars */}
        {data.map((bar, barIndex) => {
          const barX = barsStartX + barIndex * (barWidth + barGap);
          const totalValue = bar.segments.reduce((s, seg) => s + seg.value, 0);

          // X-axis label
          const labelDelay = 10 + barIndex * 8;
          const labelOpacity = interpolate(
            frame,
            [labelDelay, labelDelay + 10],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          // Build segments bottom-up
          let cumulativeHeight = 0;

          return (
            <div key={bar.label}>
              {bar.segments.map((seg, segIndex) => {
                const segDelay = 10 + barIndex * 8 + segIndex * 5;
                const segProgress = spring({
                  frame: frame - segDelay,
                  fps,
                  config: { damping: 18, stiffness: 80 },
                });

                const segHeight =
                  (seg.value / maxTotal) * chartHeight * segProgress;
                const fullSegHeight = (seg.value / maxTotal) * chartHeight;
                const segY = chartBottom - cumulativeHeight - segHeight;

                // Advance cumulative for next segment (use full target height
                // so stacking offsets are correct once prior segments complete)
                cumulativeHeight += fullSegHeight;

                // Value label inside segment (only if segment tall enough)
                const showSegValue =
                  showLabels && fullSegHeight > 30 && segProgress > 0.85;
                const segValueOpacity = showSegValue
                  ? interpolate(
                      frame,
                      [segDelay + 15, segDelay + 25],
                      [0, 1],
                      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                    )
                  : 0;

                return (
                  <div key={`${bar.label}-${segIndex}`}>
                    <div
                      style={{
                        position: "absolute",
                        left: barX,
                        width: barWidth,
                        height: segHeight,
                        top: segY,
                        backgroundColor: seg.color,
                      }}
                    />
                    {/* Value inside segment */}
                    {showLabels && fullSegHeight > 30 && (
                      <div
                        style={{
                          position: "absolute",
                          left: barX,
                          width: barWidth,
                          top:
                            chartBottom -
                            cumulativeHeight +
                            (fullSegHeight - 20) / 2,
                          textAlign: "center" as const,
                          fontSize: 15,
                          fontWeight: tokens.fontWeights.bold,
                          color: isDark(seg.color) ? "#ffffff" : tokens.colors.primary,
                          opacity: segValueOpacity,
                          fontFamily: tokens.fonts.body,
                          textShadow: isDark(seg.color)
                            ? "0 1px 3px rgba(0,0,0,0.3)"
                            : "none",
                        }}
                      >
                        {seg.value.toLocaleString()}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Total value above bar */}
              {showLabels && (
                <div
                  style={{
                    position: "absolute",
                    left: barX - 10,
                    width: barWidth + 20,
                    top:
                      chartBottom -
                      (totalValue / maxTotal) * chartHeight -
                      36,
                    textAlign: "center" as const,
                    fontSize: 22,
                    fontWeight: tokens.fontWeights.bold,
                    fontFamily: tokens.fonts.heading,
                    color: tokens.colors.primary,
                    opacity: interpolate(
                      frame,
                      [
                        10 + barIndex * 8 + bar.segments.length * 5 + 5,
                        10 + barIndex * 8 + bar.segments.length * 5 + 15,
                      ],
                      [0, 1],
                      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                    ),
                  }}
                >
                  {totalValue.toLocaleString()}
                </div>
              )}

              {/* X-axis label */}
              <div
                style={{
                  position: "absolute",
                  left: barX - 10,
                  width: barWidth + 20,
                  top: chartBottom + 16,
                  textAlign: "center" as const,
                  fontSize: 17,
                  fontWeight: tokens.fontWeights.medium,
                  color: tokens.colors.textMuted,
                  opacity: labelOpacity,
                  lineHeight: 1.3,
                }}
              >
                {bar.label}
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
  }

  // Horizontal orientation
  const totalBars = data.length;
  const barHeight = Math.min(70, Math.max(50, chartHeight / (totalBars * 1.5)));
  const barGap = barHeight * 0.3;
  const totalBarsHeight = totalBars * barHeight + (totalBars - 1) * barGap;
  const barsStartY = chartTop + (chartHeight - totalBarsHeight) / 2;
  const labelColumnWidth = 120;
  const barAreaLeft = chartLeft + labelColumnWidth;
  const barAreaWidth = chartRight - barAreaLeft;

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

      {/* Legend */}
      {legendItems.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: title ? tokens.layout.padding + 58 : tokens.layout.padding,
            left: tokens.layout.padding,
            display: "flex",
            gap: 28,
            opacity: interpolate(frame, [8, 22], [0, 1], {
              extrapolateRight: "clamp",
            }),
          }}
        >
          {legendItems.map((item) => (
            <div
              key={item.label}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  backgroundColor: item.color,
                  borderRadius: 2,
                }}
              />
              <span
                style={{
                  fontSize: 18,
                  color: tokens.colors.textMuted,
                  fontFamily: tokens.fonts.body,
                  fontWeight: tokens.fontWeights.medium,
                }}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Horizontal bars */}
      {data.map((bar, barIndex) => {
        const barY = barsStartY + barIndex * (barHeight + barGap);
        const totalValue = bar.segments.reduce((s, seg) => s + seg.value, 0);

        // Row label
        const labelDelay = 10 + barIndex * 8;
        const labelOpacity = interpolate(
          frame,
          [labelDelay, labelDelay + 10],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        let cumulativeWidth = 0;

        return (
          <div key={bar.label}>
            {/* Row label */}
            <div
              style={{
                position: "absolute",
                left: chartLeft,
                width: labelColumnWidth - 12,
                top: barY,
                height: barHeight,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                fontSize: 17,
                fontWeight: tokens.fontWeights.medium,
                color: tokens.colors.textMuted,
                opacity: labelOpacity,
              }}
            >
              {bar.label}
            </div>

            {bar.segments.map((seg, segIndex) => {
              const segDelay = 10 + barIndex * 8 + segIndex * 5;
              const segProgress = spring({
                frame: frame - segDelay,
                fps,
                config: { damping: 18, stiffness: 80 },
              });

              const fullSegWidth = (seg.value / maxTotal) * barAreaWidth;
              const segWidth = fullSegWidth * segProgress;
              const segX = barAreaLeft + cumulativeWidth;

              cumulativeWidth += fullSegWidth;

              return (
                <div
                  key={`${bar.label}-${segIndex}`}
                  style={{
                    position: "absolute",
                    left: segX,
                    top: barY,
                    width: segWidth,
                    height: barHeight,
                    backgroundColor: seg.color,
                  }}
                />
              );
            })}

            {/* Total value at end of bar */}
            {showLabels && (
              <div
                style={{
                  position: "absolute",
                  left:
                    barAreaLeft + (totalValue / maxTotal) * barAreaWidth + 12,
                  top: barY,
                  height: barHeight,
                  display: "flex",
                  alignItems: "center",
                  fontSize: 20,
                  fontWeight: tokens.fontWeights.bold,
                  fontFamily: tokens.fonts.heading,
                  color: tokens.colors.primary,
                  opacity: interpolate(
                    frame,
                    [
                      10 + barIndex * 8 + bar.segments.length * 5 + 5,
                      10 + barIndex * 8 + bar.segments.length * 5 + 15,
                    ],
                    [0, 1],
                    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                  ),
                }}
              >
                {totalValue.toLocaleString()}
              </div>
            )}
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
