import { useCurrentFrame, interpolate, Img, staticFile, Easing } from "remotion";
import { tokens } from "../tokens";

type Props = {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  title?: string;
  revealStart?: number;
  revealDuration?: number;
};

export const PhotoReveal: React.FC<Props> = ({
  beforeImage,
  afterImage,
  beforeLabel,
  afterLabel,
  title,
  revealStart = 30,
  revealDuration = 40,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = tokens.layout;

  // Wipe progress: 0 = full before, 1 = full after
  const wipeProgress = interpolate(
    frame,
    [revealStart, revealStart + revealDuration],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.cubic),
    }
  );

  // The divider X position in pixels
  const dividerX = wipeProgress * width;

  // Title animation
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleSlide = interpolate(frame, [0, 15], [20, 0], {
    extrapolateRight: "clamp",
  });

  // Labels appear after wipe completes
  const wipeEnd = revealStart + revealDuration;
  const labelOpacity = interpolate(frame, [wipeEnd + 5, wipeEnd + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Divider visibility — visible during wipe, fades after
  const dividerOpacity = interpolate(
    frame,
    [revealStart, revealStart + 5, wipeEnd - 5, wipeEnd + 15],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const imgStyle: React.CSSProperties = {
    width,
    height,
    objectFit: "cover",
    display: "block",
  };

  return (
    <div
      style={{
        width,
        height,
        backgroundColor: tokens.colors.background,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Before image — full frame, underneath */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width,
          height,
        }}
      >
        <Img src={staticFile(beforeImage)} style={imgStyle} />
      </div>

      {/* After image — clipped from the left based on wipe progress */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width,
          height,
          clipPath: `inset(0 0 0 ${dividerX}px)`,
        }}
      >
        <Img src={staticFile(afterImage)} style={imgStyle} />
      </div>

      {/* Divider line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: dividerX - 1,
          width: 3,
          height,
          backgroundColor: "white",
          opacity: dividerOpacity,
          boxShadow: "0 0 12px rgba(0,0,0,0.5)",
        }}
      />

      {/* Divider handle — small circle on the line */}
      <div
        style={{
          position: "absolute",
          top: height / 2 - 24,
          left: dividerX - 24,
          width: 48,
          height: 48,
          borderRadius: "50%",
          backgroundColor: "white",
          boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
          opacity: dividerOpacity,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Arrow indicators */}
        <svg width="24" height="24" viewBox="0 0 24 24" opacity={dividerOpacity}>
          <path d="M8 12l4-4v8z" fill={tokens.colors.text} />
          <path d="M16 12l-4-4v8z" fill={tokens.colors.text} />
        </svg>
      </div>

      {/* Title overlay — top left with semi-transparent backdrop */}
      {title && (
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 40,
            padding: "12px 24px",
            backgroundColor: "rgba(0,0,0,0.55)",
            borderRadius: 4,
            fontSize: 42,
            fontWeight: tokens.fontWeights.bold,
            fontFamily: tokens.fonts.heading,
            color: "white",
            opacity: titleOpacity,
            transform: `translateY(${titleSlide}px)`,
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>
      )}

      {/* Before label — bottom left */}
      {beforeLabel && (
        <div
          style={{
            position: "absolute",
            bottom: 50,
            left: 60,
            padding: "8px 20px",
            backgroundColor: "rgba(0,0,0,0.6)",
            borderRadius: 4,
            fontSize: 24,
            fontWeight: tokens.fontWeights.semibold,
            fontFamily: tokens.fonts.body,
            color: "white",
            opacity: labelOpacity,
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          {beforeLabel}
        </div>
      )}

      {/* After label — bottom right */}
      {afterLabel && (
        <div
          style={{
            position: "absolute",
            bottom: 50,
            right: 60,
            padding: "8px 20px",
            backgroundColor: "rgba(0,0,0,0.6)",
            borderRadius: 4,
            fontSize: 24,
            fontWeight: tokens.fontWeights.semibold,
            fontFamily: tokens.fonts.body,
            color: "white",
            opacity: labelOpacity,
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          {afterLabel}
        </div>
      )}
    </div>
  );
};
