import { useCurrentFrame, interpolate } from "remotion";
import { tokens } from "../tokens";

type Props = {
  title?: string;
  caption?: string;
  source?: string;
  data: Array<{ region: string; value: number }>;
};

export const ChoroplethMap: React.FC<Props> = ({ title, caption, source, data }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

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
        opacity,
      }}
    >
      {title && (
        <div
          style={{
            fontSize: 46,
            fontWeight: tokens.fontWeights.bold,
            fontFamily: tokens.fonts.heading,
            color: tokens.colors.primary,
            marginBottom: 40,
          }}
        >
          {title}
        </div>
      )}

      <div
        style={{
          fontSize: 24,
          color: tokens.colors.textMuted,
          fontFamily: tokens.fonts.body,
        }}
      >
        [Map: {data.length} regions]
      </div>

      {(caption || source) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            marginTop: 40,
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
