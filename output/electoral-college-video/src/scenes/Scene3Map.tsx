import { useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from "remotion";
import { tokens } from "../tokens";
import { ChoroplethMap } from "../components/ChoroplethMap";

/**
 * Scene 3: The Map Problem — ChoroplethMap showing swing states
 * Timing:
 * thing@14, twenty-four@56, candidates@90, visited@107, seven@134, states@152
 * [pause]@201, Seven@219, out@226, fifty@242
 * California@291, Texas@323, New@350, York@358
 * state@393, decided@416, vote@461, cast@479
 */

// 7 swing states highlighted
const swingStates = [
  { id: "Pennsylvania", value: 1 },
  { id: "Michigan", value: 1 },
  { id: "Wisconsin", value: 1 },
  { id: "Georgia", value: 1 },
  { id: "Arizona", value: 1 },
  { id: "Nevada", value: 1 },
  { id: "North Carolina", value: 1 },
];

export const Scene3Map: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // "7 states" callout at frame 134
  const sevenOpacity = interpolate(frame, [134, 148], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const sevenScale = spring({ frame: frame - 134, fps, config: { damping: 12, stiffness: 150 } });

  // "7 out of 50" callout at frame 219
  const ratioOpacity = interpolate(frame, [219, 235], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // "already decided" text at frame 416
  const decidedOpacity = interpolate(frame, [393, 420], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div
      style={{
        width: tokens.layout.width,
        height: tokens.layout.height,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ChoroplethMap fills the background */}
      <div style={{ position: "absolute", inset: 0 }}>
        <ChoroplethMap
          data={swingStates}
          title="Where Candidates Campaign"
          caption="2024 Presidential Election — Swing States"
          source="FairVote, Campaign Trail Tracker"
          highlightColor={tokens.colors.accent}
          baseColor="#d5d0c8"
          staggered={true}
        />
      </div>

      {/* "Just 7 states" callout — top right */}
      <div
        style={{
          position: "absolute",
          top: 160,
          right: tokens.layout.padding + 20,
          opacity: sevenOpacity,
          transform: `scale(${0.85 + 0.15 * Math.min(sevenScale, 1)})`,
          transformOrigin: "right center",
          textAlign: "right" as const,
        }}
      >
        <div
          style={{
            fontFamily: tokens.fonts.heading,
            fontSize: 120,
            fontWeight: tokens.fontWeights.black,
            color: tokens.colors.accent,
            lineHeight: 1,
          }}
        >
          7
        </div>
        <div
          style={{
            fontFamily: tokens.fonts.body,
            fontSize: 24,
            fontWeight: tokens.fontWeights.semibold,
            color: tokens.colors.text,
            marginTop: -4,
          }}
        >
          states visited
        </div>
      </div>

      {/* "out of 50" — appears below */}
      <div
        style={{
          position: "absolute",
          top: 330,
          right: tokens.layout.padding + 20,
          opacity: ratioOpacity,
          textAlign: "right" as const,
        }}
      >
        <div
          style={{
            fontFamily: tokens.fonts.heading,
            fontSize: 36,
            fontWeight: tokens.fontWeights.bold,
            color: tokens.colors.textMuted,
          }}
        >
          out of <span style={{ color: tokens.colors.text, fontSize: 48 }}>50</span>
        </div>
      </div>

      {/* "Already decided" text — bottom center */}
      <div
        style={{
          position: "absolute",
          bottom: 90,
          width: "100%",
          textAlign: "center",
          opacity: decidedOpacity,
        }}
      >
        <div
          style={{
            fontFamily: tokens.fonts.heading,
            fontSize: 30,
            fontWeight: tokens.fontWeights.bold,
            color: tokens.colors.secondary,
            display: "inline-block",
            padding: "12px 32px",
            backgroundColor: "rgba(192, 57, 43, 0.08)",
            borderRadius: 8,
          }}
        >
          43 states already decided before a single vote was cast
        </div>
      </div>
    </div>
  );
};
