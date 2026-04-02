import { useCurrentFrame, interpolate, OffthreadVideo, staticFile } from "remotion";
import { tokens } from "../tokens";

// Interview clip in rounded rectangle on dark background — NEVER full-screen
export const Scene: React.FC = () => {
  const frame = useCurrentFrame();

  const clipOp = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const clipScale = interpolate(frame, [0, 20], [0.92, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const lowerOp = interpolate(frame, [25, 40], [0, 1], { extrapolateRight: "clamp" });
  const quoteOp = interpolate(frame, [50, 65], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div style={{
      width: tokens.layout.width, height: tokens.layout.height,
      backgroundColor: "#0a0a0a", position: "relative",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {/* Subtle background texture */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 30% 50%, rgba(232,168,124,0.06) 0%, transparent 60%)",
      }} />

      {/* Interview clip in rounded rectangle — NOT full screen */}
      <div style={{
        width: 960, height: 540,
        borderRadius: 20,
        overflow: "hidden",
        opacity: clipOp,
        transform: `scale(${clipScale})`,
        boxShadow: "0 12px 48px rgba(0,0,0,0.7), 0 0 0 2px rgba(255,255,255,0.08)",
        position: "relative",
      }}>
        <OffthreadVideo
          src={staticFile("clips/clip-kurzgesagt.mp4")}
          startFrom={0}
          volume={0.4}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      {/* Lower third caption */}
      <div style={{
        position: "absolute", bottom: 140, left: 200, right: 200,
        opacity: lowerOp,
      }}>
        <div style={{
          backgroundColor: "rgba(0,0,0,0.85)",
          padding: "16px 28px",
          borderLeft: `4px solid ${tokens.colors.accent}`,
          borderRadius: "0 8px 8px 0",
        }}>
          <div style={{
            fontFamily: tokens.fonts.body, fontSize: 14,
            color: tokens.colors.accent, fontWeight: 600,
            textTransform: "uppercase", letterSpacing: 2,
            marginBottom: 4,
          }}>
            Global Carbon Project
          </div>
          <div style={{
            fontFamily: tokens.fonts.body, fontSize: 20,
            color: "#fff", fontWeight: 400,
          }}>
            Over 1.5 trillion tons of CO₂ released into our atmosphere
          </div>
        </div>
      </div>

      {/* Pull quote */}
      {frame >= 50 && (
        <div style={{
          position: "absolute", top: 80, right: 120,
          opacity: quoteOp,
          fontFamily: tokens.fonts.heading, fontSize: 28,
          fontWeight: 700, fontStyle: "italic",
          color: "rgba(255,255,255,0.7)",
          maxWidth: 300, textAlign: "right",
          lineHeight: 1.4,
        }}>
          "The crisis is already here — we just don't want to see it."
        </div>
      )}
    </div>
  );
};
