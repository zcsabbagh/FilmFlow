import { useCurrentFrame, interpolate, Video, staticFile, Easing } from "remotion";
import { tokens } from "../tokens";

/** 10s interview clip with lower third */
export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const clipOp = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const lowerOp = interpolate(frame, [20, 35], [0, 1], { extrapolateRight: "clamp" });
  const lowerSlide = interpolate(frame, [20, 35], [20, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

  return (
    <div style={{ width: tokens.layout.width, height: tokens.layout.height, backgroundColor: "#000", position: "relative" }}>
      <Video
        src={staticFile("clips/interview-clip.mp4")}
        startFrom={0}
        style={{ width: "100%", height: "100%", objectFit: "cover", opacity: clipOp }}
      />
      <div style={{
        position: "absolute", bottom: 50, left: 50, right: 50,
        backgroundColor: "rgba(0,0,0,0.8)", padding: "14px 24px",
        opacity: lowerOp, transform: `translateY(${lowerSlide}px)`,
        borderLeft: `4px solid ${tokens.colors.accent}`,
      }}>
        <div style={{ fontFamily: tokens.fonts.body, fontSize: 20, color: "#fff", fontWeight: 600, fontStyle: "italic" }}>
          &quot;You need three or four jobs just to survive.&quot;
        </div>
      </div>
    </div>
  );
};
