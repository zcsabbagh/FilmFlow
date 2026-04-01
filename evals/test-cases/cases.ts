/**
 * Eval test case definitions.
 * Each case provides a prompt for the agent and metadata for scoring.
 */
export type TestCase = {
  id: string;
  name: string;
  description: string;
  prompt: string;
  expectedVizTypes: string[];
  targetScore: number;
  maxDurationSeconds: number;
};

export const TEST_CASES: TestCase[] = [
  {
    id: "stat-card",
    name: "StatCard Animation",
    description: "Render a single StatCard with an animated number counter",
    prompt: "Create a 6-second video with a single StatCard showing '$1.3M' as the median home price in San Francisco, with subtitle 'More than 3x the national average' and source 'Zillow, 2024'.",
    expectedVizTypes: ["StatCard"],
    targetScore: 7,
    maxDurationSeconds: 6,
  },
  {
    id: "bar-chart",
    name: "Bar Chart Comparison",
    description: "Render an AnimatedBarChart comparing 5+ categories",
    prompt: "Create a 10-second video with an AnimatedBarChart showing median home prices: San Francisco ($1.3M), New York ($680K), Los Angeles ($920K), Houston ($320K), Chicago ($310K). Title: 'Median Home Prices by City'. Source: 'Zillow, 2024'.",
    expectedVizTypes: ["AnimatedBarChart"],
    targetScore: 7,
    maxDurationSeconds: 10,
  },
  {
    id: "line-chart",
    name: "Line Chart Trend",
    description: "Render an AnimatedLineChart showing a trend over time",
    prompt: "Create a 10-second video with an AnimatedLineChart showing SF median home prices from 2010-2024: 2010: $700K, 2012: $600K, 2014: $900K, 2016: $1.1M, 2018: $1.3M, 2020: $1.4M, 2022: $1.5M, 2024: $1.3M. Title: 'San Francisco Home Prices Over Time'.",
    expectedVizTypes: ["AnimatedLineChart"],
    targetScore: 7,
    maxDurationSeconds: 10,
  },
  {
    id: "comparison",
    name: "Comparison Chart",
    description: "Render a ComparisonChart showing A vs B",
    prompt: "Create an 8-second video with a ComparisonChart: SF builds 3,000 housing units/year vs Tokyo builds 140,000 units/year. Title: 'Annual Housing Construction'. Unit: ' units/yr'.",
    expectedVizTypes: ["ComparisonChart"],
    targetScore: 7,
    maxDurationSeconds: 8,
  },
  {
    id: "timeline",
    name: "Animated Timeline",
    description: "Render an AnimatedTimeline with 5+ chronological events",
    prompt: "Create a 12-second video with an AnimatedTimeline of SF housing history: 1978 Prop 13 passed, 1986 Height limits enacted, 1995 Costa-Hawkins Act, 2012 Tech boom begins, 2021 SB 9 legalizes duplexes, 2024 SB 423 streamlines permits. Title: 'History of SF Housing Policy'.",
    expectedVizTypes: ["AnimatedTimeline"],
    targetScore: 7,
    maxDurationSeconds: 12,
  },
  {
    id: "choropleth",
    name: "Choropleth Map",
    description: "Render a ChoroplethMap with state-level data",
    prompt: "Create an 8-second video with a ChoroplethMap showing housing affordability by state. Highlight CA, NY, HI, MA, WA as most expensive. Title: 'Least Affordable States for Housing'.",
    expectedVizTypes: ["ChoroplethMap"],
    targetScore: 7,
    maxDurationSeconds: 8,
  },
  {
    id: "multi-scene",
    name: "Multi-Scene Composition",
    description: "Compose 3 scenes with transitions into one video",
    prompt: "Create a 20-second video with 3 scenes: Scene 1 (6s): StatCard '$1.3M median home price'. Scene 2 (8s): AnimatedBarChart of 5 cities. Scene 3 (6s): closing text 'The housing crisis is a choice'. Smooth transitions between scenes.",
    expectedVizTypes: ["StatCard", "AnimatedBarChart"],
    targetScore: 7,
    maxDurationSeconds: 20,
  },
  {
    id: "narration-sync",
    name: "Narration + Data Viz",
    description: "Data viz scene synced with ElevenLabs voiceover",
    prompt: "Create a 15-second video: AnimatedBarChart of housing costs with voiceover narration saying 'The median home in San Francisco costs one point three million dollars, three times the national average.' Sync the chart animation with the narration timing.",
    expectedVizTypes: ["AnimatedBarChart"],
    targetScore: 7,
    maxDurationSeconds: 15,
  },
  {
    id: "mini-explainer",
    name: "Mini Explainer",
    description: "Full 2-minute explainer video with multiple scenes",
    prompt: "Create a 2-minute explainer video about why San Francisco housing is so expensive. Include: a hook with key stat, a timeline of how we got here, a chart showing jobs vs housing, and a closing stat. Use voiceover narration.",
    expectedVizTypes: ["StatCard", "AnimatedTimeline", "AnimatedBarChart"],
    targetScore: 7,
    maxDurationSeconds: 120,
  },
  {
    id: "complex-multi-viz",
    name: "Complex Multi-Viz",
    description: "Video using 4+ different visualization types",
    prompt: "Create a 30-second video showcasing 4 viz types: StatCard (key number), AnimatedBarChart (comparison), AnimatedLineChart (trend), ComparisonChart (A vs B). Each gets 7 seconds. Topic: climate change data.",
    expectedVizTypes: ["StatCard", "AnimatedBarChart", "AnimatedLineChart", "ComparisonChart"],
    targetScore: 7,
    maxDurationSeconds: 30,
  },
];
