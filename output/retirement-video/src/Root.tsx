import { Composition, Sequence, Audio, staticFile } from "remotion";
import { tokens } from "./tokens";
import { Scene as Intro } from "./scenes/Scene01-Intro";
import { Scene as Interview } from "./scenes/Scene02-Interview";
import { Scene as Stats } from "./scenes/Scene03-Stats";
import { Scene as History } from "./scenes/Scene04-History";
import { Scene as Countries } from "./scenes/Scene05-Countries";
import { Scene as Close } from "./scenes/Scene06-Close";

const SCENES = [
  { component: Intro, frames: 120 },          // 4s punchy intro (shorter!)
  { component: Interview, frames: 300 },      // 10s interview clip
  { component: Stats, frames: 381 + 20 },     // 12.7s stats (tighter padding)
  { component: History, frames: 468 + 20 },   // 15.6s pension history
  { component: Countries, frames: 348 + 20 }, // 11.6s country comparison
  { component: Close, frames: 279 + 20 },     // 9.3s close
];

const TOTAL = SCENES.reduce((s, sc) => s + sc.frames, 0);

const FullVideo: React.FC = () => {
  let offset = 0;
  return (
    <div style={{ width: tokens.layout.width, height: tokens.layout.height }}>
      {/* Background music — plays through entire video at 15% volume */}
      <Audio src={staticFile("audio/background-music.mp3")} volume={0.15} />

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
