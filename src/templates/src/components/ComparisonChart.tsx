import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { tokens } from "../tokens";

type Props = {
  leftLabel: string;
  rightLabel: string;
  leftValue: number;
  rightValue: number;
  title?: string;
  caption?: string;
  source?: string;
  unit?: string;
  /** Total dots in the dot-grid (default 100) */
  dotTotal?: number;
};

export const ComparisonChart: React.FC<Props> = ({
  leftLabel,
  rightLabel,
  leftValue,
  rightValue,
  title,
  caption,
  source,
  unit = "",
  dotTotal = 100,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const total = leftValue + rightValue;
  const leftDots = Math.round((leftValue / total) * dotTotal);
  const rightDots = dotTotal - leftDots;
  const leftProgress = spring({ frame: frame - 5, fps, config: { damping: 20, stiffness: 80 } });
  const rightProgress = spring({ frame: frame - 15, fps, config: { damping: 20, stiffness: 80 } });

  const cols = 10;
  const dotSize = 18;
  const dotGap = 6;

  return (
    <div
      style={{
        width: tokens.layout.width,
        height: tokens.layout.height,
        backgroundColor: tokens.colors.background,
        padding: tokens.layout.padding,
        fontFamily: tokens.fonts.body,
        color: tokens.colors.text,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 30,
      }}
    >
      {title && (
        <div
          style={{
            fontSize: 46,
            fontWeight: tokens.fontWeights.bold,
            fontFamily: tokens.fonts.heading,
            color: tokens.colors.primary,
            opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          {title}
        </div>
      )}

      {/* Dot grid for proportional representation */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          width: cols * (dotSize + dotGap),
          gap: dotGap,
          justifyContent: "center",
          marginTop: 20,
          marginBottom: 20,
        }}
      >
        {Array.from({ length: dotTotal }).map((_, i) => {
          const isLeft = i < leftDots;
          const dotProgress = isLeft ? leftProgress : rightProgress;
          const dotColor = isLeft ? tokens.colors.chart[0] : tokens.colors.chart[1];
          return (
            <div
              key={i}
              style={{
                width: dotSize,
                height: dotSize,
                borderRadius: dotSize / 2,
                backgroundColor: dotColor,
                opacity: dotProgress,
                transform: `scale(${dotProgress})`,
              }}
            />
          );
        })}
      </div>

      {/* Legend with big serif numbers */}
      <div style={{ display: "flex", gap: 80, marginTop: 10 }}>
        {[
          { label: leftLabel, value: leftValue, progress: leftProgress, color: tokens.colors.chart[0] },
          { label: rightLabel, value: rightValue, progress: rightProgress, color: tokens.colors.chart[1] },
        ].map((item) => (
          <div key={item.label} style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 80,
                fontWeight: tokens.fontWeights.black,
                fontFamily: tokens.fonts.heading,
                color: tokens.colors.primary,
                opacity: item.progress,
              }}
            >
              {Math.round(item.value * item.progress).toLocaleString()}
              {unit}
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: tokens.fontWeights.medium,
                color: tokens.colors.textMuted,
                fontFamily: tokens.fonts.body,
                marginTop: 4,
              }}
            >
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {(caption || source) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            opacity: interpolate(frame, [30, 45], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          {caption && (
            <div style={{ fontSize: 16, color: tokens.colors.textMuted, fontFamily: tokens.fonts.body }}>
              {caption}
            </div>
          )}
          {source && (
            <div style={{ fontSize: 14, color: tokens.colors.textLight, fontFamily: tokens.fonts.body }}>
              Source: {source}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
