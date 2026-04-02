import { useCurrentFrame, interpolate, spring, useVideoConfig, Audio, Img, staticFile, Easing } from "remotion";
import { tokens } from "../tokens";

/** 5-second intro — image collage with text overlay */
export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Quick image flash montage — each image shows for ~20 frames
  const images = ["elderly-working.jpg", "empty-savings.jpg", "senior-working.jpg", "medical-bills.jpg"];
  const imgIndex = Math.min(Math.floor(frame / 20), images.length - 1);
  const imgFade = interpolate(frame % 20, [0, 5], [0, 1], { extrapolateRight: "clamp" });

  // Title text punches in
  const titleOp = interpolate(frame, [30, 45], [0, 1], { extrapolateRight: "clamp" });
  const titleScale = spring({ frame: frame - 30, fps, config: { damping: 12, stiffness: 100 } });

  // Subtitle
  const subOp = interpolate(frame, [60, 75], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div style={{ width: tokens.layout.width, height: tokens.layout.height, backgroundColor: "#111", position: "relative", overflow: "hidden" }}>
      <Audio src={staticFile("audio/intro.mp3")} />

      {/* Flashing image montage */}
      <Img
        src={staticFile("images/" + images[imgIndex])}
        style={{
          position: "absolute", width: "100%", height: "100%", objectFit: "cover",
          opacity: imgFade * 0.4, filter: "grayscale(60%) contrast(1.2)",
        }}
      />

      {/* Dark overlay */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.5)" }} />

      {/* Title text */}
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          fontFamily: tokens.fonts.heading, fontSize: 72, fontWeight: 900,
          color: "#fff", textAlign: "center", opacity: titleOp,
          transform: `scale(${Math.min(titleScale, 1)})`,
        }}>
          Half of Americans
        </div>
        <div style={{
          fontFamily: tokens.fonts.heading, fontSize: 72, fontWeight: 900,
          color: tokens.colors.accent, textAlign: "center", marginTop: 8,
          opacity: subOp,
        }}>
          can&apos;t retire.
        </div>
      </div>
    </div>
  );
};
