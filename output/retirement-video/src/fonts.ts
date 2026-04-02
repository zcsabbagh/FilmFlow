import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadSourceSans } from "@remotion/google-fonts/SourceSans3";

const { fontFamily: playfairFamily } = loadPlayfair();
const { fontFamily: sourceSansFamily } = loadSourceSans();

/**
 * Actual loaded font family strings from @remotion/google-fonts.
 * Use these instead of raw "Playfair Display" / "Source Sans 3" strings.
 */
export const fonts = {
  heading: playfairFamily,
  body: sourceSansFamily,
} as const;
