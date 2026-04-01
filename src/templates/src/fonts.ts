import { staticFile } from "remotion";
import { continueRender, delayRender } from "remotion";

/**
 * Load custom fonts for FilmFlow videos.
 * Call loadFonts() once at the top level of your composition.
 *
 * Remotion renders each frame in a headless browser, so we need
 * to inject @font-face rules and wait for fonts to load before
 * rendering any frame.
 */
export function loadFonts() {
  const waitForFonts = delayRender("Loading fonts");

  const style = document.createElement("style");
  style.innerHTML = `
    @font-face {
      font-family: 'Playfair Display';
      src: url('${staticFile("fonts/PlayfairDisplay-Regular.ttf")}') format('truetype');
      font-weight: 400;
      font-style: normal;
    }
    @font-face {
      font-family: 'Playfair Display';
      src: url('${staticFile("fonts/PlayfairDisplay-Bold.ttf")}') format('truetype');
      font-weight: 700;
      font-style: normal;
    }
    @font-face {
      font-family: 'Playfair Display';
      src: url('${staticFile("fonts/PlayfairDisplay-Black.ttf")}') format('truetype');
      font-weight: 900;
      font-style: normal;
    }
    @font-face {
      font-family: 'Source Sans 3';
      src: url('${staticFile("fonts/SourceSans3-Regular.ttf")}') format('truetype');
      font-weight: 400;
      font-style: normal;
    }
    @font-face {
      font-family: 'Source Sans 3';
      src: url('${staticFile("fonts/SourceSans3-SemiBold.ttf")}') format('truetype');
      font-weight: 600;
      font-style: normal;
    }
    @font-face {
      font-family: 'Source Sans 3';
      src: url('${staticFile("fonts/SourceSans3-Bold.ttf")}') format('truetype');
      font-weight: 700;
      font-style: normal;
    }
  `;
  document.head.appendChild(style);

  // Wait for all fonts to be ready
  document.fonts.ready.then(() => {
    continueRender(waitForFonts);
  });
}
