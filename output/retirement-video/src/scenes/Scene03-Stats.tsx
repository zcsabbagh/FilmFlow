import { useCurrentFrame, useVideoConfig, interpolate, spring, Audio, Img, staticFile, Easing } from "remotion";
import { tokens } from "../tokens";

/**
 * Scene 03 — Stats with collage images
 * "The median retirement account? $212,000. 7 years of expenses. Half have even less."
 * Duration: 225 frames (7.5s) — narration is 6.52s + buffer
 */

// Word timing (1.35x speed)
const W = {
  median: 0.18,
  account: 0.84,
  twoHundred: 1.52,
  thousand: 2.23,
  dollars: 2.51,
  seven: 3.21,
  years: 3.46,
  expenses: 3.73,
  andThats: 4.45,
  halfHave: 5.47,
  less: 6.03,
};

export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // Collage images — overlapping, tilted with shadows
  const collageVisible = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  // "$212,000" ticker animation
  const tickerStart = Math.round(W.twoHundred * fps);
  const tickerP = spring({ frame: frame - tickerStart, fps, config: { damping: 30, stiffness: 40 } });
  const dollarAmount = Math.round(212000 * Math.min(tickerP, 1));

  // "7 years" emphasis
  const sevenFrame = Math.round(W.seven * fps);
  const sevenOp = interpolate(frame, [sevenFrame, sevenFrame + 10], [0, 1], { extrapolateRight: "clamp" });
  const sevenScale = spring({ frame: frame - sevenFrame, fps, config: { damping: 12, stiffness: 100 } });

  // "Half have even less" punch
  const halfFrame = Math.round(W.halfHave * fps);
  const halfOp = interpolate(frame, [halfFrame, halfFrame + 10], [0, 1], { extrapolateRight: "clamp" });
  const halfScale = spring({ frame: frame - halfFrame, fps, config: { damping: 12, stiffness: 120 } });

  return (
    <div style={{ width: tokens.layout.width, height: tokens.layout.height, backgroundColor: tokens.colors.background, position: "relative", overflow: "hidden" }}>
      <Audio src={staticFile("audio/stats.mp3")} />

      {/* Collage images — tilted, overlapping, with shadows */}
      <Img
        src={staticFile("images/piggy-bank.jpg")}
        style={{
          position: "absolute", right: -30, top: -20,
          width: 520, height: 380, objectFit: "cover",
          borderRadius: 14, transform: "rotate(3deg)",
          boxShadow: "0 8px 28px rgba(0,0,0,0.2)",
          opacity: collageVisible * 0.35,
          filter: "grayscale(50%)",
          border: "3px solid rgba(255,255,255,0.3)",
        }}
      />
      <Img
        src={staticFile("images/empty-wallet.jpg")}
        style={{
          position: "absolute", right: 80, top: 300,
          width: 480, height: 340, objectFit: "cover",
          borderRadius: 14, transform: "rotate(-4deg)",
          boxShadow: "0 8px 28px rgba(0,0,0,0.2)",
          opacity: collageVisible * 0.3,
          filter: "grayscale(50%)",
          border: "3px solid rgba(255,255,255,0.3)",
        }}
      />
      <Img
        src={staticFile("images/savings-jar.jpg")}
        style={{
          position: "absolute", right: -10, bottom: -10,
          width: 440, height: 320, objectFit: "cover",
          borderRadius: 14, transform: "rotate(2deg)",
          boxShadow: "0 8px 28px rgba(0,0,0,0.2)",
          opacity: collageVisible * 0.28,
          filter: "grayscale(50%)",
          border: "3px solid rgba(255,255,255,0.3)",
        }}
      />

      {/* Label */}
      <div style={{
        position: "absolute", top: 100, left: 100,
        opacity: interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" }),
      }}>
        <div style={{
          fontFamily: tokens.fonts.body, fontSize: 16, fontWeight: 600,
          color: tokens.colors.textMuted, textTransform: "uppercase", letterSpacing: 3,
          marginBottom: 16,
        }}>
          Median retirement savings, age 60-64
        </div>
      </div>

      {/* "$212,000" big number */}
      <div style={{ position: "absolute", top: 160, left: 100 }}>
        <div style={{
          fontFamily: tokens.fonts.heading, fontSize: 140, fontWeight: 900,
          color: tokens.colors.text, lineHeight: 1,
        }}>
          ${dollarAmount.toLocaleString()}
        </div>
      </div>

      {/* "7 years of expenses" */}
      {t >= W.seven && (
        <div style={{
          position: "absolute", top: 360, left: 100,
          opacity: sevenOp, transform: `scale(${Math.min(sevenScale, 1)})`,
        }}>
          <div style={{ fontFamily: tokens.fonts.heading, fontSize: 52, fontWeight: 900, color: tokens.colors.text }}>
            7 years <span style={{ fontSize: 28, fontWeight: 500, fontFamily: tokens.fonts.body, color: tokens.colors.textMuted }}>of expenses</span>
          </div>
        </div>
      )}

      {/* "Half have even less." */}
      {t >= W.halfHave && (
        <div style={{
          position: "absolute", bottom: 200, left: 100,
          fontFamily: tokens.fonts.heading, fontSize: 48, fontWeight: 900,
          color: tokens.colors.accent,
          opacity: halfOp, transform: `scale(${Math.min(halfScale, 1)})`,
        }}>
          Half have even less.
        </div>
      )}

      <div style={{ position: "absolute", bottom: 60, left: 100, fontFamily: tokens.fonts.body, fontSize: 14, color: tokens.colors.textLight }}>
        Source: Federal Reserve, 2022
      </div>
    </div>
  );
};
