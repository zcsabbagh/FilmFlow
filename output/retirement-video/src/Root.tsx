import { Composition, Sequence, Audio, staticFile } from "remotion";
import { tokens } from "./tokens";
import { Scene as Intro } from "./scenes/Scene01-Intro";
import { Scene as Interview1 } from "./scenes/Scene02-Interview";
import { Scene as Stats } from "./scenes/Scene03-Stats";
import { Scene as Interview2 } from "./scenes/Scene04-Interview2";
import { Scene as History } from "./scenes/Scene05-History";
import { Scene as Interview3 } from "./scenes/Scene06-Interview3";
import { Scene as Countries } from "./scenes/Scene07-Countries";
import { Scene as Close } from "./scenes/Scene08-Close";

const SCENES = [
  { component: Intro, frames: 93 },           // 3.1s — intro hook
  { component: Interview1, frames: 135 },      // 4.5s — "retirement crisis" clip
  { component: Stats, frames: 225 },           // 7.5s — $212K stats
  { component: Interview2, frames: 165 },      // 5.5s — 60 Minutes clip
  { component: History, frames: 322 },         // 10.7s — pension history
  { component: Interview3, frames: 135 },      // 4.5s — CNBC 401k clip
  { component: Countries, frames: 231 },       // 7.7s — country comparison
  { component: Close, frames: 165 },           // 5.5s — closing stats
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
