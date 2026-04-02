import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { tokens } from "../tokens";

type Zone = {
  from: number;
  to: number;
  color: string;
  label?: string;
};

type Props = {
  value: number;
  max: number;
  label: string;
  title?: string;
  source?: string;
  color?: string;
  zones?: Zone[];
};

export const GaugeChart: React.FC<Props> = ({
  value,
  max,
  label,
  title,
  source,
  color = tokens.colors.accent,
  zones,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Spring-driven needle sweep
  const needleProgress = spring({
    frame: frame - 12,
    fps,
    config: { damping: 20, stiffness: 40 },
  });

  const fraction = Math.min(value / max, 1);
  const currentFraction = fraction * needleProgress;
  const currentValue = Math.round(value * needleProgress);

  // Gauge geometry
  const radius = 150;
  const strokeWidth = 20;
  const centerX = tokens.layout.width / 2;
  const centerY = tokens.layout.height / 2 + 20;

  // Semicircle arc: from 180deg (left) to 0deg (right)
  // In SVG, angles measured from 3 o'clock, going clockwise
  // We want a semicircle opening upward: from PI to 0
  const startAngle = Math.PI; // left
  const endAngle = 0;        // right

  // Helper: angle for a given fraction (0..1)
  const fractionToAngle = (f: number) => startAngle - f * Math.PI;

  // Helper: point on arc
  const pointOnArc = (angle: number, r: number) => ({
    x: centerX + r * Math.cos(angle),
    y: centerY - r * Math.sin(angle),
  });

  // Build arc path for a fraction range
  const arcPath = (fromFrac: number, toFrac: number, r: number) => {
    const a1 = fractionToAngle(fromFrac);
    const a2 = fractionToAngle(toFrac);
    const p1 = pointOnArc(a1, r);
    const p2 = pointOnArc(a2, r);
    const sweep = toFrac - fromFrac > 0.5 ? 1 : 0;
    return `M ${p1.x} ${p1.y} A ${r} ${r} 0 ${sweep} 1 ${p2.x} ${p2.y}`;
  };

  // Needle endpoint
  const needleAngle = fractionToAngle(currentFraction);
  const needleTip = pointOnArc(needleAngle, radius - strokeWidth / 2 - 2);
  const needleLength = radius - strokeWidth / 2 - 2;

  // Title fade
  const titleOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Value number fade
  const valueOpacity = interpolate(frame, [20, 35], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const valueSlide = interpolate(frame, [20, 35], [15, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Label fade
  const labelOpacity = interpolate(frame, [30, 45], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Source fade
  const sourceOpacity = interpolate(frame, [50, 65], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Arc fade
  const arcOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // SVG viewBox dimensions
  const svgWidth = (radius + strokeWidth) * 2 + 40;
  const svgHeight = radius + strokeWidth + 40;
  const svgLeft = centerX - svgWidth / 2;
  const svgTop = centerY - radius - strokeWidth - 20;

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

      {/* Gauge SVG */}
      <svg
        style={{
          position: "absolute",
          left: svgLeft,
          top: svgTop,
          opacity: arcOpacity,
        }}
        width={svgWidth}
        height={svgHeight}
        viewBox={`${centerX - svgWidth / 2} ${centerY - radius - strokeWidth - 20} ${svgWidth} ${svgHeight}`}
      >
        {/* Background arc (full semicircle) */}
        <path
          d={arcPath(0, 1, radius)}
          fill="none"
          stroke={tokens.colors.backgroundAlt}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Zone arcs */}
        {zones
          ? zones.map((zone, i) => {
              const zFrom = Math.max(0, zone.from / max);
              const zTo = Math.min(1, zone.to / max);
              return (
                <path
                  key={i}
                  d={arcPath(zFrom, zTo, radius)}
                  fill="none"
                  stroke={zone.color}
                  strokeWidth={strokeWidth}
                  strokeLinecap="butt"
                  opacity={0.85}
                />
              );
            })
          : (
            /* Single-color filled arc up to current value */
            <path
              d={arcPath(0, Math.max(0.001, currentFraction), radius)}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          )}

        {/* Needle */}
        <line
          x1={centerX}
          y1={centerY}
          x2={needleTip.x}
          y2={needleTip.y}
          stroke={tokens.colors.primary}
          strokeWidth={3}
          strokeLinecap="round"
        />

        {/* Needle hub */}
        <circle
          cx={centerX}
          cy={centerY}
          r={8}
          fill={tokens.colors.primary}
        />
        <circle
          cx={centerX}
          cy={centerY}
          r={4}
          fill={tokens.colors.background}
        />

        {/* Min / max labels */}
        <text
          x={centerX - radius - 5}
          y={centerY + 24}
          textAnchor="middle"
          fontFamily={tokens.fonts.body}
          fontSize={14}
          fontWeight={tokens.fontWeights.regular}
          fill={tokens.colors.textMuted}
        >
          0
        </text>
        <text
          x={centerX + radius + 5}
          y={centerY + 24}
          textAnchor="middle"
          fontFamily={tokens.fonts.body}
          fontSize={14}
          fontWeight={tokens.fontWeights.regular}
          fill={tokens.colors.textMuted}
        >
          {max}
        </text>

        {/* Zone labels */}
        {zones?.map((zone, i) => {
          if (!zone.label) return null;
          const midFrac = ((zone.from + zone.to) / 2) / max;
          const labelPt = pointOnArc(fractionToAngle(midFrac), radius + strokeWidth + 16);
          return (
            <text
              key={`zl-${i}`}
              x={labelPt.x}
              y={labelPt.y}
              textAnchor="middle"
              fontFamily={tokens.fonts.body}
              fontSize={12}
              fontWeight={tokens.fontWeights.medium}
              fill={zone.color}
            >
              {zone.label}
            </text>
          );
        })}
      </svg>

      {/* Big value number — below gauge center */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: centerY + 30,
          textAlign: "center" as const,
          opacity: valueOpacity,
          transform: `translateY(${valueSlide}px)`,
        }}
      >
        <span
          style={{
            fontFamily: tokens.fonts.heading,
            fontSize: 72,
            fontWeight: tokens.fontWeights.black,
            color: zones
              ? getZoneColor(value, zones, color)
              : color,
          }}
        >
          {currentValue}
        </span>
        <span
          style={{
            fontFamily: tokens.fonts.body,
            fontSize: 24,
            fontWeight: tokens.fontWeights.medium,
            color: tokens.colors.textMuted,
            marginLeft: 8,
          }}
        >
          / {max}
        </span>
      </div>

      {/* Label */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: centerY + 120,
          textAlign: "center" as const,
          fontSize: 28,
          fontFamily: tokens.fonts.body,
          fontWeight: tokens.fontWeights.medium,
          color: tokens.colors.textMuted,
          opacity: labelOpacity,
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

/** Get the zone color that contains a given value */
function getZoneColor(value: number, zones: Zone[], fallback: string): string {
  for (const zone of zones) {
    if (value >= zone.from && value <= zone.to) {
      return zone.color;
    }
  }
  return fallback;
}
