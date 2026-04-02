import { useCurrentFrame, useVideoConfig, interpolate, spring, Audio, staticFile, Easing } from "remotion";
import { tokens } from "../tokens";

// "The retirement crisis isn't coming. It's here. 10,000 boomers turn 65 every day..."
const T = { isntComing: 0, itsHere: 50, tenThousand: 120, halfNotReady: 250, millennials: 330 };

export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── SplitScreen: "10,000/day" vs "Half aren't ready" ──
  const leftSlide = interpolate(frame, [T.tenThousand, T.tenThousand + 25], [-tokens.layout.width / 2, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic),
  });
  const rightSlide = interpolate(frame, [T.halfNotReady, T.halfNotReady + 25], [tokens.layout.width / 2, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic),
  });

  const tenKProgress = spring({ frame: frame - T.tenThousand - 5, fps, config: { damping: 25, stiffness: 40 } });
  const dividerOp = interpolate(frame, [T.halfNotReady, T.halfNotReady + 15], [0, 1], { extrapolateRight: "clamp" });

  // Opening text
  const line1Op = interpolate(frame, [T.isntComing + 5, T.isntComing + 20], [0, 1], { extrapolateRight: "clamp" });
  const line2Op = interpolate(frame, [T.itsHere, T.itsHere + 12], [0, 1], { extrapolateRight: "clamp" });
  const line2Scale = spring({ frame: frame - T.itsHere, fps, config: { damping: 12, stiffness: 120 } });

  // Dim opening text when split screen appears
  const openDim = frame >= T.tenThousand ? interpolate(frame, [T.tenThousand, T.tenThousand + 15], [1, 0], { extrapolateRight: "clamp" }) : 1;

  // "For millennials" closing
  const milOp = interpolate(frame, [T.millennials, T.millennials + 15], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div style={{ width: tokens.layout.width, height: tokens.layout.height, backgroundColor: tokens.colors.background, position: "relative", overflow: "hidden" }}>
      <Audio src={staticFile("audio/scene05.mp3")} />

      {/* ═══ Opening: "The crisis isn't coming. It's here." ═══ */}
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: openDim }}>
        <div style={{ fontFamily: tokens.fonts.heading, fontSize: 48, fontWeight: 700, color: tokens.colors.text, opacity: line1Op, textAlign: "center" }}>
          The retirement crisis isn&apos;t coming.
        </div>
        {frame >= T.itsHere && (
          <div style={{
            fontFamily: tokens.fonts.heading, fontSize: 64, fontWeight: 900,
            color: tokens.colors.accent, marginTop: 16, opacity: line2Op,
            transform: `scale(${Math.min(line2Scale, 1)})`,
          }}>
            It&apos;s here.
          </div>
        )}
      </div>

      {/* ═══ Split screen ═══ */}
      {frame >= T.tenThousand && (
        <>
          {/* Left panel */}
          <div style={{
            position: "absolute", top: 0, left: 0, width: "50%", height: "100%",
            backgroundColor: tokens.colors.background,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            transform: `translateX(${leftSlide}px)`,
          }}>
            <div style={{ fontFamily: tokens.fonts.heading, fontSize: 120, fontWeight: 900, color: tokens.colors.text, lineHeight: 1 }}>
              {Math.round(10000 * Math.min(tenKProgress, 1)).toLocaleString()}
            </div>
            <div style={{ fontFamily: tokens.fonts.body, fontSize: 24, color: tokens.colors.textMuted, marginTop: 16, textAlign: "center" }}>
              baby boomers turn 65<br />every single day
            </div>
          </div>

          {/* Divider */}
          <div style={{
            position: "absolute", top: "15%", left: "50%", width: 2, height: "70%",
            backgroundColor: tokens.colors.textMuted, opacity: dividerOp,
            transform: "translateX(-50%)",
          }} />

          {/* Right panel */}
          {frame >= T.halfNotReady && (
            <div style={{
              position: "absolute", top: 0, right: 0, width: "50%", height: "100%",
              backgroundColor: tokens.colors.background,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              transform: `translateX(${rightSlide}px)`,
            }}>
              <div style={{ fontFamily: tokens.fonts.heading, fontSize: 120, fontWeight: 900, color: tokens.colors.accent, lineHeight: 1 }}>
                50%
              </div>
              <div style={{ fontFamily: tokens.fonts.body, fontSize: 24, color: tokens.colors.textMuted, marginTop: 16, textAlign: "center" }}>
                aren&apos;t financially<br />ready to retire
              </div>
            </div>
          )}
        </>
      )}

      {/* "For millennials, it may be even worse" */}
      {frame >= T.millennials && (
        <div style={{
          position: "absolute", bottom: 140, left: 0, right: 0, textAlign: "center",
          fontFamily: tokens.fonts.body, fontSize: 28, fontWeight: 600,
          color: tokens.colors.textMuted, opacity: milOp,
        }}>
          For millennials, it may be even worse.
        </div>
      )}

      <div style={{ position: "absolute", bottom: tokens.layout.padding, left: tokens.layout.padding, fontFamily: tokens.fonts.body, fontSize: 14, color: tokens.colors.textLight }}>
        Source: Pew Research Center, AARP
      </div>
    </div>
  );
};
