import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { tokens } from "../tokens";

export type BarChartData = { label: string; value: number };

type Props = {
  data: BarChartData[];
  title?: string;
  caption?: string;
  yAxisLabel?: string;
  colorOverrides?: string[];
};

export const AnimatedBarChart: React.FC<Props> = ({ data, title, caption, colorOverrides }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const maxValue = Math.max(...data.map((d) => d.value));
  const colors = colorOverrides || tokens.colors.chart;
  const barWidth = Math.min(80, (tokens.layout.width - tokens.layout.padding * 2 - 100) / data.length - 10);

  return (
    <div style={{ width: tokens.layout.width, height: tokens.layout.height, backgroundColor: tokens.colors.background, padding: tokens.layout.padding, display: "flex", flexDirection: "column", fontFamily: tokens.fonts.body, color: tokens.colors.text }}>
      {title && (
        <div style={{ fontSize: 42, fontWeight: 700, marginBottom: 20, opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" }) }}>{title}</div>
      )}
      <div style={{ flex: 1, display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 10, paddingBottom: 60 }}>
        {data.map((item, i) => {
          const barProgress = spring({ frame: frame - i * 5, fps, config: { damping: 20, stiffness: 100 } });
          const barHeight = (item.value / maxValue) * 500 * barProgress;
          return (
            <div key={item.label} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ fontSize: 18, marginBottom: 8, opacity: barProgress, color: tokens.colors.textMuted }}>{item.value.toLocaleString()}</div>
              <div style={{ width: barWidth, height: barHeight, backgroundColor: colors[i % colors.length], borderRadius: 4 }} />
              <div style={{ fontSize: 16, marginTop: 12, opacity: barProgress, textAlign: "center", maxWidth: barWidth + 20 }}>{item.label}</div>
            </div>
          );
        })}
      </div>
      {caption && (
        <div style={{ fontSize: 16, color: tokens.colors.textMuted, opacity: interpolate(frame, [20, 35], [0, 1], { extrapolateRight: "clamp" }) }}>{caption}</div>
      )}
    </div>
  );
};
