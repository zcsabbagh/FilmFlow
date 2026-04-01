import { Composition } from "remotion";
import { useEffect } from "react";
import { tokens } from "./tokens";
import { loadFonts } from "./fonts";

const Placeholder: React.FC = () => {
  useEffect(() => { loadFonts(); }, []);

  return (
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
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Root"
      component={Placeholder}
      durationInFrames={150}
      fps={30}
      width={tokens.layout.width}
      height={tokens.layout.height}
    />
  );
};
