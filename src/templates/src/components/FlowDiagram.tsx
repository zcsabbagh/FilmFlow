import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { tokens } from "../tokens";

type Step = {
  label: string;
  description?: string;
  icon?: string;
};

type Props = {
  steps: Step[];
  title?: string;
  source?: string;
  direction?: "horizontal" | "vertical";
};

/**
 * Animated flowchart — boxes appear one by one with arrows drawing
 * between them, creating a clear process/sequence visualization.
 */
export const FlowDiagram: React.FC<Props> = ({
  steps,
  title,
  source,
  direction = "horizontal",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const isHorizontal = direction === "horizontal";

  const stagger = 20; // frames between each step

  // Title
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const titleSlideY = interpolate(frame, [0, 15], [20, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Source
  const sourceDelay = 15 + steps.length * stagger + 30;
  const sourceOpacity = interpolate(
    frame,
    [sourceDelay, sourceDelay + 15],
    [0, 1],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  // Layout sizing
  const boxWidth = isHorizontal
    ? Math.min(280, (tokens.layout.width - tokens.layout.padding * 2 - (steps.length - 1) * 80) / steps.length)
    : tokens.layout.width - tokens.layout.padding * 2 - 200;
  const boxHeight = isHorizontal ? 160 : 90;
  const arrowLength = isHorizontal ? 60 : 40;

  return (
    <div
      style={{
        width: tokens.layout.width,
        height: tokens.layout.height,
        backgroundColor: tokens.colors.background,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        fontFamily: tokens.fonts.body,
      }}
    >
      {/* Title */}
      {title && (
        <div
          style={{
            position: "absolute",
            top: 70,
            left: tokens.layout.padding,
            right: tokens.layout.padding,
            fontFamily: tokens.fonts.heading,
            fontSize: 42,
            fontWeight: tokens.fontWeights.bold,
            color: tokens.colors.text,
            opacity: titleOpacity,
            transform: `translateY(${titleSlideY}px)`,
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>
      )}

      {/* Flow container */}
      <div
        style={{
          display: "flex",
          flexDirection: isHorizontal ? "row" : "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
          marginTop: title ? 40 : 0,
        }}
      >
        {steps.map((step, i) => {
          const boxDelay = 10 + i * stagger;
          const boxProgress = spring({
            frame: frame - boxDelay,
            fps,
            config: { damping: 18, stiffness: 80 },
          });

          // Arrow appears between boxes
          const arrowDelay = boxDelay + 10;
          const arrowProgress = spring({
            frame: frame - arrowDelay,
            fps,
            config: { damping: 20, stiffness: 90 },
          });

          const boxOpacity = interpolate(boxProgress, [0, 0.3], [0, 1], {
            extrapolateRight: "clamp",
          });
          const boxScale = interpolate(boxProgress, [0, 1], [0.85, 1]);

          return (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: isHorizontal ? "row" : "column",
                alignItems: "center",
              }}
            >
              {/* Box */}
              <div
                style={{
                  width: boxWidth,
                  minHeight: boxHeight,
                  backgroundColor: "#ffffff",
                  borderRadius: 12,
                  boxShadow: "0 2px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: isHorizontal ? "24px 20px" : "16px 28px",
                  opacity: boxOpacity,
                  transform: `scale(${boxScale})`,
                  border: `1px solid rgba(0,0,0,0.05)`,
                  position: "relative",
                }}
              >
                {/* Step number badge */}
                <div
                  style={{
                    position: "absolute",
                    top: -14,
                    left: isHorizontal ? "50%" : 24,
                    transform: isHorizontal ? "translateX(-50%)" : "none",
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: tokens.colors.accent,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: tokens.fonts.body,
                    fontSize: 13,
                    fontWeight: tokens.fontWeights.bold,
                    color: "#ffffff",
                  }}
                >
                  {i + 1}
                </div>

                {/* Icon */}
                {step.icon && (
                  <div
                    style={{
                      fontSize: 28,
                      marginBottom: 8,
                    }}
                  >
                    {step.icon}
                  </div>
                )}

                {/* Label */}
                <div
                  style={{
                    fontFamily: tokens.fonts.heading,
                    fontSize: isHorizontal ? 20 : 22,
                    fontWeight: tokens.fontWeights.bold,
                    color: tokens.colors.primary,
                    textAlign: "center" as const,
                    lineHeight: 1.3,
                  }}
                >
                  {step.label}
                </div>

                {/* Description */}
                {step.description && (
                  <div
                    style={{
                      fontFamily: tokens.fonts.body,
                      fontSize: isHorizontal ? 14 : 16,
                      fontWeight: tokens.fontWeights.regular,
                      color: tokens.colors.textMuted,
                      textAlign: "center" as const,
                      marginTop: 8,
                      lineHeight: 1.4,
                      maxWidth: boxWidth - 40,
                    }}
                  >
                    {step.description}
                  </div>
                )}
              </div>

              {/* Arrow between boxes (not after last) */}
              {i < steps.length - 1 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: isHorizontal ? arrowLength : "auto",
                    height: isHorizontal ? "auto" : arrowLength,
                    flexDirection: isHorizontal ? "row" : "column",
                    position: "relative",
                  }}
                >
                  {/* Arrow shaft */}
                  <div
                    style={{
                      width: isHorizontal
                        ? arrowLength * 0.7 * arrowProgress
                        : 2,
                      height: isHorizontal
                        ? 2
                        : arrowLength * 0.7 * arrowProgress,
                      backgroundColor: tokens.colors.accent,
                      opacity: arrowProgress * 0.6,
                    }}
                  />
                  {/* Arrow head */}
                  <div
                    style={{
                      width: 0,
                      height: 0,
                      opacity: arrowProgress,
                      ...(isHorizontal
                        ? {
                            borderTop: "6px solid transparent",
                            borderBottom: "6px solid transparent",
                            borderLeft: `10px solid ${tokens.colors.accent}`,
                          }
                        : {
                            borderLeft: "6px solid transparent",
                            borderRight: "6px solid transparent",
                            borderTop: `10px solid ${tokens.colors.accent}`,
                          }),
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
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
