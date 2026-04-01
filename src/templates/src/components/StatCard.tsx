import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { tokens } from "../tokens";

type Props = {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  caption?: string;
  source?: string;
};

export const StatCard: React.FC<Props> = ({ value, label, prefix = "", suffix = "", caption, source }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame, fps, config: { damping: 30, stiffness: 80 } });
  const displayValue = Math.round(value * progress);

  return (
    <div
      style={{
        width: tokens.layout.width,
        height: tokens.layout.height,
        backgroundColor: tokens.colors.background,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: tokens.fonts.heading,
        color: tokens.colors.text,
      }}
    >
      {/* Big serif call-out number */}
      <div
        style={{
          fontSize: 100,
          fontWeight: tokens.fontWeights.black,
          fontFamily: tokens.fonts.heading,
          color: tokens.colors.primary,
        }}
      >
        {prefix}
        {displayValue.toLocaleString()}
        {suffix}
      </div>

      {/* Label in sans-serif below */}
      <div
        style={{
          fontSize: 36,
          fontFamily: tokens.fonts.body,
          fontWeight: tokens.fontWeights.medium,
          color: tokens.colors.textMuted,
          marginTop: 20,
          opacity: progress,
        }}
      >
        {label}
      </div>

      {(caption || source) && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            marginTop: 24,
            opacity: interpolate(frame, [20, 35], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          {caption && (
            <div
              style={{
                fontSize: 18,
                color: tokens.colors.textMuted,
                fontFamily: tokens.fonts.body,
              }}
            >
              {caption}
            </div>
          )}
          {source && (
            <div
              style={{
                fontSize: 14,
                color: tokens.colors.textLight,
                fontFamily: tokens.fonts.body,
              }}
            >
              Source: {source}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
