import { useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from "remotion";
import { tokens } from "../tokens";

/**
 * Scene 2: History — custom timeline visualization
 * "[serious] In seventeen eighty-seven, the founders created a compromise..."
 *
 * Timing:
 * seventeen@9, eighty-seven@25, founders@64, compromise@95, Electoral@133, College@148
 * Built@214, thirteen@221, states@236, four@255, million@262, people@274
 * But@301, country@305, growing@325, system@359, didn't@398
 */
export const Scene2History: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Timeline milestones
  const milestones = [
    { year: "1787", label: "13 states", sub: "4 million people", frame: 9 },
    { year: "1860", label: "33 states", sub: "31 million", frame: 221 },
    { year: "1920", label: "48 states", sub: "106 million", frame: 280 },
    { year: "1960", label: "50 states", sub: "179 million", frame: 310 },
    { year: "2024", label: "50 states", sub: "330 million", frame: 340 },
  ];

  // Title
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const titleSlide = interpolate(frame, [0, 15], [20, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

  // "Electoral College" callout appears at frame 133
  const ecOpacity = interpolate(frame, [133, 148], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ecScale = spring({ frame: frame - 133, fps, config: { damping: 12, stiffness: 120 } });

  // "But the system didn't" — red accent line at frame 349
  const redLineWidth = interpolate(frame, [349, 380], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

  // Timeline horizontal line
  const lineLeft = tokens.layout.padding + 60;
  const lineRight = tokens.layout.width - tokens.layout.padding - 60;
  const lineY = 620;
  const lineWidth = lineRight - lineLeft;

  // Line draws across
  const lineProgress = interpolate(frame, [9, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

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
      {/* Subtle grid texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Title: "The Electoral College" — large serif */}
      <div
        style={{
          position: "absolute",
          top: 100,
          width: "100%",
          textAlign: "center",
          opacity: titleOpacity,
          transform: `translateY(${titleSlide}px)`,
        }}
      >
        <div
          style={{
            fontFamily: tokens.fonts.heading,
            fontSize: 52,
            fontWeight: tokens.fontWeights.bold,
            color: tokens.colors.text,
          }}
        >
          A System Built for a Smaller Nation
        </div>
      </div>

      {/* Big "Electoral College" callout */}
      <div
        style={{
          position: "absolute",
          top: 200,
          width: "100%",
          textAlign: "center",
          opacity: ecOpacity,
          transform: `scale(${0.85 + 0.15 * Math.min(ecScale, 1)})`,
        }}
      >
        <span
          style={{
            fontFamily: tokens.fonts.heading,
            fontSize: 110,
            fontWeight: tokens.fontWeights.black,
            color: tokens.colors.accent,
            letterSpacing: -2,
          }}
        >
          Electoral College
        </span>
        <div
          style={{
            fontFamily: tokens.fonts.body,
            fontSize: 22,
            color: tokens.colors.textMuted,
            marginTop: 8,
          }}
        >
          Established by the Constitutional Convention, 1787
        </div>
      </div>

      {/* Horizontal timeline line */}
      <div
        style={{
          position: "absolute",
          left: lineLeft,
          top: lineY,
          width: lineWidth * lineProgress,
          height: 4,
          backgroundColor: tokens.colors.text,
          borderRadius: 2,
        }}
      />

      {/* Timeline milestones */}
      {milestones.map((m, i) => {
        const x = lineLeft + (i / (milestones.length - 1)) * lineWidth;
        const mProgress = spring({
          frame: frame - m.frame,
          fps,
          config: { damping: 18, stiffness: 100 },
        });
        const mOpacity = interpolate(mProgress, [0, 0.3], [0, 1], { extrapolateRight: "clamp" });
        const mSlide = (1 - Math.min(mProgress, 1)) * 20;

        // Highlight 1787 and 2024 differently
        const isFirst = i === 0;
        const isLast = i === milestones.length - 1;
        const dotColor = isFirst ? tokens.colors.accent : isLast ? tokens.colors.secondary : tokens.colors.text;
        const dotSize = isFirst || isLast ? 18 : 12;

        return (
          <div key={m.year} style={{ position: "absolute", left: x - 50, top: lineY - 120, width: 100, textAlign: "center" as const, opacity: mOpacity, transform: `translateY(${mSlide}px)` }}>
            {/* Year */}
            <div style={{ fontFamily: tokens.fonts.heading, fontSize: isFirst || isLast ? 36 : 24, fontWeight: tokens.fontWeights.bold, color: dotColor }}>
              {m.year}
            </div>
            {/* Label */}
            <div style={{ fontFamily: tokens.fonts.body, fontSize: 16, color: tokens.colors.textMuted, marginTop: 4 }}>
              {m.label}
            </div>
            {/* Sub */}
            <div style={{ fontFamily: tokens.fonts.body, fontSize: 14, color: tokens.colors.textLight, marginTop: 2 }}>
              {m.sub}
            </div>
            {/* Dot on timeline */}
            <div style={{
              position: "absolute",
              left: 50 - dotSize / 2,
              top: 120 - dotSize / 2,
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: dotColor,
            }} />
          </div>
        );
      })}

      {/* Population growth bar below timeline */}
      {milestones.map((m, i) => {
        const x = lineLeft + (i / (milestones.length - 1)) * lineWidth;
        const populations = [4, 31, 106, 179, 330];
        const maxPop = 330;
        const barHeight = (populations[i] / maxPop) * 200;
        const barProgress = spring({ frame: frame - m.frame - 10, fps, config: { damping: 20, stiffness: 60 } });

        return (
          <div key={`bar-${m.year}`} style={{
            position: "absolute",
            left: x - 20,
            bottom: tokens.layout.height - lineY - 30,
            width: 40,
            height: barHeight * Math.min(barProgress, 1),
            backgroundColor: i === milestones.length - 1 ? tokens.colors.secondary : tokens.colors.accent,
            opacity: Math.min(barProgress, 1) * 0.7,
            borderRadius: "4px 4px 0 0",
            transformOrigin: "bottom",
          }} />
        );
      })}

      {/* "The system didn't" red accent line */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center" as const,
          opacity: interpolate(frame, [355, 370], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        <div style={{
          fontFamily: tokens.fonts.heading,
          fontSize: 32,
          fontWeight: tokens.fontWeights.bold,
          color: tokens.colors.secondary,
        }}>
          The system didn't change.
        </div>
        <div style={{
          width: `${redLineWidth}%`,
          height: 3,
          backgroundColor: tokens.colors.secondary,
          margin: "8px auto 0",
          borderRadius: 2,
        }} />
      </div>

      {/* Source */}
      <div style={{
        position: "absolute",
        bottom: 30,
        left: tokens.layout.padding,
        fontFamily: tokens.fonts.body,
        fontSize: 14,
        color: tokens.colors.textLight,
        opacity: interpolate(frame, [50, 70], [0, 1], { extrapolateRight: "clamp" }),
      }}>
        Source: U.S. Census Bureau, Constitutional Convention Records
      </div>
    </div>
  );
};
