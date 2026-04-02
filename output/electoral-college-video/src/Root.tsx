import { Composition, Sequence, Audio, staticFile } from "remotion";
import { tokens } from "./tokens";
// Font imports trigger @remotion/google-fonts loading
import "./fonts";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2History } from "./scenes/Scene2History";
import { Scene3Map } from "./scenes/Scene3Map";
import { Scene4Math } from "./scenes/Scene4Math";
import { Scene5Failures } from "./scenes/Scene5Failures";
import { Scene6Interview } from "./scenes/Scene6Interview";
import { Scene7Closing } from "./scenes/Scene7Closing";

/**
 * Scene durations (from voiceover timing + 20 frame padding):
 * Scene 1 Hook:       139 + 20 = 159 frames (~5.3s)
 * Scene 2 History:    417 + 20 = 437 frames (~14.6s)
 * Scene 3 Map:        495 + 20 = 515 frames (~17.2s)
 * Scene 4 Math:       410 + 20 = 430 frames (~14.3s)
 * Scene 5 Failures:   433 + 20 = 453 frames (~15.1s)
 * Scene 6 Interview:  120 frames (4s, video clip)
 * Scene 7 Closing:    302 + 20 = 322 frames (~10.7s)
 *
 * Total: 2436 frames (~81.2s = ~1:21)
 */

const SCENE_DURATIONS = {
  scene1: 159,
  scene2: 437,
  scene3: 515,
  scene4: 430,
  scene5: 453,
  scene6: 120,
  scene7: 322,
};

const TOTAL_FRAMES = Object.values(SCENE_DURATIONS).reduce((a, b) => a + b, 0);

// Cumulative start frames
const STARTS = {
  scene1: 0,
  scene2: SCENE_DURATIONS.scene1,
  scene3: SCENE_DURATIONS.scene1 + SCENE_DURATIONS.scene2,
  scene4: SCENE_DURATIONS.scene1 + SCENE_DURATIONS.scene2 + SCENE_DURATIONS.scene3,
  scene5: SCENE_DURATIONS.scene1 + SCENE_DURATIONS.scene2 + SCENE_DURATIONS.scene3 + SCENE_DURATIONS.scene4,
  scene6: SCENE_DURATIONS.scene1 + SCENE_DURATIONS.scene2 + SCENE_DURATIONS.scene3 + SCENE_DURATIONS.scene4 + SCENE_DURATIONS.scene5,
  scene7: SCENE_DURATIONS.scene1 + SCENE_DURATIONS.scene2 + SCENE_DURATIONS.scene3 + SCENE_DURATIONS.scene4 + SCENE_DURATIONS.scene5 + SCENE_DURATIONS.scene6,
};

const MainVideo: React.FC = () => {
  // Fonts loaded via @remotion/google-fonts imports in fonts.ts

  return (
    <div
      style={{
        width: tokens.layout.width,
        height: tokens.layout.height,
        backgroundColor: tokens.colors.background,
      }}
    >
      {/* Background music — continuous throughout */}
      <Audio src={staticFile("audio/background-music.mp3")} volume={0.40} />

      {/* Scene 1: Hook */}
      <Sequence from={STARTS.scene1} durationInFrames={SCENE_DURATIONS.scene1}>
        <Scene1Hook />
        <Audio src={staticFile("audio/scene1-hook.mp3")} />
      </Sequence>

      {/* Scene 2: History */}
      <Sequence from={STARTS.scene2} durationInFrames={SCENE_DURATIONS.scene2}>
        <Scene2History />
        <Audio src={staticFile("audio/scene2-history.mp3")} />
      </Sequence>

      {/* Scene 3: Map Problem */}
      <Sequence from={STARTS.scene3} durationInFrames={SCENE_DURATIONS.scene3}>
        <Scene3Map />
        <Audio src={staticFile("audio/scene3-map.mp3")} />
      </Sequence>

      {/* Scene 4: The Math */}
      <Sequence from={STARTS.scene4} durationInFrames={SCENE_DURATIONS.scene4}>
        <Scene4Math />
        <Audio src={staticFile("audio/scene4-math.mp3")} />
      </Sequence>

      {/* Scene 5: Five Failures */}
      <Sequence from={STARTS.scene5} durationInFrames={SCENE_DURATIONS.scene5}>
        <Scene5Failures />
        <Audio src={staticFile("audio/scene5-failures.mp3")} />
      </Sequence>

      {/* Scene 6: Interview Clip */}
      <Sequence from={STARTS.scene6} durationInFrames={SCENE_DURATIONS.scene6}>
        <Scene6Interview />
      </Sequence>

      {/* Scene 7: Closing */}
      <Sequence from={STARTS.scene7} durationInFrames={SCENE_DURATIONS.scene7}>
        <Scene7Closing />
        <Audio src={staticFile("audio/scene7-closing.mp3")} />
      </Sequence>
    </div>
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Root"
        component={MainVideo}
        durationInFrames={TOTAL_FRAMES}
        fps={30}
        width={tokens.layout.width}
        height={tokens.layout.height}
      />
    </>
  );
};
