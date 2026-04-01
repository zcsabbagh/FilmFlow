import React from "react";
import {
  Audio,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { tokens } from "../tokens";

/* ── SF neighborhood grid overlay data ── */
const SF_NEIGHBORHOODS = [
  "Richmond", "Sunset", "Marina", "Pacific Hts",
  "Nob Hill", "SOMA", "Mission", "Castro",
  "Haight", "Tenderloin", "Excelsior", "Bayview",
  "Noe Valley", "Potrero", "Bernal Hts", "Visitacion",
];

export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  /* ═══════════════════════════════════════
     ANIMATION PHASES (synced to voiceover)
     ═══════════════════════════════════════ */

  // Phase 1: Background + year badge fade in (frames 0-20)
  const bgOpacity = interpolate(frame, [0, 20], [0, 0.17], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const gridOpacity = interpolate(frame, [5, 30], [0, 0.08], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Phase 2: Big number counts up — "One hundred and eighty thousand" (0-2s = frames 0-60)
  const countProgress = spring({
    frame,
    fps,
    config: { damping: 35, stiffness: 50 },
  });
  const displayValue = Math.round(180000 * countProgress);
  const numberScale = interpolate(
    spring({ frame, fps, config: { damping: 12, stiffness: 60 } }),
    [0, 1],
    [0.85, 1]
  );
  const numberOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Phase 3: "homes eliminated in a single vote" (frames 75-210)
  const subtitleOpacity = interpolate(frame, [70, 90], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const subtitleSlide = interpolate(frame, [70, 90], [20, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Phase 4: Accent line draws across (frames 85-120)
  const lineProgress = spring({
    frame: frame - 85,
    fps,
    config: { damping: 25, stiffness: 60 },
  });

  // Phase 5: Year "1978" + date stamp (frames 228-280)
  const yearOpacity = interpolate(frame, [225, 250], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const yearScale = interpolate(
    spring({ frame: frame - 225, fps, config: { damping: 15, stiffness: 80 } }),
    [0, 1],
    [0.7, 1]
  );

  // Phase 6: "Board of Supervisors" context text (frames 327-400)
  const contextOpacity = interpolate(frame, [327, 355], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const contextSlide = interpolate(frame, [327, 355], [15, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Phase 7: Supervisor names (frames 558-650)
  const namesOpacity = interpolate(frame, [555, 580], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const milkOpacity = interpolate(frame, [558, 578], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const feinsteinOpacity = interpolate(frame, [600, 620], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Phase 8: Bottom tagline — "made housing illegal" (frames 720-780)
  const taglineOpacity = interpolate(frame, [715, 745], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const taglineSlide = interpolate(frame, [715, 745], [12, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Source line
  const sourceOpacity = interpolate(frame, [100, 120], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  return (
    <>
      <Audio src={staticFile("audio/scene01-hook.mp3")} />
      <div
        style={{
          width: tokens.layout.width,
          height: tokens.layout.height,
          backgroundColor: tokens.colors.background,
          position: "relative",
          overflow: "hidden",
          fontFamily: tokens.fonts.body,
          color: tokens.colors.text,
        }}
      >
        {/* ── Layer 0: Background photo ── */}
        <Img
          src={staticFile("images/sf-city-hall.jpg")}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: bgOpacity,
            filter: "grayscale(0.6) contrast(1.1)",
          }}
        />

        {/* ── Layer 1: Neighborhood grid overlay ── */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gridTemplateRows: "repeat(4, 1fr)",
            opacity: gridOpacity,
            pointerEvents: "none",
          }}
        >
          {SF_NEIGHBORHOODS.map((name, i) => (
            <div
              key={name}
              style={{
                border: `1px solid ${tokens.colors.textMuted}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontFamily: tokens.fonts.mono,
                color: tokens.colors.textMuted,
                letterSpacing: 1,
                textTransform: "uppercase",
                opacity: interpolate(frame, [10 + i * 3, 30 + i * 3], [0, 1], {
                  extrapolateRight: "clamp",
                  extrapolateLeft: "clamp",
                }),
              }}
            >
              {name}
            </div>
          ))}
        </div>

        {/* ── Layer 2: Subtle diagonal hash lines (texture) ── */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            opacity: 0.03,
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 35px, #8a8a8a 35px, #8a8a8a 36px)",
            pointerEvents: "none",
          }}
        />

        {/* ── Layer 3: Main content — asymmetric two-column layout ── */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "row",
            padding: "80px 100px",
            zIndex: 10,
          }}
        >
          {/* LEFT COLUMN: Number + supporting info (60% width) */}
          <div
            style={{
              flex: "0 0 58%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            {/* Big number */}
            <div
              style={{
                fontSize: 180,
                fontWeight: tokens.fontWeights.black,
                fontFamily: tokens.fonts.heading,
                color: tokens.colors.primary,
                lineHeight: 0.9,
                transform: `scale(${numberScale})`,
                opacity: numberOpacity,
                letterSpacing: -4,
              }}
            >
              {displayValue.toLocaleString()}
            </div>

            {/* Accent line */}
            <div
              style={{
                width: 380 * lineProgress,
                height: 3,
                backgroundColor: tokens.colors.accent,
                marginTop: 24,
                marginBottom: 24,
                opacity: lineProgress,
              }}
            />

            {/* Subtitle: "homes eliminated in a single vote" */}
            <div
              style={{
                fontSize: 36,
                fontFamily: tokens.fonts.body,
                fontWeight: tokens.fontWeights.medium,
                color: tokens.colors.text,
                opacity: subtitleOpacity,
                transform: `translateY(${subtitleSlide}px)`,
                lineHeight: 1.3,
                maxWidth: 650,
              }}
            >
              homes eliminated in a single vote
            </div>

            {/* Context: zoning description */}
            <div
              style={{
                fontSize: 22,
                fontFamily: tokens.fonts.body,
                fontWeight: tokens.fontWeights.regular,
                color: tokens.colors.textMuted,
                opacity: contextOpacity,
                transform: `translateY(${contextSlide}px)`,
                lineHeight: 1.5,
                maxWidth: 580,
                marginTop: 20,
              }}
            >
              The Board of Supervisors rewrote the city's zoning code,
              slashing buildable units by one-third
            </div>

            {/* Supervisor names */}
            <div
              style={{
                display: "flex",
                gap: 30,
                marginTop: 32,
                opacity: namesOpacity,
              }}
            >
              <div
                style={{
                  opacity: milkOpacity,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontFamily: tokens.fonts.mono,
                    color: tokens.colors.textMuted,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    marginBottom: 4,
                  }}
                >
                  Voted Yes
                </div>
                <div
                  style={{
                    fontSize: 20,
                    fontFamily: tokens.fonts.heading,
                    fontWeight: tokens.fontWeights.bold,
                    color: tokens.colors.text,
                  }}
                >
                  Harvey Milk
                </div>
              </div>
              <div
                style={{
                  opacity: feinsteinOpacity,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontFamily: tokens.fonts.mono,
                    color: tokens.colors.textMuted,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    marginBottom: 4,
                  }}
                >
                  Voted Yes
                </div>
                <div
                  style={{
                    fontSize: 20,
                    fontFamily: tokens.fonts.heading,
                    fontWeight: tokens.fontWeights.bold,
                    color: tokens.colors.text,
                  }}
                >
                  Dianne Feinstein
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Year badge + tagline (40% width) */}
          <div
            style={{
              flex: "0 0 42%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "flex-end",
              textAlign: "right",
            }}
          >
            {/* Year — large display */}
            <div
              style={{
                opacity: yearOpacity,
                transform: `scale(${yearScale})`,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontFamily: tokens.fonts.mono,
                  color: tokens.colors.textMuted,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                September 18
              </div>
              <div
                style={{
                  fontSize: 160,
                  fontWeight: tokens.fontWeights.black,
                  fontFamily: tokens.fonts.heading,
                  color: tokens.colors.secondary,
                  lineHeight: 0.85,
                  letterSpacing: -3,
                  opacity: 0.18,
                }}
              >
                1978
              </div>
              {/* Callout line from year to left column */}
              <div
                style={{
                  width: 80,
                  height: 1,
                  backgroundColor: tokens.colors.textMuted,
                  marginTop: 16,
                  marginBottom: 16,
                  opacity: yearOpacity * 0.4,
                  alignSelf: "flex-start",
                }}
              />
              <div
                style={{
                  fontSize: 16,
                  fontFamily: tokens.fonts.body,
                  color: tokens.colors.textMuted,
                  opacity: yearOpacity,
                  lineHeight: 1.5,
                  maxWidth: 320,
                }}
              >
                San Francisco Board of Supervisors
                {"\n"}Rezoning Resolution
              </div>
            </div>

            {/* Bottom tagline */}
            <div
              style={{
                marginTop: 60,
                opacity: taglineOpacity,
                transform: `translateY(${taglineSlide}px)`,
              }}
            >
              <div
                style={{
                  fontSize: 26,
                  fontFamily: tokens.fonts.heading,
                  fontWeight: tokens.fontWeights.semibold,
                  color: tokens.colors.secondary,
                  fontStyle: "italic",
                  lineHeight: 1.4,
                  maxWidth: 380,
                  textAlign: "right",
                }}
              >
                "The most progressive city in America
                had just made housing illegal."
              </div>
            </div>
          </div>
        </div>

        {/* ── Layer 4: Top-left label ── */}
        <div
          style={{
            position: "absolute",
            top: 32,
            left: 40,
            opacity: interpolate(frame, [15, 35], [0, 0.6], {
              extrapolateRight: "clamp",
              extrapolateLeft: "clamp",
            }),
            fontSize: 11,
            fontFamily: tokens.fonts.mono,
            color: tokens.colors.textMuted,
            letterSpacing: 2,
            textTransform: "uppercase",
            zIndex: 20,
          }}
        >
          San Francisco Housing Crisis — Origins
        </div>

        {/* ── Layer 5: Bottom-right source ── */}
        <div
          style={{
            position: "absolute",
            bottom: 28,
            right: 40,
            opacity: sourceOpacity * 0.5,
            fontSize: 12,
            fontFamily: tokens.fonts.mono,
            color: tokens.colors.textMuted,
            letterSpacing: 1,
            zIndex: 20,
          }}
        >
          Source: SF Planning EIR
        </div>

        {/* ── Layer 6: Decorative corner marks ── */}
        {/* Top-right corner */}
        <div
          style={{
            position: "absolute",
            top: 24,
            right: 24,
            width: 40,
            height: 40,
            borderTop: `2px solid ${tokens.colors.textLight}`,
            borderRight: `2px solid ${tokens.colors.textLight}`,
            opacity: interpolate(frame, [10, 30], [0, 0.3], {
              extrapolateRight: "clamp",
              extrapolateLeft: "clamp",
            }),
            zIndex: 20,
          }}
        />
        {/* Bottom-left corner */}
        <div
          style={{
            position: "absolute",
            bottom: 24,
            left: 24,
            width: 40,
            height: 40,
            borderBottom: `2px solid ${tokens.colors.textLight}`,
            borderLeft: `2px solid ${tokens.colors.textLight}`,
            opacity: interpolate(frame, [10, 30], [0, 0.3], {
              extrapolateRight: "clamp",
              extrapolateLeft: "clamp",
            }),
            zIndex: 20,
          }}
        />
      </div>
    </>
  );
};
