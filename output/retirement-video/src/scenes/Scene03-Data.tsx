import { useCurrentFrame, useVideoConfig, interpolate, spring, Audio, staticFile, Easing } from "remotion";
import { tokens } from "../tokens";

// "Here's what that shift looks like. In 1980, 60% had a pension. Today, 4%..."
const T = { heres: 0, sixty: 60, fourPercent: 120, healthcare: 250, socialSec: 350, fiftyK: 430 };

export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Act 1: CounterStrip — 4 stats appearing one by one ──
  const stats = [
    { value: 4, suffix: "%", label: "workers with pensions today", color: tokens.colors.accent, frame: T.fourPercent },
    { value: 3, suffix: "×", label: "healthcare cost increase", color: "#c0392b", frame: T.healthcare },
    { value: 40, suffix: "%", label: "income replaced by Social Security", color: "#5b7e96", frame: T.socialSec },
    { value: 50, prefix: "<$", suffix: "K", label: "average American savings", color: tokens.colors.text, frame: T.fiftyK },
  ];

  // Dim counters to make room for text stack
  const showStack = frame >= T.fiftyK + 60;
  const counterDim = showStack ? interpolate(frame, [T.fiftyK + 60, T.fiftyK + 80], [1, 0.3], { extrapolateRight: "clamp" }) : 1;

  // ── Act 2: TextRevealStack — consequences ──
  const stackOp = showStack ? interpolate(frame, [T.fiftyK + 60, T.fiftyK + 80], [0, 1], { extrapolateRight: "clamp" }) : 0;

  const consequences = [
    { text: "Can't afford to stop working", highlight: false },
    { text: "One medical emergency from bankruptcy", highlight: true },
    { text: "Dependent on children or government", highlight: false },
    { text: "Working until you physically can't", highlight: true },
  ];

  return (
    <div style={{ width: tokens.layout.width, height: tokens.layout.height, backgroundColor: tokens.colors.background, position: "relative", padding: tokens.layout.padding }}>
      <Audio src={staticFile("audio/scene03.mp3")} />

      <div style={{ fontFamily: tokens.fonts.heading, fontSize: 40, fontWeight: 700, color: tokens.colors.text, marginBottom: 50, opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" }) }}>
        The retirement crisis in numbers
      </div>

      {/* Counter strip */}
      <div style={{ display: "flex", justifyContent: "space-between", opacity: counterDim, marginBottom: 40 }}>
        {stats.map((s, i) => {
          const progress = spring({ frame: frame - s.frame, fps, config: { damping: 25, stiffness: 50 } });
          const val = Math.round(s.value * Math.min(progress, 1));
          const op = interpolate(frame, [s.frame - 5, s.frame + 10], [0, 1], { extrapolateRight: "clamp" });
          return (
            <div key={s.label} style={{ textAlign: "center", opacity: op, flex: 1 }}>
              <div style={{ fontFamily: tokens.fonts.heading, fontSize: 80, fontWeight: 900, color: s.color, lineHeight: 1 }}>
                {s.prefix || ""}{val}{s.suffix}
              </div>
              <div style={{ width: 60, height: 2, backgroundColor: s.color, margin: "12px auto", opacity: progress }} />
              <div style={{ fontFamily: tokens.fonts.body, fontSize: 16, color: tokens.colors.textMuted, maxWidth: 200, margin: "0 auto" }}>
                {s.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Text reveal stack — consequences */}
      {showStack && (
        <div style={{ opacity: stackOp, marginTop: 20 }}>
          <div style={{ fontFamily: tokens.fonts.body, fontSize: 18, color: tokens.colors.textMuted, textTransform: "uppercase", letterSpacing: 2, marginBottom: 20 }}>
            What this means
          </div>
          {consequences.map((c, i) => {
            const lineOp = interpolate(frame, [T.fiftyK + 80 + i * 18, T.fiftyK + 95 + i * 18], [0, 1], { extrapolateRight: "clamp" });
            const slide = interpolate(frame, [T.fiftyK + 80 + i * 18, T.fiftyK + 95 + i * 18], [30, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
            return (
              <div key={c.text} style={{
                display: "flex", alignItems: "center", gap: 16, marginBottom: 16,
                opacity: lineOp, transform: `translateX(${slide}px)`,
              }}>
                {c.highlight && <div style={{ width: 4, height: 32, backgroundColor: tokens.colors.accent, flexShrink: 0 }} />}
                <div style={{
                  fontFamily: tokens.fonts.body,
                  fontSize: c.highlight ? 30 : 26,
                  fontWeight: c.highlight ? 600 : 400,
                  color: c.highlight ? tokens.colors.text : tokens.colors.textMuted,
                }}>
                  {c.text}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ position: "absolute", bottom: tokens.layout.padding, left: tokens.layout.padding, fontFamily: tokens.fonts.body, fontSize: 14, color: tokens.colors.textLight }}>
        Source: Federal Reserve, BLS, CMS
      </div>
    </div>
  );
};
