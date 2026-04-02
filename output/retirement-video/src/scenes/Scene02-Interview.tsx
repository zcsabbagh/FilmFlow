import { useCurrentFrame, interpolate, spring, useVideoConfig, Video, staticFile, Easing } from "remotion";
import { tokens } from "../tokens";

/** Interview clip — composited on background, NOT full-screen */
export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Clip slides in from right
  const clipSlide = interpolate(frame, [0, 20], [80, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const clipOp = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  // Lower third slides up
  const lowerOp = interpolate(frame, [30, 45], [0, 1], { extrapolateRight: "clamp" });
  const lowerSlide = interpolate(frame, [30, 45], [15, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

  // Decorative quote mark on left
  const quoteOp = interpolate(frame, [10, 25], [0, 0.15], { extrapolateRight: "clamp" });

  return (
    <div style={{
      width: tokens.layout.width, height: tokens.layout.height,
      backgroundColor: tokens.colors.background,
      position: "relative", overflow: "hidden",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {/* Subtle diagonal texture */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.04,
        backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 35px, #8a8a8a 35px, #8a8a8a 36px)",
      }} />

      {/* Large decorative quote mark on left side */}
      <div style={{
        position: "absolute", left: 80, top: "30%",
        fontFamily: tokens.fonts.heading, fontSize: 400, fontWeight: 900,
        color: tokens.colors.accent, opacity: quoteOp, lineHeight: 0.8,
      }}>
        &ldquo;
      </div>

      {/* Video clip — rounded, composited, NOT full-screen */}
      <div style={{
        width: 1100, height: 620,
        borderRadius: 16, overflow: "hidden",
        boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
        opacity: clipOp,
        transform: `translateX(${clipSlide}px)`,
        marginLeft: 200, // offset right to make room for quote mark
      }}>
        <Video
          src={staticFile("clips/interview-clip.mp4")}
          startFrom={0}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      {/* Lower third — below the clip, not overlaid */}
      <div style={{
        position: "absolute", bottom: 100, left: 200, right: 200,
        opacity: lowerOp, transform: `translateY(${lowerSlide}px)`,
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 16,
        }}>
          <div style={{ width: 4, height: 50, backgroundColor: tokens.colors.accent, flexShrink: 0 }} />
          <div>
            <div style={{ fontFamily: tokens.fonts.body, fontSize: 22, color: tokens.colors.text, fontWeight: 600, fontStyle: "italic" }}>
              &quot;You need three or four jobs just to survive.&quot;
            </div>
            <div style={{ fontFamily: tokens.fonts.body, fontSize: 16, color: tokens.colors.textMuted, marginTop: 4 }}>
              San Francisco resident
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
