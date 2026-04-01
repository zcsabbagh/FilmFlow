import { useCurrentFrame, useVideoConfig, interpolate, spring, Audio, staticFile } from "remotion";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { tokens } from "../tokens";

const GEO_URL = staticFile("data/us-states.json");

// States at $7.25 or with no state minimum wage law
const AT_FEDERAL = new Set([
  "Alabama", "Georgia", "Idaho", "Indiana", "Iowa", "Kansas", "Kentucky",
  "Louisiana", "Mississippi", "New Hampshire", "North Carolina", "North Dakota",
  "Oklahoma", "Pennsylvania", "South Carolina", "Tennessee", "Texas",
  "Utah", "Wisconsin", "Wyoming",
]);

// States above $15/hr
const ABOVE_15 = new Set([
  "California", "Washington", "New York", "Massachusetts", "Connecticut",
  "New Jersey", "Maryland", "Oregon", "Colorado", "Vermont", "Delaware",
]);

export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleOp = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const mapOp = interpolate(frame, [10, 30], [0, 1], { extrapolateRight: "clamp" });

  // Legend
  const legendOp = interpolate(frame, [50, 70], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div style={{ width: tokens.layout.width, height: tokens.layout.height, backgroundColor: tokens.colors.background, position: "relative", padding: 50 }}>
      <Audio src={staticFile("audio/scene05-map.mp3")} />

      <div style={{ fontFamily: tokens.fonts.heading, fontSize: 44, fontWeight: 700, color: tokens.colors.text, opacity: titleOp }}>
        State minimum wages
      </div>
      <div style={{ fontFamily: tokens.fonts.body, fontSize: 20, color: tokens.colors.textMuted, marginTop: 4, opacity: titleOp }}>
        20 states still at the federal floor of $7.25
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, opacity: mapOp, marginTop: 10 }}>
        <ComposableMap projection="geoAlbersUsa" width={975} height={610} style={{ width: "90%", height: "auto" }}>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo, idx) => {
                const name = geo.properties.name;
                const atFederal = AT_FEDERAL.has(name);
                const above15 = ABOVE_15.has(name);
                const staggerDelay = idx * 1.2;
                const fillProgress = interpolate(frame - 20 - staggerDelay, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                const color = atFederal ? tokens.colors.accent : above15 ? "#27ae60" : "#b0b0b0";
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={color}
                    stroke={tokens.colors.background}
                    strokeWidth={1.5}
                    opacity={fillProgress}
                    style={{ default: { outline: "none" }, hover: { outline: "none" }, pressed: { outline: "none" } }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
      </div>

      {/* Legend */}
      <div style={{ position: "absolute", bottom: 100, right: 100, display: "flex", gap: 30, opacity: legendOp }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 16, height: 16, backgroundColor: tokens.colors.accent }} />
          <div style={{ fontFamily: tokens.fonts.body, fontSize: 16, color: tokens.colors.textMuted }}>At $7.25</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 16, height: 16, backgroundColor: "#27ae60" }} />
          <div style={{ fontFamily: tokens.fonts.body, fontSize: 16, color: tokens.colors.textMuted }}>Above $15</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 16, height: 16, backgroundColor: "#b0b0b0" }} />
          <div style={{ fontFamily: tokens.fonts.body, fontSize: 16, color: tokens.colors.textMuted }}>In between</div>
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 50, left: 50, fontFamily: tokens.fonts.body, fontSize: 14, color: tokens.colors.textLight }}>Source: US Department of Labor, 2025</div>
    </div>
  );
};
