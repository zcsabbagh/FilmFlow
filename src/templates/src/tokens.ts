export const tokens = {
  colors: {
    primary: "#1a1a2e",
    accent: "#e94560",
    secondary: "#0f3460",
    background: "#16213e",
    text: "#eeeeee",
    textMuted: "#aaaaaa",
    chart: ["#e94560", "#0f3460", "#533483", "#48c9b0", "#f39c12", "#3498db"],
  },
  fonts: {
    heading: "Inter",
    body: "Inter",
    mono: "JetBrains Mono",
  },
  animation: {
    easeIn: [0.4, 0, 1, 1] as const,
    easeOut: [0, 0, 0.2, 1] as const,
    easeInOut: [0.4, 0, 0.2, 1] as const,
  },
  layout: {
    width: 1920,
    height: 1080,
    padding: 80,
  },
} as const;
