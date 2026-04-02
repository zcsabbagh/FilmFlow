import { useCurrentFrame, useVideoConfig, interpolate, Img, staticFile, Easing } from "remotion";
import { tokens } from "../tokens";

/**
 * Scene 1: Punchy Hook — rapid image montage with text overlay
 * "The system that picks your president [pause] wasn't designed for you."
 *
 * Timing from scene1-hook.timing.json:
 * system@7, picks@25, president@39, [pause]@93, wasn't@100, designed@114, you.@129
 */
export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Image montage: 3 images, each shown for ~15 frames, with overlap
  const images = [
    staticFile("images/voting-booth.jpg"),
    staticFile("images/capitol.jpg"),
    staticFile("images/election-night.jpg"),
  ];

  // Dark overlay for text readability
  const overlayOpacity = 0.65;

  // Text animations synced to voiceover
  const line1Start = 0;  // "The system that picks your president"
  const line1End = 60;
  const line2Start = 100; // "wasn't designed for you"
  const line2End = 139;

  const line1Opacity = interpolate(frame, [line1Start, line1Start + 8], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const line1Slide = interpolate(frame, [line1Start, line1Start + 12], [30, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  // Dim line 1 when line 2 starts
  const line1Dim = interpolate(frame, [line2Start - 5, line2Start + 5], [1, 0.3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const line2Opacity = interpolate(frame, [line2Start, line2Start + 8], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const line2Slide = interpolate(frame, [line2Start, line2Start + 12], [30, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Ken Burns — slow zoom on each image
  const imgIndex = frame < 45 ? 0 : frame < 90 ? 1 : 2;
  const imgProgress = frame < 45
    ? frame / 45
    : frame < 90
      ? (frame - 45) / 45
      : (frame - 90) / 49;
  const imgScale = 1 + imgProgress * 0.08;

  // Cross-fade between images
  const getImgOpacity = (idx: number) => {
    if (idx === 0) return interpolate(frame, [0, 5, 40, 48], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (idx === 1) return interpolate(frame, [40, 48, 85, 93], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return interpolate(frame, [85, 93, 135, 139], [0, 1, 1, 0.8], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  };

  return (
    <div
      style={{
        width: tokens.layout.width,
        height: tokens.layout.height,
        backgroundColor: "#1a1a1a",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Image layers */}
      {images.map((src, idx) => (
        <div
          key={idx}
          style={{
            position: "absolute",
            inset: 0,
            opacity: getImgOpacity(idx),
          }}
        >
          <Img
            src={src}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "grayscale(0.7) contrast(1.2)",
              transform: `scale(${idx === imgIndex ? imgScale : 1})`,
            }}
          />
        </div>
      ))}

      {/* Dark overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: `rgba(20, 20, 20, ${overlayOpacity})`,
        }}
      />

      {/* Line 1: "The system that picks your president" */}
      <div
        style={{
          position: "absolute",
          top: "38%",
          width: "100%",
          textAlign: "center",
          opacity: line1Opacity * line1Dim,
          transform: `translateY(${line1Slide}px)`,
        }}
      >
        <span
          style={{
            fontFamily: tokens.fonts.heading,
            fontSize: 64,
            fontWeight: tokens.fontWeights.bold,
            color: "#ffffff",
            textShadow: "0 4px 30px rgba(0,0,0,0.5)",
          }}
        >
          The system that picks your president
        </span>
      </div>

      {/* Line 2: "wasn't designed for you." */}
      <div
        style={{
          position: "absolute",
          top: "52%",
          width: "100%",
          textAlign: "center",
          opacity: line2Opacity,
          transform: `translateY(${line2Slide}px)`,
        }}
      >
        <span
          style={{
            fontFamily: tokens.fonts.heading,
            fontSize: 72,
            fontWeight: tokens.fontWeights.black,
            color: tokens.colors.accent,
            textShadow: "0 4px 30px rgba(0,0,0,0.5)",
          }}
        >
          wasn't designed for you.
        </span>
      </div>
    </div>
  );
};
