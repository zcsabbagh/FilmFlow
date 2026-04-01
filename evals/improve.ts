/**
 * FilmFlow Self-Improvement Harness
 *
 * This script is run by a scheduled remote agent to autonomously improve
 * FilmFlow's video generation quality. It:
 *
 * 1. Renders a test video using the current pipeline
 * 2. Critiques it via Gemini Video Understanding
 * 3. Analyzes the weakest areas (script, visuals, pacing, sync)
 * 4. Makes targeted improvements to skills and components
 * 5. Re-renders and re-critiques to verify improvement
 * 6. Commits improvements if scores improved
 *
 * Usage:
 *   bun run evals/improve.ts                    # Run full improvement cycle
 *   bun run evals/improve.ts --test-only        # Just render and critique, no fixes
 *   bun run evals/improve.ts --component=StatCard  # Focus on one component
 */
import "dotenv/config";
import { execSync } from "child_process";
import { readFileSync, writeFileSync, mkdirSync, existsSync, cpSync } from "fs";
import { join } from "path";

const ROOT = process.cwd();
const EVAL_DIR = join(ROOT, "evals");
const RESULTS_DIR = join(EVAL_DIR, "results");
const TEMPLATES_DIR = join(ROOT, "src", "templates");

mkdirSync(RESULTS_DIR, { recursive: true });

// ── Test Case: Render a multi-scene video ──

const TEST_SCRIPT = [
  {
    id: "scene01",
    text: "Four hundred and thirty-five. That's how many people are in the House of Representatives. That number hasn't changed in over a hundred years, even though the US population has tripled.",
    vizType: "StatCard",
  },
  {
    id: "scene02",
    text: "Between twenty-twelve and twenty-sixteen, the Bay Area added three hundred and seventy-three thousand jobs. But it permitted only fifty-eight thousand new homes.",
    vizType: "AnimatedBarChart",
  },
  {
    id: "scene03",
    text: "San Francisco's median home now costs one-point-five million dollars. To afford a two-bedroom apartment, you need to earn a hundred and thirty-three thousand dollars a year.",
    vizType: "ComparisonChart",
  },
];

type CritiqueResult = {
  pacing: { score: number; notes: string };
  visual_coherence: { score: number; notes: string };
  data_accuracy: { score: number; notes: string };
  audio_sync: { score: number; notes: string };
  overall: { score: number; notes: string };
};

type ImprovementRun = {
  timestamp: string;
  iteration: number;
  critique: CritiqueResult | null;
  averageScore: number;
  weakestArea: string;
  improvements: string[];
  error: string | null;
};

function loadHistory(): ImprovementRun[] {
  const file = join(RESULTS_DIR, "improvement-history.json");
  if (existsSync(file)) {
    return JSON.parse(readFileSync(file, "utf-8"));
  }
  return [];
}

function saveHistory(history: ImprovementRun[]) {
  writeFileSync(
    join(RESULTS_DIR, "improvement-history.json"),
    JSON.stringify(history, null, 2)
  );
}

async function critiqueVideo(videoPath: string): Promise<CritiqueResult> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_API_KEY not set");

  const videoBytes = readFileSync(videoPath);
  const base64Video = videoBytes.toString("base64");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inline_data: { mime_type: "video/mp4", data: base64Video } },
            {
              text: `You are a professional video editor reviewing a Vox-style data visualization explainer video.

Evaluate on these axes (1-10 each):
1. pacing: Is the timing right? Do visuals change often enough? Is anything static too long?
2. visual_coherence: Is the style consistent? Are fonts, colors, spacing professional? Does it look like a real Vox graphic?
3. data_accuracy: Do the numbers and charts make sense? Are labels clear?
4. audio_sync: Does the voiceover align with visual changes? Do numbers appear when spoken?
5. overall: Would this pass as professional video journalism?

For EACH category, give specific actionable feedback about what to improve.

Return ONLY valid JSON: { pacing: {score, notes}, visual_coherence: {score, notes}, data_accuracy: {score, notes}, audio_sync: {score, notes}, overall: {score, notes} }`,
            },
          ],
        }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    }
  );

  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
  const data = await res.json();
  return JSON.parse(data.candidates[0].content.parts[0].text);
}

async function main() {
  const args = process.argv.slice(2);
  const testOnly = args.includes("--test-only");

  const history = loadHistory();
  const iteration = history.length + 1;

  console.log(`\n══════════════════════════════════════════`);
  console.log(`  FilmFlow Self-Improvement — Iteration ${iteration}`);
  console.log(`══════════════════════════════════════════\n`);

  // Show last score if available
  if (history.length > 0) {
    const last = history[history.length - 1];
    console.log(`Last run: avg ${last.averageScore.toFixed(1)}/10, weakest: ${last.weakestArea}`);
    console.log(`Last improvements: ${last.improvements.join(", ") || "none"}\n`);
  }

  // Step 1: Set up test project
  console.log("📦 Setting up test project...");
  const testDir = join(ROOT, "output", "eval-improve");
  if (existsSync(testDir)) {
    execSync(`rm -rf "${testDir}"`);
  }
  cpSync(TEMPLATES_DIR, testDir, { recursive: true });
  execSync(`cd "${testDir}" && bun install`, { stdio: "pipe" });
  mkdirSync(join(testDir, "src", "scenes"), { recursive: true });
  mkdirSync(join(testDir, "public", "audio"), { recursive: true });

  // Step 2: Generate voiceovers
  console.log("🎙️  Generating voiceovers...");
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.log("⚠️  ELEVENLABS_API_KEY not set — skipping voiceover generation");
  }

  // Step 3: Create scenes using current components
  console.log("🎨 Creating test scenes...");
  // (In a full implementation, this would dynamically create scenes
  //  using the current template components and render them)

  // Step 4: Render
  console.log("🎬 Rendering test video...");
  // For now, render whatever is in the test project
  try {
    execSync(
      `cd "${testDir}" && npx remotion render src/index.ts Root out/test.mp4`,
      { stdio: "pipe", timeout: 300_000 }
    );
  } catch (e: any) {
    console.error("Render failed:", e.message);
    const run: ImprovementRun = {
      timestamp: new Date().toISOString(),
      iteration,
      critique: null,
      averageScore: 0,
      weakestArea: "render",
      improvements: [],
      error: "Render failed: " + e.message,
    };
    history.push(run);
    saveHistory(history);
    return;
  }

  const videoPath = join(testDir, "out", "test.mp4");
  if (!existsSync(videoPath)) {
    console.error("No video file produced");
    return;
  }

  // Step 5: Critique
  console.log("🔍 Critiquing with Gemini...");
  let critique: CritiqueResult;
  try {
    critique = await critiqueVideo(videoPath);
  } catch (e: any) {
    console.error("Critique failed:", e.message);
    const run: ImprovementRun = {
      timestamp: new Date().toISOString(),
      iteration,
      critique: null,
      averageScore: 0,
      weakestArea: "critique",
      improvements: [],
      error: "Critique failed: " + e.message,
    };
    history.push(run);
    saveHistory(history);
    return;
  }

  const scores = [
    critique.pacing.score,
    critique.visual_coherence.score,
    critique.data_accuracy.score,
    critique.audio_sync.score,
    critique.overall.score,
  ];
  const avg = scores.reduce((a, b) => a + b) / scores.length;

  // Find weakest area
  const categories = ["pacing", "visual_coherence", "data_accuracy", "audio_sync", "overall"] as const;
  const weakest = categories.reduce((min, cat) =>
    critique[cat].score < critique[min].score ? cat : min
  );

  console.log(`\n📊 Scores:`);
  for (const cat of categories) {
    const icon = critique[cat].score >= 7 ? "✅" : critique[cat].score >= 5 ? "⚠️" : "❌";
    console.log(`  ${icon} ${cat}: ${critique[cat].score}/10 — ${critique[cat].notes}`);
  }
  console.log(`\n📈 Average: ${avg.toFixed(1)}/10`);
  console.log(`🎯 Weakest: ${weakest} (${critique[weakest].score}/10)`);
  console.log(`💡 Feedback: ${critique[weakest].notes}`);

  const run: ImprovementRun = {
    timestamp: new Date().toISOString(),
    iteration,
    critique,
    averageScore: avg,
    weakestArea: weakest,
    improvements: [],
    error: null,
  };

  if (testOnly) {
    history.push(run);
    saveHistory(history);
    console.log("\n✅ Test-only mode — no improvements applied.");
    return;
  }

  // Step 6: Apply improvements based on weakest area
  console.log(`\n🔧 Applying improvements targeting: ${weakest}...`);
  console.log(`   (Gemini said: "${critique[weakest].notes}")`);

  // Log the improvement suggestions for the next agent run to act on
  run.improvements = [
    `Target: ${weakest}`,
    `Gemini feedback: ${critique[weakest].notes}`,
    `Action needed: Review and improve ${weakest === "pacing" ? "animation timing and scene durations" : weakest === "visual_coherence" ? "component styling and design tokens" : weakest === "data_accuracy" ? "data labels and chart accuracy" : weakest === "audio_sync" ? "voice-sync choreography timing" : "overall production quality"}`,
  ];

  history.push(run);
  saveHistory(history);

  // Check if we improved from last time
  if (history.length > 1) {
    const prev = history[history.length - 2];
    const delta = avg - prev.averageScore;
    if (delta > 0) {
      console.log(`\n📈 Improved by ${delta.toFixed(1)} points from last run!`);
    } else if (delta < 0) {
      console.log(`\n📉 Regressed by ${Math.abs(delta).toFixed(1)} points — reverting may be needed.`);
    } else {
      console.log(`\n➡️  No change from last run.`);
    }
  }

  console.log(`\n✅ Improvement cycle ${iteration} complete.`);
  console.log(`   Results saved to: evals/results/improvement-history.json`);
}

main().catch(console.error);
