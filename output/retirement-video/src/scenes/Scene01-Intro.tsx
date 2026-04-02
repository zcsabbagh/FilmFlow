import { useCurrentFrame, interpolate, spring, useVideoConfig, Audio, Img, staticFile } from "remotion";
import { tokens } from "../tokens";

/** 4-second PUNCHY intro — rapid image cuts + text slam */
export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // RAPID image montage — each image for only 12 frames (0.4s)
  const images = ["elderly-working.jpg", "empty-savings.jpg", "senior-working.jpg", "medical-bills.jpg"];
  const imgIndex = Math.min(Math.floor(frame / 12), images.length - 1);

  // Hard cut between images — no fade, just snap
  const imgOp = frame < 48 ? 1 : interpolate(frame, [48, 55], [1, 0.3], { extrapolateRight: "clamp" });

  // Text SLAMS in at frame 15 — no gentle fade, immediate scale punch
  const textVisible = frame >= 15;
  const textScale = spring({ frame: frame - 15, fps, config: { damping: 8, stiffness: 200 } });

  // "can't retire" punches in 10 frames later
  const subVisible = frame >= 35;
  const subScale = spring({ frame: frame - 35, fps, config: { damping: 8, stiffness: 200 } });

  // Flash effect on text appear
  const flash = frame >= 15 && frame < 20 ? interpolate(frame, [15, 20], [0.3, 0], { extrapolateRight: "clamp" }) : 0;

  return (
    <div style={{ width: tokens.layout.width, height: tokens.layout.height, backgroundColor: "#0a0a0a", position: "relative", overflow: "hidden" }}>
      <Audio src={staticFile("audio/intro.mp3")} />

      {/* Rapid image flash — grayscale, high contrast */}
      <Img
        src={staticFile("images/" + images[imgIndex])}
        style={{
          position: "absolute", width: "110%", height: "110%", top: "-5%", left: "-5%",
          objectFit: "cover", opacity: imgOp * 0.35,
          filter: "grayscale(100%) contrast(1.4) brightness(0.8)",
        }}
      />

      {/* Dark overlay */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: `rgba(0,0,0,${0.5 - flash * 0.3})` }} />

      {/* White flash on text appear */}
      {flash > 0 && (
        <div style={{ position: "absolute", inset: 0, backgroundColor: `rgba(255,255,255,${flash})` }} />
      )}

      {/* Text — SLAMS in, doesn't fade */}
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        {textVisible && (
          <div style={{
            fontFamily: tokens.fonts.heading, fontSize: 80, fontWeight: 900,
            color: "#fff", textAlign: "center",
            transform: `scale(${Math.min(textScale, 1.05)})`,
            textShadow: "0 4px 20px rgba(0,0,0,0.5)",
          }}>
            Half of Americans
          </div>
        )}
        {subVisible && (
          <div style={{
            fontFamily: tokens.fonts.heading, fontSize: 80, fontWeight: 900,
            color: tokens.colors.accent, textAlign: "center", marginTop: 4,
            transform: `scale(${Math.min(subScale, 1.05)})`,
          }}>
            can&apos;t retire.
          </div>
        )}
      </div>
    </div>
  );
};
