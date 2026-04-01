import { useCurrentFrame, interpolate, Video, staticFile, Easing } from "remotion";
import { tokens } from "../tokens";

/** Scene 08 — Closing interview clip with branded lower third */
export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const clipOp = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const lowerOp = interpolate(frame, [30, 50], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [400, 450], [1, 0], { extrapolateRight: "clamp" });

  return (
    <div style={{ width: tokens.layout.width, height: tokens.layout.height, backgroundColor: "#000", position: "relative" }}>
      <div style={{ opacity: clipOp * fadeOut }}>
        <Video
          src={staticFile("clips/interview-clip.mp4")}
          startFrom={0}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      {/* Lower third */}
      <div style={{
        position: "absolute", bottom: 60, left: 60, right: 60,
        backgroundColor: "rgba(0,0,0,0.75)", padding: "16px 28px",
        opacity: lowerOp * fadeOut,
        borderLeft: `4px solid ${tokens.colors.accent}`,
      }}>
        <div style={{ fontFamily: tokens.fonts.body, fontSize: 20, color: "#fff", fontWeight: 600 }}>
          &quot;I&apos;m born and raised here and I can&apos;t even afford to live here.&quot;
        </div>
      </div>

      {/* End card fades in as clip fades out */}
      {frame >= 400 && (
        <div style={{
          position: "absolute", inset: 0, backgroundColor: tokens.colors.background,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          opacity: interpolate(frame, [400, 430], [0, 1], { extrapolateRight: "clamp" }),
        }}>
          <div style={{ fontFamily: tokens.fonts.heading, fontSize: 48, fontWeight: 700, color: tokens.colors.text, textAlign: "center" }}>
            $7.25
          </div>
          <div style={{ fontFamily: tokens.fonts.body, fontSize: 24, color: tokens.colors.textMuted, marginTop: 12 }}>
            Sixteen years. Still frozen.
          </div>
        </div>
      )}
    </div>
  );
};
