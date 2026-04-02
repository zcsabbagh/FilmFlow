import { useCurrentFrame, useVideoConfig, interpolate, spring, Audio, Img, staticFile, Easing } from "remotion";
import { tokens } from "../tokens";

/**
 * Scene 05 — History: pension vanishing act with collage images
 * "In 1980, 60% had a pension... Today 4%. 401k replaced them."
 * Duration: 322 frames (10.7s) — narration is 9.74s + buffer
 */

// Word timing (1.35x speed)
const W = {
  in1980: 0.0,
  sixty: 0.91,
  percent: 1.24,
  pension: 2.01,
  guaranteed: 2.66,
  life: 3.56,
  today: 4.31,
  four: 5.18,
  fourPercent: 5.34,
  fourOhOneK: 6.15,
  supplement: 7.39,
  pensions: 7.72,
  instead: 8.54,
  replaced: 9.08,
  them: 9.36,
};

export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // Slope chart animation: 60% → 4%
  const slopeStart = Math.round(W.sixty * fps);
  const slopeP = spring({ frame: frame - slopeStart, fps, config: { damping: 25, stiffness: 35 } });
  const lineProgress = Math.min(slopeP, 1);

  // "4%" emphasis
  const fourFrame = Math.round(W.fourPercent * fps);
  const fourOp = interpolate(frame, [fourFrame, fourFrame + 10], [0, 1], { extrapolateRight: "clamp" });
  const fourScale = spring({ frame: frame - fourFrame, fps, config: { damping: 12, stiffness: 100 } });

  // "401k replaced them" text
  const replaceFrame = Math.round(W.fourOhOneK * fps);
  const replacedOp = interpolate(frame, [replaceFrame, replaceFrame + 15], [0, 1], { extrapolateRight: "clamp" });

  // "Instead, it replaced them" emphasis
  const insteadFrame = Math.round(W.instead * fps);
  const insteadOp = interpolate(frame, [insteadFrame, insteadFrame + 12], [0, 1], { extrapolateRight: "clamp" });
  const insteadScale = spring({ frame: frame - insteadFrame, fps, config: { damping: 12, stiffness: 100 } });

  // Collage images fade in on right side
  const imgFade = interpolate(frame, [Math.round(W.supplement * fps), Math.round(W.supplement * fps) + 20], [0, 1], { extrapolateRight: "clamp" });

  const LEFT = 180, RIGHT = 680, TOP = 250, BOTTOM = 680;
  const startY = TOP + (1 - 0.6) * (BOTTOM - TOP);
  const endY = TOP + (1 - 0.04) * (BOTTOM - TOP);

  return (
    <div style={{ width: tokens.layout.width, height: tokens.layout.height, backgroundColor: tokens.colors.background, position: "relative", overflow: "hidden" }}>
      <Audio src={staticFile("audio/history.mp3")} />

      {/* Title */}
      <div style={{
        fontFamily: tokens.fonts.heading, fontSize: 38, fontWeight: 700,
        color: tokens.colors.text, position: "absolute", top: 70, left: 100,
        opacity: interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" }),
      }}>
        The pension vanishing act
      </div>

      {/* Slope chart */}
      <svg width={900} height={750} style={{ position: "absolute", top: 0, left: 0 }}>
        <text x={LEFT} y={TOP - 20} textAnchor="middle" fontFamily={tokens.fonts.heading} fontSize={22} fontWeight={700} fill={tokens.colors.text}>1980</text>
        <text x={RIGHT} y={TOP - 20} textAnchor="middle" fontFamily={tokens.fonts.heading} fontSize={22} fontWeight={700} fill={tokens.colors.text}>Today</text>
        <line x1={LEFT} y1={TOP} x2={LEFT} y2={BOTTOM} stroke={tokens.colors.backgroundAlt} strokeWidth={2} />
        <line x1={RIGHT} y1={TOP} x2={RIGHT} y2={BOTTOM} stroke={tokens.colors.backgroundAlt} strokeWidth={2} />

        {/* Declining line */}
        <line
          x1={LEFT} y1={startY}
          x2={LEFT + (RIGHT - LEFT) * lineProgress}
          y2={startY + (endY - startY) * lineProgress}
          stroke={tokens.colors.accent} strokeWidth={5} strokeLinecap="round"
        />
        <circle cx={LEFT} cy={startY} r={10} fill={tokens.colors.accent} />

        {/* "60%" label */}
        <text x={LEFT - 20} y={startY + 6} textAnchor="end" fontFamily={tokens.fonts.heading} fontSize={32} fontWeight={900} fill={tokens.colors.text} opacity={slopeP > 0.1 ? 1 : 0}>
          60%
        </text>

        {/* "4%" label */}
        {lineProgress > 0.9 && (
          <>
            <circle cx={RIGHT} cy={endY} r={10} fill={tokens.colors.accent} />
            <text x={RIGHT + 20} y={endY + 6} fontFamily={tokens.fonts.heading} fontSize={48} fontWeight={900} fill={tokens.colors.accent} opacity={fourOp} transform={`scale(${Math.min(fourScale, 1)})`} style={{ transformOrigin: `${RIGHT + 20}px ${endY}px` }}>
              4%
            </text>
          </>
        )}
      </svg>

      {/* "401(k) was a supplement... It became a replacement" */}
      {t >= W.fourOhOneK && (
        <div style={{ position: "absolute", bottom: 220, left: 100, maxWidth: 500, opacity: replacedOp }}>
          <div style={{ fontFamily: tokens.fonts.body, fontSize: 26, color: tokens.colors.text, fontWeight: 600 }}>
            The 401(k) was a supplement.
          </div>
        </div>
      )}

      {t >= W.instead && (
        <div style={{
          position: "absolute", bottom: 160, left: 100, maxWidth: 500,
          opacity: insteadOp, transform: `scale(${Math.min(insteadScale, 1)})`,
        }}>
          <div style={{ fontFamily: tokens.fonts.body, fontSize: 28, color: tokens.colors.accent, fontWeight: 700 }}>
            It replaced them.
          </div>
        </div>
      )}

      {/* Collage images on right — tilted, overlapping */}
      <Img
        src={staticFile("images/elderly-couple.jpg")}
        style={{
          position: "absolute", right: 20, top: 80,
          width: 520, height: 360, objectFit: "cover",
          borderRadius: 14, transform: "rotate(-3deg)",
          boxShadow: "0 8px 28px rgba(0,0,0,0.2)",
          opacity: imgFade * 0.35,
          filter: "grayscale(40%)",
          border: "3px solid rgba(255,255,255,0.3)",
        }}
      />
      <Img
        src={staticFile("images/hospital-bills.jpg")}
        style={{
          position: "absolute", right: 60, top: 380,
          width: 480, height: 340, objectFit: "cover",
          borderRadius: 14, transform: "rotate(4deg)",
          boxShadow: "0 8px 28px rgba(0,0,0,0.2)",
          opacity: imgFade * 0.3,
          filter: "grayscale(40%)",
          border: "3px solid rgba(255,255,255,0.3)",
        }}
      />

      <div style={{ position: "absolute", bottom: 60, left: 100, fontFamily: tokens.fonts.body, fontSize: 14, color: tokens.colors.textLight }}>
        Source: Bureau of Labor Statistics
      </div>
    </div>
  );
};
