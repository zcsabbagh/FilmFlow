import { Composition, Sequence } from "remotion";
import { tokens } from "./tokens";
import { Scene as Scene01 } from "./scenes/Scene01-Hook";
import { Scene as Scene02 } from "./scenes/Scene02-Data";
import { Scene as Scene03 } from "./scenes/Scene03-Zoning";
import { Scene as Scene04 } from "./scenes/Scene04-Cost";
import { Scene as Scene05 } from "./scenes/Scene05-Failure";
import { Scene as Scene06 } from "./scenes/Scene06-Close";

const SCENES = [
  { component: Scene01, frames: 857 + 30 },
  { component: Scene02, frames: 825 + 30 },
  { component: Scene03, frames: 710 + 30 },
  { component: Scene04, frames: 726 + 30 },
  { component: Scene05, frames: 544 + 30 },
  { component: Scene06, frames: 292 + 600 + 30 },  // voiceover + 20s interview clip
];

const TOTAL_FRAMES = SCENES.reduce((sum, s) => sum + s.frames, 0);

const FullVideo: React.FC = () => {
  let offset = 0;
  return (
    <div style={{ width: tokens.layout.width, height: tokens.layout.height }}>
      {SCENES.map((scene, i) => {
        const from = offset;
        offset += scene.frames;
        const SceneComponent = scene.component;
        return (
          <Sequence key={i} from={from} durationInFrames={scene.frames}>
            <SceneComponent />
          </Sequence>
        );
      })}
    </div>
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Root"
      component={FullVideo}
      durationInFrames={TOTAL_FRAMES}
      fps={30}
      width={tokens.layout.width}
      height={tokens.layout.height}
    />
  );
};
