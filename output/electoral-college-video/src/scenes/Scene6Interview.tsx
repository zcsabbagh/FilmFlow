import { useCurrentFrame, useVideoConfig, interpolate, spring, Video, staticFile, Easing } from "remotion";
import { tokens } from "../tokens";

/**
 * Scene 6: Interview Clip — composited YouTube clip
 * NOT full-screen — rounded rectangle on warm paper background
 * Uses CGP Grey "Trouble with Electoral College" clip
 */
export const Scene6Interview: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Video container animation
  const videoOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const videoScale = spring({ frame, fps, config: { damping: 18, stiffness: 80 } });

  // Lower third
  const lowerThirdOpacity = interpolate(frame, [20, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lowerThirdSlide = interpolate(frame, [20, 35], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

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
      {/* Warm paper texture */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `
          linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
      }} />

      {/* Decorative accent line top */}
      <div style={{
        position: "absolute", top: 60, left: "50%", transform: "translateX(-50%)",
        width: 120, height: 3, backgroundColor: tokens.colors.accent, borderRadius: 2,
        opacity: interpolate(frame, [5, 15], [0, 1], { extrapolateRight: "clamp" }),
      }} />

      {/* Video container — rounded, off-center left, with shadow */}
      <div
        style={{
          position: "absolute",
          left: 200,
          top: 140,
          width: 960,
          height: 540,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 8px 40px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)",
          opacity: videoOpacity,
          transform: `scale(${0.9 + 0.1 * Math.min(videoScale, 1)})`,
          transformOrigin: "center center",
        }}
      >
        <Video
          src={staticFile("clips/cgp-trouble.mp4")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      {/* Decorative frame border */}
      <div style={{
        position: "absolute",
        left: 194,
        top: 134,
        width: 972,
        height: 552,
        border: `2px solid ${tokens.colors.accent}`,
        borderRadius: 20,
        opacity: videoOpacity * 0.4,
        pointerEvents: "none" as const,
      }} />

      {/* Lower third — right side */}
      <div
        style={{
          position: "absolute",
          right: 120,
          top: 360,
          width: 480,
          opacity: lowerThirdOpacity,
          transform: `translateY(${lowerThirdSlide}px)`,
        }}
      >
        {/* Quote */}
        <div style={{
          fontFamily: tokens.fonts.heading, fontSize: 26, fontWeight: tokens.fontWeights.bold,
          color: tokens.colors.text, lineHeight: 1.4, fontStyle: "italic",
        }}>
          "The trouble with the Electoral College..."
        </div>

        {/* Attribution */}
        <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 3, backgroundColor: tokens.colors.accent, borderRadius: 2 }} />
          <div style={{ fontFamily: tokens.fonts.body, fontSize: 18, color: tokens.colors.textMuted }}>
            CGP Grey
          </div>
        </div>

        {/* Context */}
        <div style={{
          fontFamily: tokens.fonts.body, fontSize: 16, color: tokens.colors.textLight, marginTop: 8,
        }}>
          Educational explainer, YouTube
        </div>
      </div>

      {/* Source */}
      <div style={{
        position: "absolute", bottom: 30, left: tokens.layout.padding,
        fontFamily: tokens.fonts.body, fontSize: 14, color: tokens.colors.textLight,
        opacity: interpolate(frame, [30, 45], [0, 1], { extrapolateRight: "clamp" }),
      }}>
        Source: CGP Grey, "The Trouble with the Electoral College"
      </div>
    </div>
  );
};
