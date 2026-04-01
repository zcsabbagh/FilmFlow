import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { tokens } from "../tokens";

type Props = {
  value: number;
  max: number;
  label: string;
  title?: string;
  source?: string;
  dangerThreshold?: number;
  color?: string;
  dangerColor?: string;
  unit?: string;
};

export const ThermometerGauge: React.FC<Props> = ({
  value,
  max,
  label,
  title,
  source,
  dangerThreshold,
  color = tokens.colors.accent,
  dangerColor = "#c0392b",
  unit = "",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fillFraction = value / max;

  // Spring-driven fill animation
  const fillProgress = spring({
    frame: frame - 10,
    fps,
    config: { damping: 22, stiffness: 30 },
  });
  const currentFill = fillFraction * fillProgress;
  const currentValue = Math.round(value * fillProgress);

  // Thermometer dimensions
  const tubeHeight = 500;
  const tubeWidth = 40;
  const bulbRadius = 35;
  const tubeRadius = tubeWidth / 2;
  const fillHeight = tubeHeight * currentFill;

  // Danger threshold position
  const dangerFraction = dangerThreshold != null ? dangerThreshold / max : null;
  const dangerY = dangerFraction != null ? tubeHeight * (1 - dangerFraction) : null;

  // Color interpolation: normal -> danger when crossing threshold
  const isDanger = dangerThreshold != null && currentValue >= dangerThreshold;
  const dangerTransition =
    dangerThreshold != null
      ? interpolate(
          currentValue,
          [dangerThreshold * 0.85, dangerThreshold],
          [0, 1],
          { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
        )
      : 0;

  // Parse hex colors to interpolate
  const fillColor = dangerTransition > 0 ? lerpColor(color, dangerColor, dangerTransition) : color;

  // Title fade in
  const titleOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Label fade in
  const labelOpacity = interpolate(frame, [30, 45], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const labelSlide = interpolate(frame, [30, 45], [15, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Value label at mercury level
  const valueLabelOpacity = interpolate(frame, [20, 35], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Source
  const sourceOpacity = interpolate(frame, [50, 65], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Scale markers (0, 25, 50, 75, 100 percent of max)
  const scaleMarkers = [0, 0.25, 0.5, 0.75, 1].map((frac) => ({
    value: Math.round(frac * max),
    y: tubeHeight * (1 - frac),
  }));

  // Thermometer center position
  const centerX = tokens.layout.width / 2;
  const topY = (tokens.layout.height - tubeHeight - bulbRadius * 2 - 60) / 2 + 60;

  return (
    <div
      style={{
        width: tokens.layout.width,
        height: tokens.layout.height,
        backgroundColor: tokens.colors.background,
        position: "relative",
        fontFamily: tokens.fonts.body,
        color: tokens.colors.text,
      }}
    >
      {/* Title */}
      {title && (
        <div
          style={{
            position: "absolute",
            top: 80,
            left: tokens.layout.padding,
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

      {/* Thermometer group */}
      <div
        style={{
          position: "absolute",
          left: centerX - tubeWidth / 2,
          top: topY,
          width: tubeWidth,
          height: tubeHeight + bulbRadius * 2,
        }}
      >
        {/* Tube background */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: tubeWidth,
            height: tubeHeight,
            borderRadius: tubeRadius,
            backgroundColor: tokens.colors.backgroundAlt,
            border: `2px solid ${tokens.colors.textLight}`,
            overflow: "hidden",
          }}
        >
          {/* Mercury fill — rises from bottom */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "100%",
              height: fillHeight,
              backgroundColor: fillColor,
              borderRadius: `0 0 ${tubeRadius}px ${tubeRadius}px`,
              transition: "background-color 0.1s",
            }}
          />
        </div>

        {/* Bulb at the bottom */}
        <div
          style={{
            position: "absolute",
            bottom: -bulbRadius + 2,
            left: tubeWidth / 2 - bulbRadius,
            width: bulbRadius * 2,
            height: bulbRadius * 2,
            borderRadius: "50%",
            backgroundColor: fillColor,
            border: `2px solid ${tokens.colors.textLight}`,
          }}
        />

        {/* Danger threshold line */}
        {dangerY != null && (
          <div
            style={{
              position: "absolute",
              top: dangerY,
              left: -30,
              width: tubeWidth + 60,
              height: 2,
              backgroundColor: dangerColor,
              opacity: interpolate(frame, [15, 25], [0, 0.6], {
                extrapolateRight: "clamp",
                extrapolateLeft: "clamp",
              }),
            }}
          />
        )}

        {/* Scale markers — left side */}
        {scaleMarkers.map((marker) => (
          <div
            key={marker.value}
            style={{
              position: "absolute",
              top: marker.y - 8,
              left: -60,
              fontSize: 14,
              fontFamily: tokens.fonts.body,
              fontWeight: tokens.fontWeights.regular,
              color: tokens.colors.textMuted,
              opacity: interpolate(frame, [5, 18], [0, 0.7], {
                extrapolateRight: "clamp",
                extrapolateLeft: "clamp",
              }),
              textAlign: "right" as const,
              width: 45,
            }}
          >
            {marker.value}
          </div>
        ))}

        {/* Tick marks */}
        {scaleMarkers.map((marker) => (
          <div
            key={`tick-${marker.value}`}
            style={{
              position: "absolute",
              top: marker.y - 1,
              left: -10,
              width: 10,
              height: 2,
              backgroundColor: tokens.colors.textMuted,
              opacity: interpolate(frame, [5, 18], [0, 0.5], {
                extrapolateRight: "clamp",
                extrapolateLeft: "clamp",
              }),
            }}
          />
        ))}

        {/* Current value label — positioned at mercury level, right side */}
        <div
          style={{
            position: "absolute",
            top: tubeHeight - fillHeight - 16,
            left: tubeWidth + 20,
            fontSize: 36,
            fontFamily: tokens.fonts.heading,
            fontWeight: tokens.fontWeights.bold,
            color: isDanger ? dangerColor : color,
            opacity: valueLabelOpacity,
            whiteSpace: "nowrap" as const,
          }}
        >
          {currentValue}
          {unit}
        </div>
      </div>

      {/* Label below thermometer */}
      <div
        style={{
          position: "absolute",
          bottom: 120,
          left: 0,
          right: 0,
          textAlign: "center" as const,
          fontSize: 28,
          fontFamily: tokens.fonts.body,
          fontWeight: tokens.fontWeights.medium,
          color: tokens.colors.textMuted,
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

/** Linearly interpolate between two hex colors */
function lerpColor(a: string, b: string, t: number): string {
  const parse = (hex: string) => {
    const h = hex.replace("#", "");
    return [
      parseInt(h.substring(0, 2), 16),
      parseInt(h.substring(2, 4), 16),
      parseInt(h.substring(4, 6), 16),
    ];
  };
  const ca = parse(a);
  const cb = parse(b);
  const r = Math.round(ca[0] + (cb[0] - ca[0]) * t);
  const g = Math.round(ca[1] + (cb[1] - ca[1]) * t);
  const bl = Math.round(ca[2] + (cb[2] - ca[2]) * t);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${bl.toString(16).padStart(2, "0")}`;
}
