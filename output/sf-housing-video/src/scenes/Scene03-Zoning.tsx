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
 * Scene 03 — "Here's why. Seventy-five percent..."
 * Voice-synced choreography from scene03-zoning.timing.json
 */

const T = {
  // Act 1: 75% stat builds up
  heresWhy: 0,           // "Here's why."
  seventyFive: 34,       // "Seventy-five percent"
  sfResidential: 70,     // "of San Francisco's residential land"
  zonedSFH: 130,         // "is zoned exclusively for single-family homes"
  fortyFoot: 223,        // "with a forty-foot height limit"

  // Act 2: "literally illegal" emphasis
  thatMeans: 292,        // "That means on most of the city's land"
  literallyIllegal: 377, // "it is literally illegal to build an apartment"

  // Act 3: Permit comparison
  gettingPermit: 483,    // "Getting a multi-family permit takes"
  sixHundredDays: 560,   // "six hundred and thirty days"
  inTokyo: 633,          // "In Tokyo, it takes six months"
};

export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Act 1: The 75% stat ──

  // Title slides in
  const titleOpacity = interpolate(frame, [T.heresWhy, T.heresWhy + 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  // "75%" counter — starts counting at "Seventy-five"
  const percentProgress = interpolate(frame, [T.seventyFive, T.seventyFive + 30], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const displayPercent = Math.round(75 * percentProgress);

  // Subtitle "of SF residential land..." fades in
  const subtitleOpacity = interpolate(frame, [T.sfResidential, T.sfResidential + 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  // "zoned exclusively for single-family homes" — second line
  const zonedOpacity = interpolate(frame, [T.zonedSFH, T.zonedSFH + 15], [0, 1], {
    extrapolateRight: "clamp",
  });
  const zonedSlide = interpolate(frame, [T.zonedSFH, T.zonedSFH + 15], [12, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // "40 ft height limit" — appears with accent color
  const heightOpacity = interpolate(frame, [T.fortyFoot, T.fortyFoot + 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  // ── Act 2: "Literally illegal" ──
  const illegalOpacity = interpolate(frame, [T.literallyIllegal, T.literallyIllegal + 15], [0, 1], {
    extrapolateRight: "clamp",
  });
  const illegalScale = spring({
    frame: frame - T.literallyIllegal,
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  // Fade act 1 content when act 2 emphasis hits
  const act1Dim = frame >= T.thatMeans
    ? interpolate(frame, [T.thatMeans, T.literallyIllegal], [1, 0.3], { extrapolateRight: "clamp" })
    : 1;

  // ── Act 3: Permit timeline comparison ──
  const showComparison = frame >= T.gettingPermit;
  const comparisonOpacity = interpolate(frame, [T.gettingPermit, T.gettingPermit + 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  // SF bar grows to full width when "630 days" spoken
  const sfBarProgress = interpolate(frame, [T.gettingPermit + 10, T.sixHundredDays], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Tokyo bar appears on "In Tokyo"
  const tokyoBarProgress = interpolate(frame, [T.inTokyo, T.inTokyo + 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Dim upper content when comparison appears
  const upperDim = showComparison
    ? interpolate(frame, [T.gettingPermit, T.gettingPermit + 20], [1, 0], { extrapolateRight: "clamp" })
    : 1;

  const BAR_MAX_WIDTH = 900;

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
      <Audio src={staticFile("audio/scene03-zoning.mp3")} />

      {/* ═══ Act 1 + 2: Zoning stats ═══ */}
      <div style={{ opacity: upperDim }}>
        {/* Title */}
        <div
          style={{
            fontFamily: tokens.fonts.heading,
            fontSize: 44,
            fontWeight: tokens.fontWeights.bold,
            color: tokens.colors.text,
            opacity: titleOpacity,
            marginBottom: 50,
          }}
        >
          The zoning trap
        </div>

        {/* 75% — big number */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 24, opacity: act1Dim }}>
          <div
            style={{
              fontFamily: tokens.fonts.heading,
              fontSize: 160,
              fontWeight: tokens.fontWeights.black,
              color: tokens.colors.text,
              lineHeight: 1,
            }}
          >
            {displayPercent}%
          </div>
          <div style={{ maxWidth: 500 }}>
            <div
              style={{
                fontFamily: tokens.fonts.body,
                fontSize: 26,
                color: tokens.colors.textMuted,
                opacity: subtitleOpacity,
              }}
            >
              of SF residential land
            </div>
            <div
              style={{
                fontFamily: tokens.fonts.body,
                fontSize: 26,
                color: tokens.colors.text,
                fontWeight: tokens.fontWeights.semibold,
                opacity: zonedOpacity,
                transform: `translateY(${zonedSlide}px)`,
                marginTop: 4,
              }}
            >
              zoned single-family only
            </div>
          </div>
        </div>

        {/* 40ft height limit */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 16,
            marginTop: 40,
            opacity: heightOpacity * act1Dim,
          }}
        >
          <div
            style={{
              fontFamily: tokens.fonts.heading,
              fontSize: 72,
              fontWeight: tokens.fontWeights.black,
              color: tokens.colors.accent,
            }}
          >
            40 ft
          </div>
          <div
            style={{
              fontFamily: tokens.fonts.body,
              fontSize: 22,
              color: tokens.colors.textMuted,
            }}
          >
            height limit on most of the city
          </div>
        </div>

        {/* "LITERALLY ILLEGAL" emphasis — pops in over everything */}
        {frame >= T.literallyIllegal && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: `translate(-50%, -50%) scale(${Math.min(illegalScale, 1)})`,
              fontFamily: tokens.fonts.heading,
              fontSize: 64,
              fontWeight: tokens.fontWeights.black,
              color: tokens.colors.accent,
              opacity: illegalOpacity,
              textAlign: "center",
              lineHeight: 1.3,
            }}
          >
            Literally illegal
            <div
              style={{
                fontFamily: tokens.fonts.body,
                fontSize: 24,
                color: tokens.colors.textMuted,
                fontWeight: tokens.fontWeights.regular,
                marginTop: 8,
              }}
            >
              to build an apartment building
            </div>
          </div>
        )}
      </div>

      {/* ═══ Act 3: Permit timeline comparison ═══ */}
      {showComparison && (
        <div
          style={{
            position: "absolute",
            top: tokens.layout.padding,
            left: tokens.layout.padding,
            right: tokens.layout.padding,
            bottom: tokens.layout.padding,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            opacity: comparisonOpacity,
          }}
        >
          <div
            style={{
              fontFamily: tokens.fonts.heading,
              fontSize: 40,
              fontWeight: tokens.fontWeights.bold,
              color: tokens.colors.text,
              marginBottom: 50,
            }}
          >
            Time to approve a multi-family building
          </div>

          {/* SF bar */}
          <div style={{ marginBottom: 40 }}>
            <div
              style={{
                fontFamily: tokens.fonts.body,
                fontSize: 16,
                fontWeight: tokens.fontWeights.semibold,
                color: tokens.colors.textMuted,
                textTransform: "uppercase",
                letterSpacing: 2,
                marginBottom: 8,
              }}
            >
              San Francisco
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div
                style={{
                  width: BAR_MAX_WIDTH * sfBarProgress,
                  height: 44,
                  backgroundColor: tokens.colors.accent,
                }}
              />
              {sfBarProgress > 0.8 && (
                <div
                  style={{
                    fontFamily: tokens.fonts.heading,
                    fontSize: 48,
                    fontWeight: tokens.fontWeights.black,
                    color: tokens.colors.text,
                  }}
                >
                  630 days
                </div>
              )}
            </div>
          </div>

          {/* Tokyo bar */}
          <div>
            <div
              style={{
                fontFamily: tokens.fonts.body,
                fontSize: 16,
                fontWeight: tokens.fontWeights.semibold,
                color: tokens.colors.textMuted,
                textTransform: "uppercase",
                letterSpacing: 2,
                marginBottom: 8,
              }}
            >
              Tokyo
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div
                style={{
                  width: BAR_MAX_WIDTH * (180 / 630) * tokyoBarProgress,
                  height: 44,
                  backgroundColor: "#5b7e96",
                }}
              />
              {tokyoBarProgress > 0.8 && (
                <div
                  style={{
                    fontFamily: tokens.fonts.heading,
                    fontSize: 48,
                    fontWeight: tokens.fontWeights.black,
                    color: tokens.colors.text,
                  }}
                >
                  ~6 months
                </div>
              )}
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
        Source: SF Planning, Wikipedia
      </div>
    </div>
  );
};
