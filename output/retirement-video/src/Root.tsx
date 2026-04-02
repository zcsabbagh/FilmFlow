import { Composition, Sequence } from "remotion";
import { tokens } from "./tokens";
import { Scene as Scene01 } from "./scenes/Scene01-Hook";
import { Scene as Scene02 } from "./scenes/Scene02-History";
import { Scene as Scene03 } from "./scenes/Scene03-Data";
import { Scene as Scene04 } from "./scenes/Scene04-International";
import { Scene as Scene05 } from "./scenes/Scene05-Close";

const SCENES = [
  { component: Scene01, frames: 547 + 30 },   // 18.2s British v3
  { component: Scene02, frames: 777 + 30 },   // 25.9s
  { component: Scene03, frames: 625 + 30 },   // 20.8s
  { component: Scene04, frames: 657 + 30 },   // 21.9s
  { component: Scene05, frames: 432 + 30 },   // 14.4s
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
