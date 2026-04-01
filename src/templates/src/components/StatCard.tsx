import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { tokens } from "../tokens";

type Props = { value: number; label: string; prefix?: string; suffix?: string; caption?: string };

export const StatCard: React.FC<Props> = ({ value, label, prefix = "", suffix = "", caption }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame, fps, config: { damping: 30, stiffness: 80 } });
  const displayValue = Math.round(value * progress);

  return (
    <div style={{ width: tokens.layout.width, height: tokens.layout.height, backgroundColor: tokens.colors.background, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: tokens.fonts.heading, color: tokens.colors.text }}>
      <div style={{ fontSize: 120, fontWeight: 800, color: tokens.colors.accent }}>{prefix}{displayValue.toLocaleString()}{suffix}</div>
      <div style={{ fontSize: 36, marginTop: 20, opacity: progress }}>{label}</div>
      {caption && <div style={{ fontSize: 18, color: tokens.colors.textMuted, marginTop: 16, opacity: interpolate(frame, [20, 35], [0, 1], { extrapolateRight: "clamp" }) }}>{caption}</div>}
    </div>
  );
};
