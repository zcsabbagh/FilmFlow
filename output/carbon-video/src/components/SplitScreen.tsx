import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { tokens } from "../tokens";

type PanelData = {
  title: string;
  content: string | number;
  subtitle?: string;
  color?: string;
  image?: string;
};

type Props = {
  left: PanelData;
  right: PanelData;
  dividerColor?: string;
  title?: string;
  source?: string;
};

/**
 * Two panels slide in from opposite edges and meet at center,
 * then a divider line draws between them and content fades in.
 */
export const SplitScreen: React.FC<Props> = ({
  left,
  right,
  dividerColor,
  title,
  source,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const halfWidth = tokens.layout.width / 2;
  const panelHeight = tokens.layout.height;

  // Panels slide in (frames 0-30)
  const leftSlide = spring({
    frame,
    fps,
    config: { damping: 22, stiffness: 60 },
  });
  const rightSlide = spring({
    frame,
    fps,
    config: { damping: 22, stiffness: 60 },
  });

  const leftX = interpolate(leftSlide, [0, 1], [-halfWidth, 0]);
  const rightX = interpolate(rightSlide, [0, 1], [halfWidth, 0]);

  // Divider draws (frames 25-50)
  const dividerProgress = spring({
    frame: frame - 25,
    fps,
    config: { damping: 20, stiffness: 70 },
  });
  const dividerHeight = panelHeight * 0.6 * dividerProgress;

  // Content fades in (frames 35-55)
  const contentOpacity = interpolate(frame, [35, 55], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const contentSlide = interpolate(frame, [35, 55], [20, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Title
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const titleSlide = interpolate(frame, [0, 15], [20, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Source
  const sourceDelay = 65;
  const sourceOpacity = interpolate(
    frame,
    [sourceDelay, sourceDelay + 15],
    [0, 1],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  const renderPanel = (data: PanelData, side: "left" | "right") => {
    const panelColor = data.color ?? tokens.colors.background;
    const isNumber = typeof data.content === "number";
    const isDark =
      panelColor !== tokens.colors.background &&
      panelColor !== tokens.colors.backgroundAlt;

    const textColor = isDark ? "#ffffff" : tokens.colors.primary;
    const mutedColor = isDark ? "rgba(255,255,255,0.7)" : tokens.colors.textMuted;

    return (
      <div
        style={{
          width: halfWidth,
          height: panelHeight,
          backgroundColor: panelColor,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          transform: `translateX(${side === "left" ? leftX : rightX}px)`,
        }}
      >
        {/* Optional background image */}
        {data.image && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url(${data.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.15,
            }}
          />
        )}

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 60,
            position: "relative",
            zIndex: 1,
            opacity: contentOpacity,
            transform: `translateY(${contentSlide}px)`,
          }}
        >
          {/* Panel title */}
          <div
            style={{
              fontFamily: tokens.fonts.body,
              fontSize: 20,
              fontWeight: tokens.fontWeights.semibold,
              color: mutedColor,
              textTransform: "uppercase" as const,
              letterSpacing: 3,
              marginBottom: 24,
            }}
          >
            {data.title}
          </div>

          {/* Big content — number or text */}
          <div
            style={{
              fontFamily: tokens.fonts.heading,
              fontSize: isNumber ? 120 : 48,
              fontWeight: tokens.fontWeights.black,
              color: textColor,
              lineHeight: 1,
              textAlign: "center" as const,
              maxWidth: halfWidth - 120,
            }}
          >
            {isNumber
              ? (data.content as number).toLocaleString()
              : data.content}
          </div>

          {/* Subtitle */}
          {data.subtitle && (
            <div
              style={{
                fontFamily: tokens.fonts.body,
                fontSize: 22,
                fontWeight: tokens.fontWeights.regular,
                color: mutedColor,
                marginTop: 20,
                textAlign: "center" as const,
                maxWidth: halfWidth - 160,
                lineHeight: 1.5,
              }}
            >
              {data.subtitle}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        width: tokens.layout.width,
        height: tokens.layout.height,
        backgroundColor: tokens.colors.background,
        position: "relative",
        overflow: "hidden",
        fontFamily: tokens.fonts.body,
      }}
    >
      {/* Title overlay */}
      {title && (
        <div
          style={{
            position: "absolute",
            top: 50,
            left: 0,
            right: 0,
            textAlign: "center" as const,
            fontFamily: tokens.fonts.heading,
            fontSize: 38,
            fontWeight: tokens.fontWeights.bold,
            color: tokens.colors.text,
            opacity: titleOpacity,
            transform: `translateY(${titleSlide}px)`,
            zIndex: 10,
            // Subtle background pill for readability
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(245,243,239,0.9)",
              padding: "12px 36px",
              borderRadius: 8,
            }}
          >
            {title}
          </div>
        </div>
      )}

      {/* Panels */}
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
        }}
      >
        {renderPanel(left, "left")}
        {renderPanel(right, "right")}
      </div>

      {/* Center divider */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 2,
          height: dividerHeight,
          backgroundColor: dividerColor ?? tokens.colors.accent,
          borderRadius: 1,
          zIndex: 5,
        }}
      />

      {/* Source */}
      {source && (
        <div
          style={{
            position: "absolute",
            bottom: 30,
            left: tokens.layout.padding,
            fontFamily: tokens.fonts.body,
            fontSize: 14,
            color: tokens.colors.textLight,
            opacity: sourceOpacity,
            zIndex: 10,
          }}
        >
          Source: {source}
        </div>
      )}
    </div>
  );
};
