import { useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from "remotion";
import { tokens } from "../tokens";

/**
 * Scene 5: Five Failures — the 5 elections where popular vote winner lost
 *
 * Timing:
 * Five@8, times@12, American@28, popular@71, vote@85, winner@92
 * [pause]@110, lost@128, presidency@138
 * Eighteen@199, twenty-four@205
 * Eighteen@240, seventy-six@248
 * Eighteen@286, eighty-eight@295
 * Two@329, thousand@335
 * And@395, twenty@399, sixteen@411
 */

const elections = [
  { year: "1824", winner: "J.Q. Adams", loser: "A. Jackson", note: "Decided by House", appearFrame: 199 },
  { year: "1876", winner: "R. Hayes", loser: "S. Tilden", note: "Tilden won 51% popular vote", appearFrame: 240 },
  { year: "1888", winner: "B. Harrison", loser: "G. Cleveland", note: "Cleveland won by 0.8%", appearFrame: 286 },
  { year: "2000", winner: "G.W. Bush", loser: "A. Gore", note: "Florida: 537 votes", appearFrame: 329 },
  { year: "2016", winner: "D. Trump", loser: "H. Clinton", note: "Clinton won by 2.9M votes", appearFrame: 395 },
];

export const Scene5Failures: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  // "5" big number at frame 8
  const fiveOpacity = interpolate(frame, [8, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fiveScale = spring({ frame: frame - 8, fps, config: { damping: 10, stiffness: 150 } });

  // "popular vote winner lost" at frame 71
  const subtitleOpacity = interpolate(frame, [71, 92], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div
      style={{
        width: tokens.layout.width,
        height: tokens.layout.height,
        backgroundColor: tokens.colors.background,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />

      {/* Big "5" and subtitle — top section */}
      <div style={{
        position: "absolute", top: 60, left: tokens.layout.padding, right: tokens.layout.padding,
        display: "flex", alignItems: "flex-end", gap: 24,
      }}>
        <div style={{
          fontFamily: tokens.fonts.heading, fontSize: 160, fontWeight: tokens.fontWeights.black,
          color: tokens.colors.secondary, lineHeight: 1, opacity: fiveOpacity,
          transform: `scale(${0.85 + 0.15 * Math.min(fiveScale, 1)})`,
          transformOrigin: "left bottom",
        }}>
          5
        </div>
        <div style={{
          opacity: subtitleOpacity, paddingBottom: 28,
        }}>
          <div style={{ fontFamily: tokens.fonts.heading, fontSize: 36, fontWeight: tokens.fontWeights.bold, color: tokens.colors.text, lineHeight: 1.2 }}>
            times the popular vote
          </div>
          <div style={{ fontFamily: tokens.fonts.heading, fontSize: 36, fontWeight: tokens.fontWeights.bold, color: tokens.colors.text, lineHeight: 1.2 }}>
            winner <span style={{ color: tokens.colors.secondary }}>lost</span> the presidency
          </div>
        </div>
      </div>

      {/* Election cards — staggered rows */}
      {elections.map((e, i) => {
        const cardProgress = spring({ frame: frame - e.appearFrame, fps, config: { damping: 18, stiffness: 100 } });
        const cardOpacity = interpolate(cardProgress, [0, 0.3], [0, 1], { extrapolateRight: "clamp" });
        const cardSlide = (1 - Math.min(cardProgress, 1)) * 40;

        const y = 320 + i * 130;
        const isRecent = e.year === "2000" || e.year === "2016";

        return (
          <div
            key={e.year}
            style={{
              position: "absolute",
              left: tokens.layout.padding + 40,
              right: tokens.layout.padding + 40,
              top: y,
              height: 110,
              opacity: cardOpacity,
              transform: `translateX(${cardSlide}px)`,
              display: "flex",
              alignItems: "center",
              gap: 30,
              backgroundColor: isRecent ? "rgba(192, 57, 43, 0.06)" : "rgba(0,0,0,0.02)",
              borderRadius: 12,
              padding: "0 30px",
              borderLeft: `4px solid ${isRecent ? tokens.colors.secondary : tokens.colors.accent}`,
            }}
          >
            {/* Year */}
            <div style={{
              fontFamily: tokens.fonts.heading, fontSize: 48, fontWeight: tokens.fontWeights.black,
              color: isRecent ? tokens.colors.secondary : tokens.colors.accent,
              width: 140,
            }}>
              {e.year}
            </div>

            {/* Winner (EC) vs Loser (PV) */}
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: tokens.fonts.body, fontSize: 22, fontWeight: tokens.fontWeights.semibold, color: tokens.colors.text }}>
                <span style={{ color: tokens.colors.textMuted }}>EC Winner:</span> {e.winner}
              </div>
              <div style={{ fontFamily: tokens.fonts.body, fontSize: 20, color: tokens.colors.textMuted, marginTop: 4 }}>
                <span>PV Winner:</span> {e.loser}
              </div>
            </div>

            {/* Note */}
            <div style={{
              fontFamily: tokens.fonts.body, fontSize: 18, fontWeight: tokens.fontWeights.medium,
              color: isRecent ? tokens.colors.secondary : tokens.colors.textMuted,
              textAlign: "right" as const, width: 280,
            }}>
              {e.note}
            </div>
          </div>
        );
      })}

      {/* Source */}
      <div style={{
        position: "absolute", bottom: 30, left: tokens.layout.padding,
        fontFamily: tokens.fonts.body, fontSize: 14, color: tokens.colors.textLight,
        opacity: interpolate(frame, [200, 220], [0, 1], { extrapolateRight: "clamp" }),
      }}>
        Source: National Archives, Electoral College History
      </div>
    </div>
  );
};
