import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { tokens } from "../tokens";

type TimelineEvent = { date: string; title: string; description?: string };
type Props = { events: TimelineEvent[]; title?: string; caption?: string };

export const AnimatedTimeline: React.FC<Props> = ({ events, title, caption }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        width: tokens.layout.width,
        height: tokens.layout.height,
        backgroundColor: tokens.colors.background,
        padding: tokens.layout.padding,
        fontFamily: tokens.fonts.body,
        color: tokens.colors.text,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {title && (
        <div
          style={{
            fontSize: 46,
            fontWeight: tokens.fontWeights.bold,
            fontFamily: tokens.fonts.heading,
            color: tokens.colors.primary,
            marginBottom: 40,
            opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          {title}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 30, paddingLeft: 40, flex: 1 }}>
        {events.map((event, i) => {
          const progress = spring({ frame: frame - i * 10, fps, config: { damping: 20, stiffness: 100 } });
          return (
            <div
              key={i}
              style={{
                opacity: progress,
                transform: `translateX(${(1 - progress) * 30}px)`,
                display: "flex",
                gap: 20,
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 7,
                  backgroundColor: tokens.colors.accent,
                  marginTop: 8,
                  flexShrink: 0,
                }}
              />
              <div>
                <div
                  style={{
                    fontSize: 16,
                    color: tokens.colors.textMuted,
                    fontFamily: tokens.fonts.body,
                    fontWeight: tokens.fontWeights.medium,
                  }}
                >
                  {event.date}
                </div>
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: tokens.fontWeights.semibold,
                    fontFamily: tokens.fonts.heading,
                    color: tokens.colors.primary,
                    marginTop: 4,
                  }}
                >
                  {event.title}
                </div>
                {event.description && (
                  <div
                    style={{
                      fontSize: 18,
                      color: tokens.colors.textMuted,
                      marginTop: 4,
                      fontFamily: tokens.fonts.body,
                    }}
                  >
                    {event.description}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {caption && (
        <div
          style={{
            fontSize: 16,
            color: tokens.colors.textMuted,
            fontFamily: tokens.fonts.body,
            opacity: interpolate(frame, [20, 35], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          {caption}
        </div>
      )}
    </div>
  );
};
