import { useCurrentFrame, interpolate } from "remotion";
import { tokens } from "../tokens";

type Props = { title?: string; caption?: string; data: Array<{ region: string; value: number }> };

export const ChoroplethMap: React.FC<Props> = ({ title, caption, data }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div style={{ width: tokens.layout.width, height: tokens.layout.height, backgroundColor: tokens.colors.background, padding: tokens.layout.padding, fontFamily: tokens.fonts.body, color: tokens.colors.text, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity }}>
      {title && <div style={{ fontSize: 42, fontWeight: 700, marginBottom: 40 }}>{title}</div>}
      <div style={{ fontSize: 24, color: tokens.colors.textMuted }}>[Map: {data.length} regions]</div>
      {caption && <div style={{ fontSize: 16, color: tokens.colors.textMuted, marginTop: 20 }}>{caption}</div>}
    </div>
  );
};
