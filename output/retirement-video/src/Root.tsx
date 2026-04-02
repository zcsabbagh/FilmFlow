import { Composition, Sequence } from "remotion";
import { tokens } from "./tokens";
import { Scene as Intro } from "./scenes/Scene01-Intro";
import { Scene as Interview } from "./scenes/Scene02-Interview";
import { Scene as Stats } from "./scenes/Scene03-Stats";
import { Scene as History } from "./scenes/Scene04-History";
import { Scene as Countries } from "./scenes/Scene05-Countries";
import { Scene as Close } from "./scenes/Scene06-Close";

// Punchy structure: intro → interview → stats → history → comparison → close
const SCENES = [
  { component: Intro, frames: 150 },         // 5s intro montage
  { component: Interview, frames: 300 },     // 10s interview clip
  { component: Stats, frames: 381 + 30 },    // 12.7s stats
  { component: History, frames: 468 + 30 },  // 15.6s pension history
  { component: Countries, frames: 348 + 30 },// 11.6s country comparison
  { component: Close, frames: 279 + 30 },    // 9.3s close
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
