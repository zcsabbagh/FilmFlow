import { useCurrentFrame, interpolate, useVideoConfig } from "remotion";
import { tokens } from "../tokens";

type Props = {
  value: number;
  label: string;
  title?: string;
  source?: string;
  prefix?: string;
  suffix?: string;
  digitDelay?: number;
};

/**
 * Slot-machine style number ticker — digits roll into place one by one,
 * left to right, creating an arrivals-board reveal effect.
 */
export const NumberTicker: React.FC<Props> = ({
  value,
  label,
  title,
  source,
  prefix = "",
  suffix = "",
  digitDelay = 8,
}) => {
  const frame = useCurrentFrame();
  const { fps: _fps } = useVideoConfig();

  const valueStr = Math.round(Math.abs(value)).toLocaleString();
  const digits = valueStr.split("");
  const totalDigits = digits.filter((d) => d !== ",").length;

  // Each digit settles after its stagger; cycling speed slows before locking
  const cycleSpeed = 2; // frames per digit change while spinning

  // Title animation
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const titleSlide = interpolate(frame, [0, 15], [20, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Label appears after all digits settle
  const allSettledFrame = 20 + totalDigits * digitDelay + 15;
  const labelOpacity = interpolate(
    frame,
    [allSettledFrame, allSettledFrame + 15],
    [0, 1],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );
  const labelSlide = interpolate(
    frame,
    [allSettledFrame, allSettledFrame + 15],
    [12, 0],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  // Source
  const sourceDelay = allSettledFrame + 25;
  const sourceOpacity = interpolate(
    frame,
    [sourceDelay, sourceDelay + 15],
    [0, 1],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  // Resolve displayed character for each position
  let digitIndex = 0;
  const resolvedDigits = digits.map((char) => {
    if (char === "," || char === ".") {
      return { char, settled: true };
    }

    const settleFrame = 20 + digitIndex * digitDelay;
    const localFrame = frame - settleFrame;
    digitIndex++;

    if (localFrame >= 15) {
      // Fully settled
      return { char, settled: true };
    }
    if (localFrame < 0) {
      // Not started — show spinning digit
      const cyclingDigit = Math.floor(frame / cycleSpeed) % 10;
      return { char: String(cyclingDigit), settled: false };
    }
    // Settling phase — slow down cycling, then lock
    const slowdown = Math.max(1, Math.floor(localFrame / 3));
    if (localFrame >= 15 - slowdown * 2) {
      return { char, settled: true };
    }
    const cyclingDigit =
      Math.floor((frame - settleFrame) / (cycleSpeed + slowdown)) % 10;
    return { char: String(cyclingDigit), settled: false };
  });

  // Overall container fade-in
  const containerOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

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
        opacity: containerOpacity,
      }}
    >
      {/* Title */}
      {title && (
        <div
          style={{
            position: "absolute",
            top: 80,
            left: tokens.layout.padding,
            fontFamily: tokens.fonts.heading,
            fontSize: 42,
            fontWeight: tokens.fontWeights.bold,
            color: tokens.colors.text,
            opacity: titleOpacity,
            transform: `translateY(${titleSlide}px)`,
            maxWidth: 900,
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>
      )}

      {/* Digit strip */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}
      >
        {/* Prefix */}
        {prefix && (
          <div
            style={{
              fontFamily: tokens.fonts.heading,
              fontSize: 100,
              fontWeight: tokens.fontWeights.bold,
              color: tokens.colors.textMuted,
              lineHeight: 1,
              marginRight: 4,
            }}
          >
            {prefix}
          </div>
        )}

        {/* Negative sign */}
        {value < 0 && (
          <div
            style={{
              fontFamily: tokens.fonts.heading,
              fontSize: 140,
              fontWeight: tokens.fontWeights.black,
              color: tokens.colors.primary,
              lineHeight: 1,
            }}
          >
            -
          </div>
        )}

        {/* Digit slots */}
        {resolvedDigits.map((d, i) => {
          const isSeparator = d.char === "," || d.char === ".";
          if (isSeparator) {
            return (
              <div
                key={i}
                style={{
                  fontFamily: tokens.fonts.heading,
                  fontSize: 140,
                  fontWeight: tokens.fontWeights.black,
                  color: tokens.colors.primary,
                  lineHeight: 1,
                  width: 30,
                  textAlign: "center" as const,
                }}
              >
                {d.char}
              </div>
            );
          }

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 100,
                height: 150,
                backgroundColor: d.settled
                  ? tokens.colors.backgroundAlt
                  : tokens.colors.backgroundAlt,
                borderRadius: 8,
                border: `1px solid ${
                  d.settled
                    ? "rgba(0,0,0,0.06)"
                    : "rgba(0,0,0,0.03)"
                }`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Subtle horizontal split line (arrivals-board feel) */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: 0,
                  right: 0,
                  height: 1,
                  backgroundColor: "rgba(0,0,0,0.04)",
                }}
              />
              <div
                style={{
                  fontFamily: tokens.fonts.heading,
                  fontSize: 140,
                  fontWeight: tokens.fontWeights.black,
                  color: d.settled
                    ? tokens.colors.primary
                    : tokens.colors.textMuted,
                  lineHeight: 1,
                  transition: d.settled ? "none" : undefined,
                }}
              >
                {d.char}
              </div>
            </div>
          );
        })}

        {/* Suffix */}
        {suffix && (
          <div
            style={{
              fontFamily: tokens.fonts.heading,
              fontSize: 100,
              fontWeight: tokens.fontWeights.bold,
              color: tokens.colors.textMuted,
              lineHeight: 1,
              marginLeft: 4,
            }}
          >
            {suffix}
          </div>
        )}
      </div>

      {/* Label */}
      <div
        style={{
          fontFamily: tokens.fonts.body,
          fontSize: 32,
          fontWeight: tokens.fontWeights.medium,
          color: tokens.colors.textMuted,
          textAlign: "center" as const,
          maxWidth: 700,
          lineHeight: 1.4,
          marginTop: 40,
          opacity: labelOpacity,
          transform: `translateY(${labelSlide}px)`,
        }}
      >
        {label}
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
