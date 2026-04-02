import { Composition } from "remotion";
import { Test as StackedTest } from "./scenes/TestStacked";
import { Test as BubbleTest } from "./scenes/TestBubble";
import { Test as LollipopTest } from "./scenes/TestLollipop";
import { Test as DumbbellTest } from "./scenes/TestDumbbell";
import { Test as AreaTest } from "./scenes/TestArea";
export const RemotionRoot: React.FC = () => (<>
  <Composition id="Stacked" component={StackedTest} durationInFrames={120} fps={30} width={1920} height={1080} />
  <Composition id="Bubble" component={BubbleTest} durationInFrames={120} fps={30} width={1920} height={1080} />
  <Composition id="Lollipop" component={LollipopTest} durationInFrames={120} fps={30} width={1920} height={1080} />
  <Composition id="Dumbbell" component={DumbbellTest} durationInFrames={120} fps={30} width={1920} height={1080} />
  <Composition id="Area" component={AreaTest} durationInFrames={120} fps={30} width={1920} height={1080} />
</>);
