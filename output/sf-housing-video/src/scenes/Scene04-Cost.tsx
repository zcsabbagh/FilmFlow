import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Audio,
  staticFile,
  Easing,
} from "remotion";
import { tokens } from "../tokens";

/**
 * Scene 04 — "Today, the median home costs $1.5M..."
 * Voice-synced: each stat appears exactly when narrated.
 * Uses a sequential reveal — one number at a time, filling the screen.
 */

const T = {
  medianHome: 0,         // "Today, the median home costs"
  onePointFive: 74,      // "one-point-five million dollars"
  toAfford: 177,         // "To afford a two-bedroom apartment"
  hundredThirtyThree: 313, // "a hundred and thirty-three thousand"
  cityMedian: 397,       // "The city's median income?"
  eightyOne: 459,        // "Eighty-one thousand"
  typicalBuyer: 533,     // "The typical buyer spends"
  seventyEight: 571,     // "seventy-eight percent"
  nationalAvg: 654,      // "The national average is"
  fortyTwo: 692,         // "forty-two"
};

export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Stat 1: $1.5M median home ──
  const stat1Progress = spring({
    frame: frame - T.onePointFive,
    fps,
    config: { damping: 25, stiffness: 50 },
  });
  const stat1Opacity = interpolate(frame, [T.medianHome, T.medianHome + 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Dim stat 1 when stat 2 arrives
  const stat1Dim = frame >= T.toAfford
    ? interpolate(frame, [T.toAfford, T.toAfford + 20], [1, 0.25], { extrapolateRight: "clamp" })
    : 1;

  // ── Stat 2: $133K income needed ──
  const stat2Progress = spring({
    frame: frame - T.hundredThirtyThree,
    fps,
    config: { damping: 25, stiffness: 50 },
  });
  const stat2Opacity = interpolate(frame, [T.toAfford, T.toAfford + 15], [0, 1], {
    extrapolateRight: "clamp",
  });
  const stat2Slide = interpolate(frame, [T.toAfford, T.toAfford + 15], [20, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Dim stat 2 when stat 3 arrives
  const stat2Dim = frame >= T.cityMedian
    ? interpolate(frame, [T.cityMedian, T.cityMedian + 20], [1, 0.25], { extrapolateRight: "clamp" })
    : 1;

  // ── Stat 3: $81K median income ──
  const stat3Progress = spring({
    frame: frame - T.eightyOne,
    fps,
    config: { damping: 25, stiffness: 50 },
  });
  const stat3Opacity = interpolate(frame, [T.cityMedian, T.cityMedian + 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Dim all stats when the 78% comparison arrives
  const allStatsDim = frame >= T.typicalBuyer
    ? interpolate(frame, [T.typicalBuyer, T.typicalBuyer + 15], [1, 0], { extrapolateRight: "clamp" })
    : 1;

  // ── Act 2: 78% vs 42% ring/visual ──
  const showComparison = frame >= T.typicalBuyer;
  const compOpacity = interpolate(frame, [T.typicalBuyer, T.typicalBuyer + 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  // 78% ring fills when narrator says it
  const ring78Progress = interpolate(frame, [T.seventyEight, T.seventyEight + 30], [0, 0.78], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // 42% ring fills when narrator says "forty-two"
  const ring42Progress = interpolate(frame, [T.fortyTwo, T.fortyTwo + 25], [0, 0.42], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Ring SVG helper
  const ringRadius = 120;
  const ringStroke = 24;
  const ringCircumference = 2 * Math.PI * ringRadius;

  return (
    <div
      style={{
        width: tokens.layout.width,
        height: tokens.layout.height,
        backgroundColor: tokens.colors.background,
        padding: tokens.layout.padding,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Audio src={staticFile("audio/scene04-cost.mp3")} />

      {/* ═══ Sequential stats ═══ */}
      <div style={{ opacity: allStatsDim }}>
        {/* Title */}
        <div
          style={{
            fontFamily: tokens.fonts.heading,
            fontSize: 40,
            fontWeight: tokens.fontWeights.bold,
            color: tokens.colors.text,
            opacity: stat1Opacity,
            marginBottom: 60,
          }}
        >
          The cost of living in SF
        </div>

        {/* $1.5M */}
        <div style={{ opacity: stat1Opacity * stat1Dim, marginBottom: 40 }}>
          <div
            style={{
              fontFamily: tokens.fonts.heading,
              fontSize: 120,
              fontWeight: tokens.fontWeights.black,
              color: tokens.colors.text,
              lineHeight: 1,
            }}
          >
            ${(1.5 * stat1Progress).toFixed(1)}M
          </div>
          <div
            style={{
              fontFamily: tokens.fonts.body,
              fontSize: 22,
              color: tokens.colors.textMuted,
              marginTop: 8,
            }}
          >
            median home price
          </div>
        </div>

        {/* $133K */}
        {frame >= T.toAfford && (
          <div
            style={{
              opacity: stat2Opacity * stat2Dim,
              transform: `translateY(${stat2Slide}px)`,
              marginBottom: 40,
            }}
          >
            <div
              style={{
                fontFamily: tokens.fonts.heading,
                fontSize: 100,
                fontWeight: tokens.fontWeights.black,
                color: tokens.colors.accent,
                lineHeight: 1,
              }}
            >
              ${Math.round(133 * stat2Progress)}K
            </div>
            <div
              style={{
                fontFamily: tokens.fonts.body,
                fontSize: 22,
                color: tokens.colors.textMuted,
                marginTop: 8,
              }}
            >
              income needed for a two-bedroom apartment
            </div>
          </div>
        )}

        {/* $81K */}
        {frame >= T.cityMedian && (
          <div style={{ opacity: stat3Opacity }}>
            <div
              style={{
                fontFamily: tokens.fonts.heading,
                fontSize: 100,
                fontWeight: tokens.fontWeights.black,
                color: "#5b7e96",
                lineHeight: 1,
              }}
            >
              ${Math.round(81 * stat3Progress)}K
            </div>
            <div
              style={{
                fontFamily: tokens.fonts.body,
                fontSize: 22,
                color: tokens.colors.textMuted,
                marginTop: 8,
              }}
            >
              city&apos;s actual median income
            </div>
          </div>
        )}
      </div>

      {/* ═══ Act 2: Ring charts — 78% vs 42% ═══ */}
      {showComparison && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 160,
            opacity: compOpacity,
          }}
        >
          {/* SF: 78% */}
          <div style={{ textAlign: "center" }}>
            <svg width={ringRadius * 2 + ringStroke} height={ringRadius * 2 + ringStroke}>
              {/* Background ring */}
              <circle
                cx={ringRadius + ringStroke / 2}
                cy={ringRadius + ringStroke / 2}
                r={ringRadius}
                fill="none"
                stroke={tokens.colors.backgroundAlt}
                strokeWidth={ringStroke}
              />
              {/* Fill ring */}
              <circle
                cx={ringRadius + ringStroke / 2}
                cy={ringRadius + ringStroke / 2}
                r={ringRadius}
                fill="none"
                stroke={tokens.colors.accent}
                strokeWidth={ringStroke}
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringCircumference * (1 - ring78Progress)}
                strokeLinecap="round"
                transform={`rotate(-90 ${ringRadius + ringStroke / 2} ${ringRadius + ringStroke / 2})`}
              />
              {/* Center number */}
              <text
                x={ringRadius + ringStroke / 2}
                y={ringRadius + ringStroke / 2 + 15}
                textAnchor="middle"
                fontFamily={tokens.fonts.heading}
                fontSize={56}
                fontWeight={tokens.fontWeights.black}
                fill={tokens.colors.text}
              >
                {Math.round(ring78Progress * 100)}%
              </text>
            </svg>
            <div
              style={{
                fontFamily: tokens.fonts.body,
                fontSize: 20,
                color: tokens.colors.textMuted,
                marginTop: 12,
              }}
            >
              San Francisco
            </div>
          </div>

          {/* National: 42% */}
          <div style={{ textAlign: "center" }}>
            <svg width={ringRadius * 2 + ringStroke} height={ringRadius * 2 + ringStroke}>
              <circle
                cx={ringRadius + ringStroke / 2}
                cy={ringRadius + ringStroke / 2}
                r={ringRadius}
                fill="none"
                stroke={tokens.colors.backgroundAlt}
                strokeWidth={ringStroke}
              />
              <circle
                cx={ringRadius + ringStroke / 2}
                cy={ringRadius + ringStroke / 2}
                r={ringRadius}
                fill="none"
                stroke="#5b7e96"
                strokeWidth={ringStroke}
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringCircumference * (1 - ring42Progress)}
                strokeLinecap="round"
                transform={`rotate(-90 ${ringRadius + ringStroke / 2} ${ringRadius + ringStroke / 2})`}
              />
              <text
                x={ringRadius + ringStroke / 2}
                y={ringRadius + ringStroke / 2 + 15}
                textAnchor="middle"
                fontFamily={tokens.fonts.heading}
                fontSize={56}
                fontWeight={tokens.fontWeights.black}
                fill={tokens.colors.text}
              >
                {Math.round(ring42Progress * 100)}%
              </text>
            </svg>
            <div
              style={{
                fontFamily: tokens.fonts.body,
                fontSize: 20,
                color: tokens.colors.textMuted,
                marginTop: 12,
              }}
            >
              National average
            </div>
          </div>
        </div>
      )}

      {/* Source */}
      <div
        style={{
          position: "absolute",
          bottom: tokens.layout.padding,
          left: tokens.layout.padding,
          fontFamily: tokens.fonts.body,
          fontSize: 14,
          color: tokens.colors.textLight,
          opacity: interpolate(frame, [50, 70], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        Source: CNBC, Redfin, sf.gov
      </div>
    </div>
  );
};
