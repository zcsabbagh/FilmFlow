import { useCurrentFrame, interpolate, Video, staticFile, Easing } from "remotion";
import { tokens } from "../tokens";

/** Scene 02 — YouTube interview clip (no narration, just the clip with lower third) */
export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const clipFadeIn = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const lowerThirdOp = interpolate(frame, [30, 50], [0, 1], { extrapolateRight: "clamp" });
  const lowerThirdSlide = interpolate(frame, [30, 50], [20, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

  return (
    <div style={{ width: tokens.layout.width, height: tokens.layout.height, backgroundColor: "#000", position: "relative" }}>
      <Video
        src={staticFile("clips/interview-clip.mp4")}
        startFrom={0}
        style={{ width: "100%", height: "100%", objectFit: "cover", opacity: clipFadeIn }}
      />
      {/* Lower third */}
      <div style={{
        position: "absolute", bottom: 60, left: 60, right: 60,
        backgroundColor: "rgba(0,0,0,0.75)", padding: "16px 28px",
        opacity: lowerThirdOp, transform: `translateY(${lowerThirdSlide}px)`,
        borderLeft: `4px solid ${tokens.colors.accent}`,
      }}>
        <div style={{ fontFamily: tokens.fonts.body, fontSize: 20, color: "#fff", fontWeight: 600 }}>
          &quot;You need three or four jobs to survive in this city.&quot;
        </div>
        <div style={{ fontFamily: tokens.fonts.body, fontSize: 14, color: "#aaa", marginTop: 4 }}>
          San Francisco resident
        </div>
      </div>
    </div>
  );
};
