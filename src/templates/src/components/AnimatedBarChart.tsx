import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { tokens } from "../tokens";

export type BarChartData = { label: string; value: number };

type Props = {
  data: BarChartData[];
  title?: string;
  caption?: string;
  source?: string;
  yAxisLabel?: string;
  colorOverrides?: string[];
};

export const AnimatedBarChart: React.FC<Props> = ({ data, title, caption, source, colorOverrides }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const maxValue = Math.max(...data.map((d) => d.value));
  const colors = colorOverrides || tokens.colors.chart;
  const barWidth = Math.min(80, (tokens.layout.width - tokens.layout.padding * 2 - 100) / data.length - tokens.chart.barGap);

  return (
    <div
      style={{
        width: tokens.layout.width,
        height: tokens.layout.height,
        backgroundColor: tokens.colors.background,
        padding: tokens.layout.padding,
        display: "flex",
        flexDirection: "column",
        fontFamily: tokens.fonts.body,
        color: tokens.colors.text,
      }}
    >
      {title && (
        <div
          style={{
            fontSize: 46,
            fontWeight: tokens.fontWeights.bold,
            fontFamily: tokens.fonts.heading,
            marginBottom: 24,
            color: tokens.colors.primary,
            opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          {title}
        </div>
      )}

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          gap: tokens.chart.barGap,
          paddingBottom: 60,
          paddingTop: tokens.layout.chartPadding,
        }}
      >
        {data.map((item, i) => {
          const barProgress = spring({ frame: frame - i * 5, fps, config: { damping: 20, stiffness: 100 } });
          const barHeight = (item.value / maxValue) * 500 * barProgress;
          return (
            <div key={item.label} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: tokens.fontWeights.semibold,
                  fontFamily: tokens.fonts.mono,
                  marginBottom: 8,
                  opacity: barProgress,
                  color: tokens.colors.text,
                }}
              >
                {item.value.toLocaleString()}
              </div>
              <div
                style={{
                  width: barWidth,
                  height: barHeight,
                  backgroundColor: colors[i % colors.length],
                  borderRadius: tokens.chart.barRadius,
                }}
              />
              <div
                style={{
                  fontSize: 16,
                  fontWeight: tokens.fontWeights.medium,
                  marginTop: 12,
                  opacity: barProgress,
                  textAlign: "center",
                  maxWidth: barWidth + 20,
                  color: tokens.colors.textMuted,
                }}
              >
                {item.label}
              </div>
            </div>
          );
        })}
      </div>

      {(caption || source) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            opacity: interpolate(frame, [20, 35], [0, 1], { extrapolateRight: "clamp" }),
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
