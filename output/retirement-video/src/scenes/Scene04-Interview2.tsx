import { useCurrentFrame, interpolate, useVideoConfig, Video, staticFile, Easing } from "remotion";
import { tokens } from "../tokens";

/**
 * Scene 04 — Interview clip 2: 60 Minutes 401k discussion
 * "saving for our retirement..."
 * Clip in rounded rectangle on warm paper background — NOT full-screen
 * Duration: 165 frames (5.5s)
 */
export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Clip slides in from left this time (variety)
  const clipSlide = interpolate(frame, [0, 22], [-120, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const clipOp = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  // Lower third
  const lowerOp = interpolate(frame, [30, 45], [0, 1], { extrapolateRight: "clamp" });
  const lowerSlide = interpolate(frame, [30, 45], [20, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

  // Decorative accent bar on right
  const barOp = interpolate(frame, [8, 20], [0, 0.2], { extrapolateRight: "clamp" });

  return (
    <div style={{
      width: tokens.layout.width, height: tokens.layout.height,
      backgroundColor: tokens.colors.background,
      position: "relative", overflow: "hidden",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {/* Subtle crosshatch texture */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.03,
        backgroundImage: "repeating-linear-gradient(-45deg, transparent, transparent 40px, #666 40px, #666 41px)",
      }} />

      {/* Decorative vertical accent bar */}
      <div style={{
        position: "absolute", right: 120, top: "15%", bottom: "15%",
        width: 6, backgroundColor: tokens.colors.accent, opacity: barOp,
        borderRadius: 3,
      }} />

      {/* Video clip in rounded rectangle */}
      <div style={{
        width: 1000, height: 560,
        borderRadius: 20, overflow: "hidden",
        boxShadow: "0 12px 48px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.1)",
        opacity: clipOp,
        transform: `translateX(${clipSlide}px)`,
        marginRight: 100,
        border: "3px solid rgba(0,0,0,0.06)",
      }}>
        <Video
          src={staticFile("clips/clip-60min-saving.mp4")}
          startFrom={0}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      {/* Lower third */}
      <div style={{
        position: "absolute", bottom: 90, left: 180, right: 180,
        opacity: lowerOp, transform: `translateY(${lowerSlide}px)`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 4, height: 50, backgroundColor: tokens.colors.accent, flexShrink: 0 }} />
          <div>
            <div style={{ fontFamily: tokens.fonts.body, fontSize: 20, color: tokens.colors.text, fontWeight: 600, fontStyle: "italic" }}>
              &ldquo;Saving for our retirement...&rdquo;
            </div>
            <div style={{ fontFamily: tokens.fonts.body, fontSize: 14, color: tokens.colors.textMuted, marginTop: 4 }}>
              60 Minutes
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
