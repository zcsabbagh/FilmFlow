import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { tokens } from "../tokens";

type Props = { leftLabel: string; rightLabel: string; leftValue: number; rightValue: number; title?: string; caption?: string; unit?: string };

export const ComparisonChart: React.FC<Props> = ({ leftLabel, rightLabel, leftValue, rightValue, title, caption, unit = "" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const maxVal = Math.max(leftValue, rightValue);
  const leftProgress = spring({ frame: frame - 5, fps, config: { damping: 20, stiffness: 80 } });
  const rightProgress = spring({ frame: frame - 15, fps, config: { damping: 20, stiffness: 80 } });
  const barMaxWidth = 600;

  return (
    <div style={{ width: tokens.layout.width, height: tokens.layout.height, backgroundColor: tokens.colors.background, padding: tokens.layout.padding, fontFamily: tokens.fonts.body, color: tokens.colors.text, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 40 }}>
      {title && <div style={{ fontSize: 42, fontWeight: 700, opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" }) }}>{title}</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 30, width: barMaxWidth + 200 }}>
        {[
          { label: leftLabel, value: leftValue, progress: leftProgress, color: tokens.colors.chart[0] },
          { label: rightLabel, value: rightValue, progress: rightProgress, color: tokens.colors.chart[1] },
        ].map((item) => (
          <div key={item.label}>
            <div style={{ fontSize: 20, marginBottom: 8 }}>{item.label}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: (item.value / maxVal) * barMaxWidth * item.progress, height: 40, backgroundColor: item.color, borderRadius: 4 }} />
              <div style={{ fontSize: 22, fontWeight: 600, opacity: item.progress }}>{Math.round(item.value * item.progress).toLocaleString()}{unit}</div>
            </div>
          </div>
        ))}
      </div>
      {caption && <div style={{ fontSize: 16, color: tokens.colors.textMuted, opacity: interpolate(frame, [30, 45], [0, 1], { extrapolateRight: "clamp" }) }}>{caption}</div>}
    </div>
  );
};
