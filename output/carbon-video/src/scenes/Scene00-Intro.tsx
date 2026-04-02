import { useCurrentFrame, interpolate, spring, useVideoConfig, Audio, Img, staticFile } from "remotion";
import { tokens } from "../tokens";

// Collage-style intro with overlapping images at angles
const COLLAGE_IMAGES = [
  { src: "smokestacks.jpg", x: 100, y: 80, w: 700, h: 420, rotate: -3, delay: 0 },
  { src: "coal-plant.jpg", x: 500, y: 200, w: 650, h: 390, rotate: 2.5, delay: 8 },
  { src: "dried-earth.jpg", x: 900, y: 50, w: 750, h: 450, rotate: -2, delay: 16 },
];

export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOp = interpolate(frame, [40, 55], [0, 1], { extrapolateRight: "clamp" });
  const titleScale = spring({ frame: frame - 40, fps, config: { damping: 12, stiffness: 100 } });
  const subOp = interpolate(frame, [80, 95], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div style={{ width: tokens.layout.width, height: tokens.layout.height, backgroundColor: "#111", position: "relative", overflow: "hidden" }}>
      <Audio src={staticFile("audio/intro.mp3")} />

      {/* Collage images — overlapping, tilted, with drop shadows */}
      {COLLAGE_IMAGES.map((img, i) => {
        const progress = spring({ frame: frame - img.delay, fps, config: { damping: 18, stiffness: 60 } });
        const p = Math.min(progress, 1);
        const slideX = (1 - p) * 40;
        const slideY = (1 - p) * 25;
        return (
          <div
            key={img.src}
            style={{
              position: "absolute",
              left: img.x,
              top: img.y,
              width: img.w,
              height: img.h,
              transform: `rotate(${img.rotate}deg) translate(${slideX}px, ${slideY}px) scale(${0.9 + 0.1 * p})`,
              opacity: p,
              boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
              borderRadius: 6,
              overflow: "hidden",
              zIndex: i + 1,
            }}
          >
            <Img
              src={staticFile("images/" + img.src)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: "grayscale(40%) contrast(1.15)",
              }}
            />
          </div>
        );
      })}

      {/* Dark overlay for text readability */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.45)", zIndex: 10 }} />

      {/* Title text */}
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 11 }}>
        <div style={{
          fontFamily: tokens.fonts.heading, fontSize: 80, fontWeight: 900, color: "#fff",
          textAlign: "center", opacity: titleOp,
          transform: `scale(${Math.min(titleScale, 1)})`,
          textShadow: "0 4px 20px rgba(0,0,0,0.5)",
        }}>
          The World's Carbon Problem
        </div>
        <div style={{
          fontFamily: tokens.fonts.body, fontSize: 32, color: tokens.colors.accent,
          marginTop: 16, opacity: subOp,
          textShadow: "0 2px 10px rgba(0,0,0,0.5)",
        }}>
          37 billion tonnes. Every year. Still rising.
        </div>
      </div>
    </div>
  );
};
