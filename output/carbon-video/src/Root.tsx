import { Composition, Sequence } from "remotion";
import { tokens } from "./tokens";
import { Scene as Scene01 } from "./scenes/Scene01-Hook";
import { Scene as Scene02 } from "./scenes/Scene02-Companies";
import { Scene as Scene03 } from "./scenes/Scene03-PerCapita";
import { Scene as Scene04 } from "./scenes/Scene04-Gap";

const SCENES = [
  { component: Scene01, frames: 585 + 30 },
  { component: Scene02, frames: 557 + 30 },
  { component: Scene03, frames: 573 + 30 },
  { component: Scene04, frames: 520 + 30 },
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
