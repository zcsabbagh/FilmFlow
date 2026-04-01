import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { tokens } from "../tokens";

type Props = {
  quote: string;
  attribution: string;
  role?: string;
  title?: string;
  source?: string;
  accentColor?: string;
};

export const QuoteCard: React.FC<Props> = ({
  quote,
  attribution,
  role,
  title,
  source,
  accentColor = tokens.colors.accent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Beat 1: Quotation mark fades in (frames 0-20)
  const quoteMarkOpacity = interpolate(frame, [0, 20], [0, 0.15], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const quoteMarkScale = interpolate(
    spring({ frame, fps, config: { damping: 20, stiffness: 40 } }),
    [0, 1],
    [0.8, 1]
  );

  // Beat 2: Quote text fades in word by word
  const words = quote.split(" ");
  const wordStartFrame = 15;
  const framesPerWord = 2;

  // Beat 3: Accent line draws (after most words visible)
  const lineDelay = wordStartFrame + words.length * framesPerWord + 5;
  const lineProgress = spring({
    frame: frame - lineDelay,
    fps,
    config: { damping: 25, stiffness: 60 },
  });

  // Beat 4: Attribution slides up
  const attrDelay = lineDelay + 10;
  const attrProgress = spring({
    frame: frame - attrDelay,
    fps,
    config: { damping: 18, stiffness: 50 },
  });
  const attrOpacity = interpolate(attrProgress, [0, 1], [0, 1]);
  const attrSlide = interpolate(attrProgress, [0, 1], [25, 0]);

  // Title animation
  const titleOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Source
  const sourceOpacity = interpolate(
    frame,
    [attrDelay + 10, attrDelay + 25],
    [0, 1],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  return (
    <div
      style={{
        width: tokens.layout.width,
        height: tokens.layout.height,
        backgroundColor: tokens.colors.background,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        fontFamily: tokens.fonts.body,
      }}
    >
      {/* Left accent stripe */}
      <div
        style={{
          position: "absolute",
          left: tokens.layout.padding - 20,
          top: "15%",
          bottom: "15%",
          width: 4,
          backgroundColor: accentColor,
          opacity: interpolate(frame, [5, 20], [0, 0.6], {
            extrapolateRight: "clamp",
            extrapolateLeft: "clamp",
          }),
        }}
      />

      {/* Title */}
      {title && (
        <div
          style={{
            position: "absolute",
            top: 80,
            left: tokens.layout.padding + 20,
            fontFamily: tokens.fonts.body,
            fontSize: 16,
            fontWeight: tokens.fontWeights.semibold,
            color: tokens.colors.textMuted,
            textTransform: "uppercase" as const,
            letterSpacing: 3,
            opacity: titleOpacity,
          }}
        >
          {title}
        </div>
      )}

      {/* Quote content area */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          maxWidth: 1200,
          paddingLeft: tokens.layout.padding + 20,
          paddingRight: tokens.layout.padding,
          position: "relative",
        }}
      >
        {/* Big decorative quotation mark */}
        <div
          style={{
            position: "absolute",
            top: -100,
            left: tokens.layout.padding - 30,
            fontFamily: tokens.fonts.heading,
            fontSize: 280,
            fontWeight: tokens.fontWeights.black,
            color: accentColor,
            opacity: quoteMarkOpacity,
            transform: `scale(${quoteMarkScale})`,
            lineHeight: 1,
            userSelect: "none" as const,
          }}
        >
          {"\u201C"}
        </div>

        {/* Quote text — word by word fade */}
        <div
          style={{
            fontFamily: tokens.fonts.heading,
            fontSize: 38,
            fontWeight: tokens.fontWeights.bold,
            color: tokens.colors.text,
            lineHeight: 1.6,
            display: "flex",
            flexWrap: "wrap",
            gap: "0 10px",
          }}
        >
          {words.map((word, i) => {
            const wordFrame = wordStartFrame + i * framesPerWord;
            const wordOpacity = interpolate(
              frame,
              [wordFrame, wordFrame + 8],
              [0, 1],
              { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
            );
            const wordSlide = interpolate(
              frame,
              [wordFrame, wordFrame + 8],
              [6, 0],
              { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
            );
            return (
              <span
                key={i}
                style={{
                  opacity: wordOpacity,
                  transform: `translateY(${wordSlide}px)`,
                  display: "inline-block",
                }}
              >
                {word}
              </span>
            );
          })}
        </div>

        {/* Thin horizontal accent line */}
        <div
          style={{
            width: 120 * lineProgress,
            height: 2,
            backgroundColor: accentColor,
            marginTop: 36,
            marginBottom: 28,
            opacity: lineProgress * 0.7,
          }}
        />

        {/* Attribution */}
        <div
          style={{
            opacity: attrOpacity,
            transform: `translateY(${attrSlide}px)`,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <div
            style={{
              fontFamily: tokens.fonts.body,
              fontSize: 22,
              fontWeight: tokens.fontWeights.semibold,
              color: tokens.colors.text,
            }}
          >
            {attribution}
          </div>
          {role && (
            <div
              style={{
                fontFamily: tokens.fonts.body,
                fontSize: 18,
                fontWeight: tokens.fontWeights.regular,
                color: tokens.colors.textMuted,
              }}
            >
              {role}
            </div>
          )}
        </div>
      </div>

      {/* Source */}
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
          Source: {source}
        </div>
      )}
    </div>
  );
};
