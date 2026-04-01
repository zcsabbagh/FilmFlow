import { Composition } from "remotion";
import { Test as StackedTest } from "./scenes/TestStacked";
import { Test as BubbleTest } from "./scenes/TestBubble";
export const RemotionRoot: React.FC = () => (<>
  <Composition id="Stacked" component={StackedTest} durationInFrames={120} fps={30} width={1920} height={1080} />
  <Composition id="Bubble" component={BubbleTest} durationInFrames={120} fps={30} width={1920} height={1080} />
</>);
