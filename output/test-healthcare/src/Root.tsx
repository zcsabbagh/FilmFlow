import { Composition } from "remotion";
import { tokens } from "./tokens";
import { Scene as Hook } from "./scenes/Scene01-Hook";

export const RemotionRoot: React.FC = () => (
  <Composition id="Root" component={Hook} durationInFrames={950} fps={30} width={tokens.layout.width} height={tokens.layout.height} />
);
