import { useCurrentFrame, interpolate, Img, staticFile } from "remotion";
import { tokens } from "../tokens";

/** Scene 06 — Fight for 15 protest photo with Ken Burns pan + text overlay */
export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  // Ken Burns: slow zoom + slight pan right
  const scale = interpolate(frame, [0, 300], [1.05, 1.15], { extrapolateRight: "clamp" });
  const panX = interpolate(frame, [0, 300], [0, -30], { extrapolateRight: "clamp" });

  const overlayOp = interpolate(frame, [40, 60], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div style={{ width: tokens.layout.width, height: tokens.layout.height, backgroundColor: "#111", position: "relative", overflow: "hidden" }}>
      {/* Photo with Ken Burns */}
      <Img
        src={staticFile("images/fight-for-15.jpg")}
        style={{
          position: "absolute", width: "110%", height: "110%", top: "-5%", left: "-5%",
          objectFit: "cover", opacity: fadeIn,
          transform: `scale(${scale}) translateX(${panX}px)`,
        }}
      />

      {/* Dark gradient overlay at bottom */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 300,
        background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
      }} />

      {/* Text overlay */}
      <div style={{
        position: "absolute", bottom: 80, left: 80, right: 80, opacity: overlayOp,
      }}>
        <div style={{ fontFamily: tokens.fonts.heading, fontSize: 42, fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>
          The Fight for $15
        </div>
        <div style={{ fontFamily: tokens.fonts.body, fontSize: 20, color: "#ccc", marginTop: 8 }}>
          Workers across America demanding a living wage
        </div>
        <div style={{ fontFamily: tokens.fonts.body, fontSize: 14, color: "#888", marginTop: 8 }}>
          Photo: Wikimedia Commons
        </div>
      </div>
    </div>
  );
};
