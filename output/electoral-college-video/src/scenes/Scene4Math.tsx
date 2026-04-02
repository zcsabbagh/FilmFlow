import { useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from "remotion";
import { tokens } from "../tokens";

/**
 * Scene 4: The Math — Visual comparison of voting power
 * Wyoming vs California — pictogram style with person icons
 *
 * Timing:
 * stranger@19, voter@57, Wyoming@74, three-point-six@105, times@146,
 * electoral@167, power@182, voter@208, California@227
 * Same@302, country@306, Same@332, election@339, different@382, math@395
 */

const PersonIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <svg width={size} height={size * 1.6} viewBox="0 0 24 38" fill={color}>
    <circle cx="12" cy="8" r="7" />
    <path d="M4 18 C4 15 8 14 12 14 C16 14 20 15 20 18 L20 34 C20 36 18 38 16 38 L8 38 C6 38 4 36 4 34 Z" />
  </svg>
);

export const Scene4Math: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title animation
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const titleSlide = interpolate(frame, [0, 15], [20, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

  // Wyoming section appears at frame 57
  const wyOpacity = spring({ frame: frame - 57, fps, config: { damping: 20, stiffness: 80 } });
  // California section appears at frame 208
  const caOpacity = spring({ frame: frame - 208, fps, config: { damping: 20, stiffness: 80 } });

  // "3.6x" callout at frame 105
  const ratioOpacity = interpolate(frame, [105, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ratioScale = spring({ frame: frame - 105, fps, config: { damping: 10, stiffness: 150 } });

  // "Same country. Same election." at frame 302
  const sameOpacity = interpolate(frame, [302, 318], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // "Very different math." at frame 382
  const diffOpacity = interpolate(frame, [382, 395], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Layout
  const centerY = 480;
  const wyX = 300;
  const caX = 1100;

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

      {/* Title */}
      <div style={{
        position: "absolute", top: 80, width: "100%", textAlign: "center",
        opacity: titleOpacity, transform: `translateY(${titleSlide}px)`,
      }}>
        <div style={{ fontFamily: tokens.fonts.heading, fontSize: 48, fontWeight: tokens.fontWeights.bold, color: tokens.colors.text }}>
          The Voting Power Gap
        </div>
      </div>

      {/* Wyoming section — 1 person = large icon */}
      <div style={{
        position: "absolute", left: wyX - 120, top: centerY - 200, width: 300, textAlign: "center" as const,
        opacity: Math.min(wyOpacity, 1),
        transform: `translateY(${(1 - Math.min(wyOpacity, 1)) * 20}px)`,
      }}>
        <div style={{ fontFamily: tokens.fonts.heading, fontSize: 32, fontWeight: tokens.fontWeights.bold, color: tokens.colors.accent, marginBottom: 20 }}>
          Wyoming
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <PersonIcon color={tokens.colors.accent} size={80} />
        </div>
        <div style={{ fontFamily: tokens.fonts.body, fontSize: 20, color: tokens.colors.textMuted }}>
          1 voter
        </div>
        <div style={{ fontFamily: tokens.fonts.heading, fontSize: 28, fontWeight: tokens.fontWeights.bold, color: tokens.colors.text, marginTop: 8 }}>
          3 electoral votes
        </div>
        <div style={{ fontFamily: tokens.fonts.body, fontSize: 16, color: tokens.colors.textLight, marginTop: 4 }}>
          ~194,000 people per elector
        </div>
      </div>

      {/* Center: "3.6x" callout */}
      <div style={{
        position: "absolute",
        left: "50%", top: centerY - 40,
        transform: `translateX(-50%) scale(${0.85 + 0.15 * Math.min(ratioScale, 1)})`,
        opacity: ratioOpacity,
        textAlign: "center" as const,
      }}>
        <div style={{
          fontFamily: tokens.fonts.heading, fontSize: 140, fontWeight: tokens.fontWeights.black,
          color: tokens.colors.secondary, lineHeight: 1,
        }}>
          3.6x
        </div>
        <div style={{ fontFamily: tokens.fonts.body, fontSize: 20, color: tokens.colors.textMuted, marginTop: -4 }}>
          more electoral power
        </div>
      </div>

      {/* California section — 3.6 person icons to show dilution */}
      <div style={{
        position: "absolute", left: caX - 120, top: centerY - 200, width: 300, textAlign: "center" as const,
        opacity: Math.min(caOpacity, 1),
        transform: `translateY(${(1 - Math.min(caOpacity, 1)) * 20}px)`,
      }}>
        <div style={{ fontFamily: tokens.fonts.heading, fontSize: 32, fontWeight: tokens.fontWeights.bold, color: "#5b7e96", marginBottom: 20 }}>
          California
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 16, flexWrap: "wrap" as const }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              opacity: interpolate(frame, [208 + i * 8, 218 + i * 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            }}>
              <PersonIcon color="#5b7e96" size={44} />
            </div>
          ))}
          {/* Partial 4th person to represent 0.6 */}
          <div style={{
            opacity: interpolate(frame, [232, 242], [0, 0.6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}>
            <PersonIcon color="#5b7e96" size={44} />
          </div>
        </div>
        <div style={{ fontFamily: tokens.fonts.body, fontSize: 20, color: tokens.colors.textMuted }}>
          3.6 voters needed
        </div>
        <div style={{ fontFamily: tokens.fonts.heading, fontSize: 28, fontWeight: tokens.fontWeights.bold, color: tokens.colors.text, marginTop: 8 }}>
          54 electoral votes
        </div>
        <div style={{ fontFamily: tokens.fonts.body, fontSize: 16, color: tokens.colors.textLight, marginTop: 4 }}>
          ~720,000 people per elector
        </div>
      </div>

      {/* "Same country. Same election." */}
      <div style={{
        position: "absolute", bottom: 140, width: "100%", textAlign: "center",
        opacity: sameOpacity,
      }}>
        <span style={{ fontFamily: tokens.fonts.heading, fontSize: 34, fontWeight: tokens.fontWeights.bold, color: tokens.colors.textMuted }}>
          Same country. Same election.
        </span>
      </div>

      {/* "Very different math." */}
      <div style={{
        position: "absolute", bottom: 85, width: "100%", textAlign: "center",
        opacity: diffOpacity,
      }}>
        <span style={{ fontFamily: tokens.fonts.heading, fontSize: 38, fontWeight: tokens.fontWeights.black, color: tokens.colors.secondary }}>
          Very different math.
        </span>
      </div>

      {/* Source */}
      <div style={{
        position: "absolute", bottom: 30, left: tokens.layout.padding,
        fontFamily: tokens.fonts.body, fontSize: 14, color: tokens.colors.textLight,
        opacity: interpolate(frame, [60, 80], [0, 1], { extrapolateRight: "clamp" }),
      }}>
        Source: U.S. Census Bureau, 2023 Population Estimates
      </div>
    </div>
  );
};
