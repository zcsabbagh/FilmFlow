import { useCurrentFrame, interpolate, spring, useVideoConfig, Audio, Img, staticFile } from "remotion";
import { tokens } from "../tokens";

/**
 * Scene 01 — Punchy intro with collage-style images
 * "Half of Americans have zero retirement savings."
 * Duration: 93 frames (3.1s) — narration is 2.1s + buffer
 */

// Word-level timing (1.35x speed)
const W = {
  half: 0.0,
  of: 0.248,
  americans: 0.33,
  have: 0.72,
  zero: 0.83,
  retirement: 1.12,
  savings: 1.49,
  end: 2.10,
};

export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps; // current time in seconds

  // Collage images — overlapping, tilted, with drop shadows
  const images = [
    { src: "empty-wallet.jpg", x: -40, y: -30, rot: -3, w: 700, h: 460 },
    { src: "piggy-bank.jpg", x: 480, y: 20, rot: 4, w: 650, h: 430 },
    { src: "senior-retail.jpg", x: 200, y: 350, rot: -2, w: 680, h: 450 },
    { src: "savings-jar.jpg", x: 900, y: 280, rot: 3, w: 600, h: 400 },
  ];

  // Rapid stagger — each image appears 4 frames apart
  const imgElements = images.map((img, i) => {
    const startFrame = i * 4;
    const op = interpolate(frame, [startFrame, startFrame + 6], [0, 0.3], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
    const scale = spring({ frame: frame - startFrame, fps, config: { damping: 15, stiffness: 150 } });

    return (
      <Img
        key={i}
        src={staticFile(`images/${img.src}`)}
        style={{
          position: "absolute",
          left: img.x,
          top: img.y,
          width: img.w,
          height: img.h,
          objectFit: "cover",
          borderRadius: 12,
          transform: `rotate(${img.rot}deg) scale(${Math.min(scale, 1)})`,
          opacity: op,
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          filter: "grayscale(70%) contrast(1.2) brightness(0.85)",
          border: "3px solid rgba(255,255,255,0.1)",
        }}
      />
    );
  });

  // Text appears synced to narration
  const textHalf = t >= W.half;
  const textZero = t >= W.zero;

  const halfScale = spring({ frame: frame - Math.round(W.half * fps), fps, config: { damping: 8, stiffness: 200 } });
  const zeroScale = spring({ frame: frame - Math.round(W.zero * fps), fps, config: { damping: 8, stiffness: 200 } });

  // Flash on text appear
  const flash = frame >= 8 && frame < 14 ? interpolate(frame, [8, 14], [0.25, 0], { extrapolateRight: "clamp" }) : 0;

  return (
    <div style={{ width: tokens.layout.width, height: tokens.layout.height, backgroundColor: "#0a0a0a", position: "relative", overflow: "hidden" }}>
      <Audio src={staticFile("audio/intro.mp3")} />

      {/* Collage images */}
      {imgElements}

      {/* Dark overlay to make text readable */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: `rgba(0,0,0,${0.55 - flash * 0.3})` }} />

      {/* White flash effect */}
      {flash > 0 && (
        <div style={{ position: "absolute", inset: 0, backgroundColor: `rgba(255,255,255,${flash})` }} />
      )}

      {/* Main text — synced to word timing */}
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        {textHalf && (
          <div style={{
            fontFamily: tokens.fonts.heading, fontSize: 80, fontWeight: 900,
            color: "#fff", textAlign: "center",
            transform: `scale(${Math.min(halfScale, 1.05)})`,
            textShadow: "0 4px 20px rgba(0,0,0,0.5)",
          }}>
            Half of Americans
          </div>
        )}
        {textZero && (
          <div style={{
            fontFamily: tokens.fonts.heading, fontSize: 80, fontWeight: 900,
            color: tokens.colors.accent, textAlign: "center", marginTop: 4,
            transform: `scale(${Math.min(zeroScale, 1.05)})`,
          }}>
            zero retirement savings.
          </div>
        )}
      </div>
    </div>
  );
};
