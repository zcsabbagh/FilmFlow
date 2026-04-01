import {
  useCurrentFrame,
  interpolate,
  Easing,
  Audio,
  Video,
  staticFile,
  Sequence,
} from "remotion";
import { tokens } from "../tokens";

/**
 * Scene 06 — Closing: "SF didn't just fail to build housing. It made building housing illegal."
 * Then cuts to YouTube interview clip: "We can't afford to live here."
 *
 * Voice timing from scene06-close.timing.json:
 *   0: "San Francisco didn't just fail to build housing."
 *  89: "It made building housing illegal."
 * 161: "And forty-seven years later, it still hasn't undone that vote."
 */

const T = {
  line1: 0,        // "San Francisco didn't just fail to build housing."
  line2: 89,       // "It made building housing illegal."
  line3: 161,      // "And forty-seven years later..."
  voEnd: 292,      // Voiceover ends
};

// Interview clip is ~20 seconds (600 frames)
const CLIP_DURATION = 600;

export const Scene: React.FC = () => {
  const frame = useCurrentFrame();

  const line1Opacity = interpolate(frame, [T.line1 + 10, T.line1 + 30], [0, 1], {
    extrapolateRight: "clamp",
  });

  const line2Opacity = interpolate(frame, [T.line2, T.line2 + 20], [0, 1], {
    extrapolateRight: "clamp",
  });
  const line2Slide = interpolate(frame, [T.line2, T.line2 + 20], [15, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const line3Opacity = interpolate(frame, [T.line3, T.line3 + 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Text card fades out before clip
  const textFadeOut = frame >= T.voEnd
    ? interpolate(frame, [T.voEnd, T.voEnd + 15], [1, 0], { extrapolateRight: "clamp" })
    : 1;

  // Clip fades in
  const clipOpacity = frame >= T.voEnd
    ? interpolate(frame, [T.voEnd + 10, T.voEnd + 25], [0, 1], { extrapolateRight: "clamp" })
    : 0;

  return (
    <div
      style={{
        width: tokens.layout.width,
        height: tokens.layout.height,
        backgroundColor: tokens.colors.background,
        position: "relative",
      }}
    >
      {/* Voiceover for the text portion */}
      <Sequence from={0} durationInFrames={T.voEnd + 30}>
        <Audio src={staticFile("audio/scene06-close.mp3")} />
      </Sequence>

      {/* ═══ Text card ═══ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: tokens.layout.padding,
          opacity: textFadeOut,
        }}
      >
        <div
          style={{
            fontFamily: tokens.fonts.heading,
            fontSize: 52,
            fontWeight: tokens.fontWeights.bold,
            color: tokens.colors.text,
            textAlign: "center",
            lineHeight: 1.4,
            opacity: line1Opacity,
            maxWidth: 1000,
          }}
        >
          San Francisco didn&apos;t just fail to build housing.
        </div>

        <div
          style={{
            fontFamily: tokens.fonts.heading,
            fontSize: 52,
            fontWeight: tokens.fontWeights.bold,
            color: tokens.colors.accent,
            textAlign: "center",
            lineHeight: 1.4,
            marginTop: 24,
            opacity: line2Opacity,
            maxWidth: 1000,
            transform: `translateY(${line2Slide}px)`,
          }}
        >
          It made building housing illegal.
        </div>

        <div
          style={{
            fontFamily: tokens.fonts.body,
            fontSize: 30,
            color: tokens.colors.textMuted,
            textAlign: "center",
            marginTop: 40,
            opacity: line3Opacity,
            maxWidth: 800,
          }}
        >
          And forty-seven years later, it still hasn&apos;t undone that vote.
        </div>
      </div>

      {/* ═══ YouTube interview clip ═══ */}
      {frame >= T.voEnd && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: clipOpacity,
          }}
        >
          <Video
            src={staticFile("clips/interview-clip.mp4")}
            startFrom={0}
            style={{
              width: tokens.layout.width,
              height: tokens.layout.height,
              objectFit: "cover",
            }}
          />
          {/* Lower third caption */}
          <div
            style={{
              position: "absolute",
              bottom: 80,
              left: 80,
              right: 80,
              backgroundColor: "rgba(0,0,0,0.7)",
              padding: "16px 24px",
              opacity: interpolate(frame, [T.voEnd + 40, T.voEnd + 55], [0, 1], {
                extrapolateRight: "clamp",
              }),
            }}
          >
            <div
              style={{
                fontFamily: tokens.fonts.body,
                fontSize: 22,
                color: "#fff",
                fontWeight: tokens.fontWeights.semibold,
              }}
            >
              &quot;We can&apos;t afford to live here. I&apos;m born and raised here and I can&apos;t even afford to live here.&quot;
            </div>
            <div
              style={{
                fontFamily: tokens.fonts.body,
                fontSize: 14,
                color: "#aaa",
                marginTop: 4,
              }}
            >
              SF resident — Channel 5 Clips
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
