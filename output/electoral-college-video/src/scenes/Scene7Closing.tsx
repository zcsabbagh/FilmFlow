import { useCurrentFrame, useVideoConfig, interpolate, spring, Img, staticFile, Easing } from "remotion";
import { tokens } from "../tokens";

/**
 * Scene 7: Closing — callback to the hook
 * "[serious] Designed for four million. [pause] Governing three hundred and thirty million. [pause] Is it time for a change?"
 *
 * Timing:
 * Designed@12, four@26, million@40
 * [pause]@87, Governing@101, three@115, hundred@133, thirty@159, million@173
 * [pause]@237, Is@253, it@254, time@258, change?@278
 */
export const Scene7Closing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Background image — American flag, low opacity
  const bgOpacity = interpolate(frame, [0, 20], [0, 0.12], { extrapolateRight: "clamp" });

  // Line 1: "Designed for 4 million."
  const line1Opacity = interpolate(frame, [12, 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const line1Slide = interpolate(frame, [12, 26], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

  // Line 2: "Governing 330 million."
  const line2Opacity = interpolate(frame, [101, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const line2Slide = interpolate(frame, [101, 120], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

  // Dim line 1 when line 2 appears
  const line1Dim = interpolate(frame, [95, 110], [1, 0.4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Line 3: "Is it time for a change?"
  const line3Opacity = interpolate(frame, [253, 268], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const line3Scale = spring({ frame: frame - 253, fps, config: { damping: 14, stiffness: 100 } });

  // Accent line under the question
  const accentLineWidth = interpolate(frame, [268, 295], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

  // Dim previous lines when question appears
  const prevDim = interpolate(frame, [248, 260], [1, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div
      style={{
        width: tokens.layout.width,
        height: tokens.layout.height,
        backgroundColor: tokens.colors.background,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background flag image */}
      <Img
        src={staticFile("images/american-flag.jpg")}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: bgOpacity,
          filter: "grayscale(0.6)",
        }}
      />

      {/* Line 1: "Designed for 4 million." */}
      <div style={{
        position: "absolute", top: "30%", width: "100%", textAlign: "center",
        opacity: line1Opacity * line1Dim * prevDim,
        transform: `translateY(${line1Slide}px)`,
      }}>
        <span style={{
          fontFamily: tokens.fonts.heading, fontSize: 52, fontWeight: tokens.fontWeights.bold,
          color: tokens.colors.text,
        }}>
          Designed for{" "}
          <span style={{ fontWeight: tokens.fontWeights.black, color: tokens.colors.accent, fontSize: 64 }}>
            4 million
          </span>
          .
        </span>
      </div>

      {/* Line 2: "Governing 330 million." */}
      <div style={{
        position: "absolute", top: "46%", width: "100%", textAlign: "center",
        opacity: line2Opacity * prevDim,
        transform: `translateY(${line2Slide}px)`,
      }}>
        <span style={{
          fontFamily: tokens.fonts.heading, fontSize: 52, fontWeight: tokens.fontWeights.bold,
          color: tokens.colors.text,
        }}>
          Governing{" "}
          <span style={{ fontWeight: tokens.fontWeights.black, color: tokens.colors.secondary, fontSize: 64 }}>
            330 million
          </span>
          .
        </span>
      </div>

      {/* Line 3: "Is it time for a change?" */}
      <div style={{
        position: "absolute", top: "64%", width: "100%", textAlign: "center",
        opacity: line3Opacity,
        transform: `scale(${0.9 + 0.1 * Math.min(line3Scale, 1)})`,
      }}>
        <span style={{
          fontFamily: tokens.fonts.heading, fontSize: 62, fontWeight: tokens.fontWeights.black,
          color: tokens.colors.text,
        }}>
          Is it time for a change?
        </span>
        {/* Accent line */}
        <div style={{
          width: `${accentLineWidth}%`,
          maxWidth: 500,
          height: 4,
          backgroundColor: tokens.colors.accent,
          margin: "16px auto 0",
          borderRadius: 2,
        }} />
      </div>
    </div>
  );
};
