import { Composition } from "remotion";
import { tokens } from "./tokens";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Root"
        component={() => (
          <div
            style={{
              width: tokens.layout.width,
              height: tokens.layout.height,
              backgroundColor: tokens.colors.background,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: tokens.colors.text,
              fontFamily: tokens.fonts.heading,
              fontSize: 48,
            }}
          >
            FilmFlow — No scenes added yet
          </div>
        )}
        durationInFrames={150}
        fps={30}
        width={tokens.layout.width}
        height={tokens.layout.height}
      />
    </>
  );
};
