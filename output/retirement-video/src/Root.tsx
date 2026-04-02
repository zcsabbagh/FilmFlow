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

// TIGHT timing — narration durationFrames + 15 (0.5s buffer), NO dead air
// Interview clips: match exact clip duration in frames
const SCENES = [
  { component: Intro, frames: 113 + 15 },       // 3.7s intro narration
  { component: Interview1, frames: 130 },        // 4.3s clip (crisis-intro is 4.04s)
  { component: Stats, frames: 316 + 15 },        // 10.5s stats narration
  { component: Interview2, frames: 160 },        // 5.3s clip (60min-saving is 5.01s)
  { component: History, frames: 462 + 15 },      // 15.4s history narration
  { component: Interview3, frames: 130 },        // 4.3s clip (401k-pension is 4.01s)
  { component: Countries, frames: 394 + 15 },    // 13.1s comparison narration
  { component: Close, frames: 264 + 15 },        // 8.8s close narration
];

const TOTAL = SCENES.reduce((s, sc) => s + sc.frames, 0);
// Total: ~65s = ~1:05

const FullVideo: React.FC = () => {
  let offset = 0;
  return (
    <div style={{ width: tokens.layout.width, height: tokens.layout.height }}>
      {/* Background music at 20% */}
      <Audio src={staticFile("audio/background-music.mp3")} volume={0.20} />

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
