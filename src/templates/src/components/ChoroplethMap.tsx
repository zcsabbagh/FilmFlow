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

  // Build a lookup map: state name → value
  const dataMap = new Map(data.map((d) => [d.id, d.value]));

  // Title fade
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
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

  return (
    <div
      style={{
        width: tokens.layout.width,
        height: tokens.layout.height,
        backgroundColor: tokens.colors.background,
        padding: tokens.layout.padding,
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
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          {title}
        </div>
      )}

      {/* Map container */}
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
        {/* Year label (like "2016" in Vox swing states graphic) */}
        {yearLabel && (
          <div
            style={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: `translateY(-50%)`,
              fontFamily: tokens.fonts.heading,
              fontSize: 72,
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
            width: yearLabel ? "80%" : "90%",
            height: "auto",
            marginLeft: yearLabel ? "10%" : 0,
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

                const fillColor = isHighlighted
                  ? highlightColor
                  : baseColor;

                // Non-highlighted states are always visible; highlighted ones animate in
                const stateOpacity = isHighlighted
                  ? fillProgress
                  : mapOpacity;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={isHighlighted ? fillColor : baseColor}
                    stroke={tokens.colors.background}
                    strokeWidth={1}
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

      {/* Caption / Source footer */}
      {(caption || source) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            opacity: interpolate(frame, [30, 50], [0, 1], {
              extrapolateRight: "clamp",
            }),
          }}
        >
          {caption && (
            <div
              style={{
                fontFamily: tokens.fonts.body,
                fontSize: 16,
                color: tokens.colors.textMuted,
              }}
            >
              {caption}
            </div>
          )}
          {source && (
            <div
              style={{
                fontFamily: tokens.fonts.body,
                fontSize: 14,
                color: tokens.colors.textLight,
              }}
            >
              Source: {source}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
