import {
  useCurrentFrame,
  interpolate,
  Img,
  staticFile,
  Easing,
} from "remotion";
import { tokens } from "../tokens";

/**
 * HeadlineHighlight — displays a screenshot of a news article headline
 * with an animated yellow marker highlight that sweeps across specified text,
 * synced to voiceover word timing.
 *
 * The highlight animation mimics a physical highlighter being drawn across
 * the text from left to right, creating the Vox-style "highlight the key phrase"
 * visual beat.
 *
 * Usage:
 *   <HeadlineHighlight
 *     imageSrc={staticFile("images/nyt-headline.png")}
 *     highlightStart={120}   // frame when narrator says the highlighted phrase
 *     highlightDuration={30} // frames for the marker sweep animation
 *     // Position of the highlight rectangle relative to the image
 *     highlightX={15}        // % from left
 *     highlightY={35}        // % from top
 *     highlightWidth={70}    // % width
 *     highlightHeight={8}    // % height
 *   />
 */

type Props = {
  /** Path to the headline screenshot image */
  imageSrc: string;
  /** Frame when the highlight animation starts */
  highlightStart: number;
  /** Duration of the highlight sweep in frames (default 25) */
  highlightDuration?: number;
  /** Highlight rectangle position as percentages of the image */
  highlightX?: number;
  highlightY?: number;
  highlightWidth?: number;
  highlightHeight?: number;
  /** Optional title above the screenshot */
  title?: string;
  /** Optional source attribution */
  source?: string;
  /** Highlight color (default: Vox yellow #ffe135) */
  highlightColor?: string;
  /** Whether to zoom in on the headline (Ken Burns style) */
  zoomIn?: boolean;
};

export const HeadlineHighlight: React.FC<Props> = ({
  imageSrc,
  highlightStart,
  highlightDuration = 25,
  highlightX = 10,
  highlightY = 40,
  highlightWidth = 60,
  highlightHeight = 6,
  title,
  source,
  highlightColor = "#ffe135",
  zoomIn = true,
}) => {
  const frame = useCurrentFrame();

  // Image fade in
  const imageOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Subtle zoom
  const scale = zoomIn
    ? interpolate(frame, [0, 300], [1, 1.06], { extrapolateRight: "clamp" })
    : 1;

  // Highlight sweep: a yellow rectangle that grows from left to right
  const highlightProgress = interpolate(
    frame,
    [highlightStart, highlightStart + highlightDuration],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  // Highlight opacity — fades in slightly before the sweep
  const highlightOpacity = interpolate(
    frame,
    [highlightStart - 5, highlightStart],
    [0, 0.45],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Title
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Source
  const sourceOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: tokens.layout.width,
        height: tokens.layout.height,
        backgroundColor: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Optional title above */}
      {title && (
        <div
          style={{
            position: "absolute",
            top: 40,
            left: tokens.layout.padding,
            fontFamily: tokens.fonts.body,
            fontSize: 18,
            fontWeight: tokens.fontWeights.semibold,
            color: tokens.colors.textMuted,
            textTransform: "uppercase",
            letterSpacing: 2,
            opacity: titleOpacity,
          }}
        >
          {title}
        </div>
      )}

      {/* Screenshot image container */}
      <div
        style={{
          position: "relative",
          maxWidth: "85%",
          maxHeight: "75%",
          opacity: imageOpacity,
          transform: `scale(${scale})`,
        }}
      >
        {/* The headline screenshot */}
        <Img
          src={imageSrc}
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            boxShadow: "0 4px 30px rgba(0,0,0,0.08)",
          }}
        />

        {/* Animated yellow highlight overlay */}
        {highlightProgress > 0 && (
          <div
            style={{
              position: "absolute",
              top: `${highlightY}%`,
              left: `${highlightX}%`,
              width: `${highlightWidth * highlightProgress}%`,
              height: `${highlightHeight}%`,
              backgroundColor: highlightColor,
              opacity: highlightOpacity,
              pointerEvents: "none",
              // Slightly rough edges like a real highlighter
              borderRadius: "2px",
              transform: "rotate(-0.3deg)",
            }}
          />
        )}
      </div>

      {/* Source attribution */}
      {source && (
        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: tokens.layout.padding,
            fontFamily: tokens.fonts.body,
            fontSize: 14,
            color: tokens.colors.textLight,
            opacity: sourceOpacity,
          }}
        >
          {source}
        </div>
      )}
    </div>
  );
};
