import { useCurrentFrame, interpolate, useVideoConfig, Video, staticFile, Easing } from "remotion";
import { tokens } from "../tokens";

/**
 * Scene 06 — Interview clip 3: CNBC 401k / pensions discussion
 * Clip in rounded rectangle — NOT full-screen
 * Duration: 135 frames (4.5s)
 */
export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Clip scales up from center
  const clipScale = interpolate(frame, [0, 18], [0.85, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const clipOp = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });

  // Lower third
  const lowerOp = interpolate(frame, [25, 40], [0, 1], { extrapolateRight: "clamp" });
  const lowerSlide = interpolate(frame, [25, 40], [20, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

  // Decorative elements
  const decoOp = interpolate(frame, [5, 18], [0, 0.15], { extrapolateRight: "clamp" });

  return (
    <div style={{
      width: tokens.layout.width, height: tokens.layout.height,
      backgroundColor: tokens.colors.background,
      position: "relative", overflow: "hidden",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {/* Subtle texture */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.03,
        backgroundImage: "repeating-linear-gradient(135deg, transparent, transparent 30px, #999 30px, #999 31px)",
      }} />

      {/* Decorative accent corner */}
      <div style={{
        position: "absolute", left: 60, top: 60,
        width: 80, height: 80, borderLeft: `4px solid ${tokens.colors.accent}`, borderTop: `4px solid ${tokens.colors.accent}`,
        opacity: decoOp,
      }} />
      <div style={{
        position: "absolute", right: 60, bottom: 60,
        width: 80, height: 80, borderRight: `4px solid ${tokens.colors.accent}`, borderBottom: `4px solid ${tokens.colors.accent}`,
        opacity: decoOp,
      }} />

      {/* Video clip */}
      <div style={{
        width: 1000, height: 560,
        borderRadius: 20, overflow: "hidden",
        boxShadow: "0 12px 48px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.1)",
        opacity: clipOp,
        transform: `scale(${clipScale})`,
        border: "3px solid rgba(0,0,0,0.06)",
      }}>
        <Video
          src={staticFile("clips/clip-401k-pension.mp4")}
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
              &ldquo;How 401(k) plans killed pensions&rdquo;
            </div>
            <div style={{ fontFamily: tokens.fonts.body, fontSize: 14, color: tokens.colors.textMuted, marginTop: 4 }}>
              CNBC
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
