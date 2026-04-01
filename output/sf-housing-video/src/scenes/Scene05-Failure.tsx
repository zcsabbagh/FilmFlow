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
 * Scene 05 — "California told SF to build 82,000 units..."
 * Uses an animated progress bar + dramatic counter
 */

const T = {
  californiaTold: 0,
  eightyTwo: 61,           // "eighty-two thousand units"
  thirteenK: 155,          // "about thirteen thousand a year"
  inTwentyFour: 219,       // "In twenty twenty-four"
  justOneThousand: 295,    // "just one thousand and seventy-four"
  ninePercent: 370,        // "nine percent of the way there"
  stateSteppedIn: 426,     // "The state had to step in"
};

export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  // ── Act 1: Progress bar to 82,000 ──
  // "82,000" target number counts up
  const targetProgress = spring({
    frame: frame - T.eightyTwo,
    fps,
    config: { damping: 30, stiffness: 40 },
  });

  // "13,000/yr" annotation
  const yearlyOpacity = interpolate(frame, [T.thirteenK, T.thirteenK + 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  // ── Act 2: The devastating "1,074" counter ──
  const show1074 = frame >= T.inTwentyFour;
  const counter1074 = spring({
    frame: frame - T.justOneThousand,
    fps,
    config: { damping: 20, stiffness: 40 },
  });

  // Progress bar fills to just 9%
  const barFillProgress = frame >= T.ninePercent
    ? interpolate(frame, [T.ninePercent, T.ninePercent + 30], [0, 0.09], {
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.cubic),
      })
    : 0;

  // "9%" label spring
  const ninePercentSpring = spring({
    frame: frame - T.ninePercent - 15,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  // ── Act 3: "State had to step in" ──
  const overrideOpacity = interpolate(frame, [T.stateSteppedIn, T.stateSteppedIn + 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  const BAR_WIDTH = 1400;

  return (
    <div
      style={{
        width: tokens.layout.width,
        height: tokens.layout.height,
        backgroundColor: tokens.colors.background,
        padding: tokens.layout.padding,
        position: "relative",
      }}
    >
      <Audio src={staticFile("audio/scene05-failure.mp3")} />

      {/* Title */}
      <div
        style={{
          fontFamily: tokens.fonts.heading,
          fontSize: 40,
          fontWeight: tokens.fontWeights.bold,
          color: tokens.colors.text,
          opacity: titleOpacity,
        }}
      >
        Progress toward 82,000 units by 2031
      </div>

      {/* Target number */}
      <div
        style={{
          fontFamily: tokens.fonts.heading,
          fontSize: 80,
          fontWeight: tokens.fontWeights.black,
          color: tokens.colors.text,
          marginTop: 50,
          lineHeight: 1,
        }}
      >
        {Math.round(82000 * targetProgress).toLocaleString()}
        <span
          style={{
            fontFamily: tokens.fonts.body,
            fontSize: 24,
            color: tokens.colors.textMuted,
            fontWeight: tokens.fontWeights.regular,
            marginLeft: 16,
          }}
        >
          units needed
        </span>
      </div>

      {/* "~13,000 per year" annotation */}
      <div
        style={{
          fontFamily: tokens.fonts.body,
          fontSize: 20,
          color: tokens.colors.textMuted,
          marginTop: 8,
          opacity: yearlyOpacity,
        }}
      >
        That&apos;s about 13,000 per year
      </div>

      {/* Progress bar */}
      <div
        style={{
          marginTop: 50,
          width: BAR_WIDTH,
          height: 48,
          backgroundColor: tokens.colors.backgroundAlt,
          position: "relative",
        }}
      >
        {/* Tiny filled portion */}
        <div
          style={{
            width: BAR_WIDTH * barFillProgress,
            height: 48,
            backgroundColor: tokens.colors.accent,
          }}
        />

        {/* 9% label */}
        {ninePercentSpring > 0.1 && (
          <div
            style={{
              position: "absolute",
              left: BAR_WIDTH * barFillProgress + 12,
              top: 6,
              fontFamily: tokens.fonts.heading,
              fontSize: 32,
              fontWeight: tokens.fontWeights.black,
              color: tokens.colors.text,
              opacity: ninePercentSpring,
              transform: `scale(${Math.min(ninePercentSpring, 1)})`,
            }}
          >
            9%
          </div>
        )}
      </div>

      {/* "1,074 units in 2024" — the devastating number */}
      {show1074 && (
        <div style={{ marginTop: 60 }}>
          <div
            style={{
              fontFamily: tokens.fonts.heading,
              fontSize: 110,
              fontWeight: tokens.fontWeights.black,
              color: tokens.colors.accent,
              lineHeight: 1,
            }}
          >
            {Math.round(1074 * counter1074).toLocaleString()}
          </div>
          <div
            style={{
              fontFamily: tokens.fonts.body,
              fontSize: 24,
              color: tokens.colors.textMuted,
              marginTop: 8,
            }}
          >
            units greenlit in 2024 — worst year since 2009
          </div>
        </div>
      )}

      {/* "State had to step in" */}
      <div
        style={{
          position: "absolute",
          bottom: 160,
          left: tokens.layout.padding,
          fontFamily: tokens.fonts.body,
          fontSize: 28,
          fontWeight: tokens.fontWeights.semibold,
          color: tokens.colors.accent,
          opacity: overrideOpacity,
        }}
      >
        The state had to override SF&apos;s own permitting process
      </div>

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
        Source: SF Standard, California HCD
      </div>
    </div>
  );
};
