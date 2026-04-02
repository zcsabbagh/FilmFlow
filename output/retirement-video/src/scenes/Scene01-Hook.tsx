import { useCurrentFrame, useVideoConfig, interpolate, spring, Audio, staticFile, Sequence, Easing } from "remotion";
import { tokens } from "../tokens";

// Timing: "Half of American workers have no retirement savings at all..."
// Key beats: "Half" at frame 0, "Zero" at ~90, "$212K" at ~240, "seven years" at ~430
const T = { half: 0, zero: 80, median: 200, twoTwelve: 250, sevenYears: 420 };

export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Act 1: WaffleChart — half empty (frames 0-200) ──
  const act1Opacity = frame >= T.median ? interpolate(frame, [T.median, T.median + 15], [1, 0], { extrapolateRight: "clamp" }) : 1;

  const waffleProgress = interpolate(frame, [T.half + 10, T.half + 60], [0, 1], { extrapolateRight: "clamp" });
  const filledCount = Math.round(50 * waffleProgress); // 50 out of 100

  // "ZERO" emphasis
  const zeroOp = interpolate(frame, [T.zero, T.zero + 12], [0, 1], { extrapolateRight: "clamp" });
  const zeroScale = spring({ frame: frame - T.zero, fps, config: { damping: 12, stiffness: 120 } });

  // ── Act 2: NumberTicker — $212,000 (frames 200+) ──
  const act2Opacity = frame >= T.median ? interpolate(frame, [T.median, T.median + 15], [0, 1], { extrapolateRight: "clamp" }) : 0;

  const tickerProgress = spring({ frame: frame - T.twoTwelve, fps, config: { damping: 30, stiffness: 40 } });
  const tickerValue = Math.round(212000 * tickerProgress);

  // "7 years" punchline
  const sevenOp = interpolate(frame, [T.sevenYears, T.sevenYears + 15], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div style={{ width: tokens.layout.width, height: tokens.layout.height, backgroundColor: tokens.colors.background, position: "relative", overflow: "hidden" }}>
      <Audio src={staticFile("audio/scene01.mp3")} />

      {/* ═══ Act 1: Waffle Grid ═══ */}
      <div style={{ position: "absolute", inset: 0, padding: tokens.layout.padding, opacity: act1Opacity }}>
        <div style={{ fontFamily: tokens.fonts.heading, fontSize: 42, fontWeight: 700, color: tokens.colors.text, marginBottom: 40 }}>
          Workers with no retirement savings
        </div>

        <div style={{ display: "flex", gap: 60, alignItems: "center" }}>
          {/* 10x10 grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 44px)", gap: 6 }}>
            {Array.from({ length: 100 }).map((_, i) => {
              const isFilled = i < filledCount;
              const delay = i * 0.5;
              const cellOp = interpolate(frame - delay, [T.half + 10, T.half + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return (
                <div key={i} style={{
                  width: 44, height: 44, borderRadius: 4,
                  backgroundColor: isFilled ? tokens.colors.accent : tokens.colors.backgroundAlt,
                  opacity: cellOp,
                  transform: `scale(${cellOp})`,
                }} />
              );
            })}
          </div>

          {/* Label */}
          <div>
            <div style={{ fontFamily: tokens.fonts.heading, fontSize: 120, fontWeight: 900, color: tokens.colors.text }}>50%</div>
            <div style={{ fontFamily: tokens.fonts.body, fontSize: 24, color: tokens.colors.textMuted, marginTop: 8 }}>
              have nothing saved for retirement
            </div>
          </div>
        </div>

        {/* "ZERO" emphasis */}
        {frame >= T.zero && (
          <div style={{
            position: "absolute", bottom: 200, right: 200,
            fontFamily: tokens.fonts.heading, fontSize: 100, fontWeight: 900,
            color: tokens.colors.accent, opacity: zeroOp,
            transform: `scale(${Math.min(zeroScale, 1)})`,
          }}>
            Zero.
          </div>
        )}
      </div>

      {/* ═══ Act 2: $212K reveal ═══ */}
      <div style={{ position: "absolute", inset: 0, padding: tokens.layout.padding, opacity: act2Opacity, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontFamily: tokens.fonts.body, fontSize: 20, fontWeight: 600, color: tokens.colors.textMuted, textTransform: "uppercase", letterSpacing: 3, marginBottom: 20 }}>
          Median retirement savings, age 60-64
        </div>
        <div style={{ fontFamily: tokens.fonts.heading, fontSize: 160, fontWeight: 900, color: tokens.colors.text, lineHeight: 1 }}>
          ${tickerValue.toLocaleString()}
        </div>

        {/* "7 years of expenses" */}
        {frame >= T.sevenYears && (
          <div style={{
            fontFamily: tokens.fonts.body, fontSize: 32, color: tokens.colors.accent,
            fontWeight: 600, marginTop: 30, opacity: sevenOp,
            transform: `translateY(${(1 - sevenOp) * 15}px)`,
          }}>
            That&apos;s about 7 years of expenses.
          </div>
        )}
      </div>

      <div style={{ position: "absolute", bottom: tokens.layout.padding, left: tokens.layout.padding, fontFamily: tokens.fonts.body, fontSize: 14, color: tokens.colors.textLight }}>
        Source: Federal Reserve Survey of Consumer Finances, 2022
      </div>
    </div>
  );
};
