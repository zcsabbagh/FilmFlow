import { Composition, Sequence, Audio, staticFile } from "remotion";
import { tokens } from "./tokens";
import { Scene as Intro } from "./scenes/Scene00-Intro";
import { Scene as Interview } from "./scenes/SceneInterview";
import { Scene as Hook } from "./scenes/Scene01-Hook";
import { Scene as Companies } from "./scenes/Scene02-Companies";
import { Scene as PerCapita } from "./scenes/Scene03-PerCapita";
import { Scene as Gap } from "./scenes/Scene04-Gap";

// Frame counts based on ElevenLabs word timing + 2s padding
const SCENES = [
  { component: Intro, frames: 163 },         // 5.4s intro collage
  { component: Interview, frames: 150 },      // 5s interview clip (rounded rect)
  { component: Hook, frames: 480 },           // 16s cascading numbers
  { component: Companies, frames: 544 },      // 18.1s bubble chart
  { component: PerCapita, frames: 542 },      // 18.1s per capita bars
  { component: Gap, frames: 437 },            // 14.6s promise vs reality
];

const TOTAL = SCENES.reduce((s, sc) => s + sc.frames, 0);

const FullVideo: React.FC = () => {
  let offset = 0;
  return (
    <div style={{ width: tokens.layout.width, height: tokens.layout.height }}>
      {/* Background music at 15% volume across entire video */}
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
