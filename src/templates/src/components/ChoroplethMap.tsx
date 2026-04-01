import { useCurrentFrame, interpolate, spring, useVideoConfig, staticFile } from "remotion";
import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";
import { tokens } from "../tokens";

// Use local unprojected TopoJSON for reliable offline rendering
// Download from: https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json
const GEO_URL = staticFile("data/us-states.json");

type StateData = {
  /** State name (e.g. "California") or FIPS code */
  id: string;
  /** Numeric value for coloring */
  value: number;
};

type Props = {
  data: StateData[];
  title?: string;
  caption?: string;
  source?: string;
  /** Color for highlighted states (default: salmon accent) */
  highlightColor?: string;
  /** Color for non-highlighted states (default: medium gray) */
  baseColor?: string;
  /** Whether to animate states filling in one by one */
  staggered?: boolean;
  /** Optional year label displayed to the left of the map */
  yearLabel?: string;
};

export const ChoroplethMap: React.FC<Props> = ({
  data,
  title,
  caption,
  source,
  highlightColor = tokens.colors.accent,
  baseColor = "#b0b0b0",
  staggered = true,
  yearLabel,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Build a lookup map: state name -> value
  const dataMap = new Map(data.map((d) => [d.id, d.value]));

  // Title fade
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleSlide = interpolate(frame, [0, 15], [20, 0], {
    extrapolateRight: "clamp",
  });

  // Map fade in
  const mapOpacity = interpolate(frame, [5, 25], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Year label spring
  const yearProgress = spring({
    frame: frame - 10,
    fps,
    config: { damping: 30, stiffness: 80 },
  });

  // Compute map sizing — fill most of the frame
  const hasYear = !!yearLabel;
  const mapContainerWidth = hasYear ? "88%" : "95%";
  const mapMarginLeft = hasYear ? "8%" : "0%";

  return (
    <div
      style={{
        width: tokens.layout.width,
        height: tokens.layout.height,
        backgroundColor: tokens.colors.background,
        padding: tokens.layout.padding * 0.6,
        paddingTop: tokens.layout.padding * 0.5,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
      }}
    >
      {/* Title */}
      {title && (
        <div
          style={{
            fontFamily: tokens.fonts.heading,
            fontSize: 46,
            fontWeight: tokens.fontWeights.bold,
            color: tokens.colors.text,
            opacity: titleOpacity,
            transform: `translateY(${titleSlide}px)`,
            marginBottom: 8,
            textAlign: "center" as const,
            width: "100%",
          }}
        >
          {title}
        </div>
      )}

      {/* Caption under title */}
      {caption && (
        <div
          style={{
            fontFamily: tokens.fonts.body,
            fontSize: 20,
            color: tokens.colors.textMuted,
            opacity: interpolate(frame, [8, 22], [0, 1], {
              extrapolateRight: "clamp",
            }),
            marginBottom: 10,
            textAlign: "center" as const,
          }}
        >
          {caption}
        </div>
      )}

      {/* Map container — fills most of frame */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: mapOpacity,
          position: "relative",
          width: "100%",
        }}
      >
        {/* Year label */}
        {yearLabel && (
          <div
            style={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              fontFamily: tokens.fonts.heading,
              fontSize: 80,
              fontWeight: tokens.fontWeights.black,
              color: tokens.colors.textMuted,
              opacity: yearProgress,
            }}
          >
            {yearLabel}
          </div>
        )}

        <ComposableMap
          projection="geoAlbersUsa"
          width={975}
          height={610}
          style={{
            width: mapContainerWidth,
            height: "auto",
            marginLeft: mapMarginLeft,
            maxHeight: "100%",
          }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo, idx) => {
                const stateName = geo.properties.name;
                const value = dataMap.get(stateName);
                const isHighlighted = value !== undefined && value > 0;

                // Staggered fill animation
                const staggerDelay = staggered ? idx * 1.5 : 0;
                const fillProgress = interpolate(
                  frame - 15 - staggerDelay,
                  [0, 8],
                  [0, 1],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                );

                const stateOpacity = isHighlighted ? fillProgress : mapOpacity;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={isHighlighted ? highlightColor : baseColor}
                    stroke={tokens.colors.background}
                    strokeWidth={1.5}
                    opacity={isHighlighted ? stateOpacity : 1}
                    style={{
                      default: { outline: "none" },
                      hover: { outline: "none" },
                      pressed: { outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
      </div>

      {/* Source footer */}
      {source && (
        <div
          style={{
            fontFamily: tokens.fonts.body,
            fontSize: 14,
            color: tokens.colors.textLight,
            opacity: interpolate(frame, [30, 50], [0, 1], {
              extrapolateRight: "clamp",
            }),
            alignSelf: "flex-start",
            marginTop: 8,
          }}
        >
          Source: {source}
        </div>
      )}
    </div>
  );
};
