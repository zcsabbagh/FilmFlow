import { useCurrentFrame, interpolate, Img, staticFile, Easing } from "remotion";
import { tokens } from "../tokens";

/** Scene 04 — Headline screenshot with zoom-in animation (no narration) */
export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const scale = interpolate(frame, [0, 240], [1, 1.08], { extrapolateRight: "clamp" }); // Slow Ken Burns zoom
  const captionOp = interpolate(frame, [60, 80], [0, 1], { extrapolateRight: "clamp" });
  const captionSlide = interpolate(frame, [60, 80], [15, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

  return (
    <div style={{ width: tokens.layout.width, height: tokens.layout.height, backgroundColor: "#fff", position: "relative", overflow: "hidden" }}>
      {/* Headline screenshot */}
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: fadeIn }}>
        <Img
          src={staticFile("images/headline.png")}
          style={{ maxWidth: "80%", maxHeight: "60%", objectFit: "contain", transform: `scale(${scale})` }}
        />
      </div>

      {/* Caption overlay at bottom */}
      <div style={{
        position: "absolute", bottom: 80, left: 100, right: 100,
        opacity: captionOp, transform: `translateY(${captionSlide}px)`,
      }}>
        <div style={{
          fontFamily: tokens.fonts.body, fontSize: 22, color: tokens.colors.text,
          borderLeft: `4px solid ${tokens.colors.accent}`, paddingLeft: 16,
        }}>
          The longest period without a federal minimum wage increase in US history
        </div>
      </div>
    </div>
  );
};
