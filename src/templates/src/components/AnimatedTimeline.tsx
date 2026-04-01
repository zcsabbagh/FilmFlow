import { useCurrentFrame, spring, useVideoConfig } from "remotion";
import { tokens } from "../tokens";

type TimelineEvent = { date: string; title: string; description?: string };
type Props = { events: TimelineEvent[]; title?: string };

export const AnimatedTimeline: React.FC<Props> = ({ events, title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div style={{ width: tokens.layout.width, height: tokens.layout.height, backgroundColor: tokens.colors.background, padding: tokens.layout.padding, fontFamily: tokens.fonts.body, color: tokens.colors.text }}>
      {title && <div style={{ fontSize: 42, fontWeight: 700, marginBottom: 40 }}>{title}</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 30, paddingLeft: 40 }}>
        {events.map((event, i) => {
          const progress = spring({ frame: frame - i * 10, fps, config: { damping: 20, stiffness: 100 } });
          return (
            <div key={i} style={{ opacity: progress, transform: `translateX(${(1 - progress) * 30}px)`, display: "flex", gap: 20 }}>
              <div style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: tokens.colors.accent, marginTop: 8, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 16, color: tokens.colors.textMuted }}>{event.date}</div>
                <div style={{ fontSize: 24, fontWeight: 600, marginTop: 4 }}>{event.title}</div>
                {event.description && <div style={{ fontSize: 18, color: tokens.colors.textMuted, marginTop: 4 }}>{event.description}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
