import { fonts as loadedFonts } from "./fonts";

export const tokens = {
  colors: {
    // Vox uses warm paper-white backgrounds
    primary: "#2b2b2b",        // dark charcoal for primary text
    accent: "#e8a87c",         // salmon/coral — Vox's signature data point color
    secondary: "#c0392b",      // muted red for emphasis
    background: "#f5f3ef",     // warm off-white paper
    backgroundAlt: "#ebe8e2",  // slightly darker for contrast sections
    text: "#3d3d3d",           // dark charcoal, not pure black
    textMuted: "#8a8a8a",      // gray for captions, sources, axis labels
    textLight: "#b0b0b0",      // very light gray for subtle elements
    // Chart palette — muted, editorial
    chart: [
      "#e8a87c",  // salmon/coral (primary)
      "#5b7e96",  // slate blue
      "#c0392b",  // muted red
      "#7f8c8d",  // medium gray
      "#2c3e50",  // dark navy
      "#27ae60",  // muted green
    ],
    // Political palette (for election-style charts)
    political: {
      democrat: "#4a6fa5",     // slate blue
      republican: "#c0392b",  // muted red
      independent: "#95a5a6", // gray
    },
  },
  fonts: {
    heading: loadedFonts.heading,  // Playfair Display via @remotion/google-fonts
    body: loadedFonts.body,        // Source Sans 3 via @remotion/google-fonts
    mono: "JetBrains Mono",
  },
  fontWeights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 900,  // for oversized call-out numbers like "80%"
  },
  animation: {
    easeIn: [0.4, 0, 1, 1] as const,
    easeOut: [0, 0, 0.2, 1] as const,
    easeInOut: [0.4, 0, 0.2, 1] as const,
  },
  layout: {
    width: 1920,
    height: 1080,
    padding: 100,      // more breathing room like Vox
    chartPadding: 60,  // internal chart padding
  },
  chart: {
    lineWidth: 4,       // thick lines like Vox
    dotRadius: 8,       // large dots at data points
    dotRadiusSmall: 5,  // smaller dots for dense charts
    barRadius: 0,       // Vox uses sharp corners on bars
    barGap: 4,          // tight gap in stacked bars
  },
} as const;
