import { Composition, Sequence } from "remotion";
import { tokens } from "./tokens";
import { Scene as Scene01 } from "./scenes/Scene01-Hook";
import { Scene as Scene02 } from "./scenes/Scene02-Clip";
import { Scene as Scene03 } from "./scenes/Scene03-Decline";
import { Scene as Scene04 } from "./scenes/Scene04-Headline";
import { Scene as Scene05 } from "./scenes/Scene05-Map";
import { Scene as Scene06 } from "./scenes/Scene06-Photo";
import { Scene as Scene07 } from "./scenes/Scene07-Comparison";
import { Scene as Scene08 } from "./scenes/Scene08-Close";

// Scene durations — voiceover-timed scenes use timing data + padding
// Non-narrated scenes (clip, headline, photo) use fixed durations
const SCENES = [
  { component: Scene01, frames: 601 + 30 },   // Data graphic: $7.25 hook (narrated)
  { component: Scene02, frames: 450 },         // YouTube clip: interview (15s)
  { component: Scene03, frames: 590 + 30 },   // Data graphic: purchasing power decline (narrated)
  { component: Scene04, frames: 240 },         // Headline screenshot (8s)
  { component: Scene05, frames: 537 + 30 },   // Data graphic + map: state wages (narrated)
  { component: Scene06, frames: 300 },         // Photo: Fight for 15 (10s)
  { component: Scene07, frames: 544 + 30 },   // Data graphic: comparison bars (narrated)
  { component: Scene08, frames: 480 },         // Closing clip + end card (16s)
];

const TOTAL = SCENES.reduce((s, sc) => s + sc.frames, 0);

const FullVideo: React.FC = () => {
  let offset = 0;
  return (
    <div style={{ width: tokens.layout.width, height: tokens.layout.height }}>
      {SCENES.map((s, i) => {
        const from = offset;
        offset += s.frames;
        const C = s.component;
        return <Sequence key={i} from={from} durationInFrames={s.frames}><C /></Sequence>;
      })}
    </div>
  );
};

export const RemotionRoot: React.FC = () => (
  <Composition id="Root" component={FullVideo} durationInFrames={TOTAL} fps={30} width={tokens.layout.width} height={tokens.layout.height} />
);
