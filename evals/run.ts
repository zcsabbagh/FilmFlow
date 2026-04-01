/**
 * FilmFlow Eval Runner
 *
 * Runs test cases through the FilmFlow agent, renders videos,
 * sends them to Gemini for critique, and tracks scores over time.
 *
 * Usage:
 *   bun run evals/run.ts              # Run all test cases
 *   bun run evals/run.ts stat-card    # Run a single test case
 *   bun run evals/run.ts --list       # List all test cases
 */
import "dotenv/config";
import { query, createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "fs";
import { join } from "path";
import { TEST_CASES, type TestCase } from "./test-cases/cases.js";
import { critiqueVideo, type VideoCritique } from "../src/lib/gemini.js";

// Import all tools (same as agent.ts)
import { youtubeSearchTool } from "../src/tools/research/youtube-search.js";
import { youtubeTranscriptTool } from "../src/tools/research/youtube-transcript.js";
import { datasetSearchTool } from "../src/tools/research/dataset-search.js";
import { scrapeTableTool } from "../src/tools/research/scrape-table.js";
import { indexVideoTool } from "../src/tools/visual-search/index-video.js";
import { visualSearchTool } from "../src/tools/visual-search/visual-search.js";
import { clipYoutubeTool } from "../src/tools/assets/clip-youtube.js";
import { generateVoiceoverTool } from "../src/tools/assets/generate-voiceover.js";
import { processDatasetTool } from "../src/tools/assets/process-dataset.js";
import { createSceneTool } from "../src/tools/composition/create-scene.js";
import { createDataVizTool } from "../src/tools/composition/create-data-viz.js";
import { addToTimelineTool } from "../src/tools/composition/add-to-timeline.js";
import { previewSceneTool } from "../src/tools/composition/preview-scene.js";
import { renderVideoTool } from "../src/tools/render/render-video.js";
import { critiqueVideoTool } from "../src/tools/render/critique-video.js";

type EvalResult = {
  testId: string;
  timestamp: string;
  iteration: number;
  critique: VideoCritique | null;
  averageScore: number;
  passed: boolean;
  videoPath: string | null;
  error: string | null;
};

const RESULTS_DIR = join(import.meta.dir, "results");
const MAX_ITERATIONS = 3; // Max self-improvement loops per test case

function getResultsFile(testId: string): string {
  return join(RESULTS_DIR, `${testId}.json`);
}

function loadResults(testId: string): EvalResult[] {
  const file = getResultsFile(testId);
  if (existsSync(file)) {
    return JSON.parse(readFileSync(file, "utf-8"));
  }
  return [];
}

function saveResult(testId: string, result: EvalResult) {
  const results = loadResults(testId);
  results.push(result);
  writeFileSync(getResultsFile(testId), JSON.stringify(results, null, 2));
}

async function runTestCase(testCase: TestCase): Promise<EvalResult> {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`📋 Running: ${testCase.name} (${testCase.id})`);
  console.log(`${"=".repeat(60)}\n`);

  const filmflowTools = createSdkMcpServer({
    name: "filmflow-tools",
    tools: [
      youtubeSearchTool, youtubeTranscriptTool, datasetSearchTool, scrapeTableTool,
      indexVideoTool, visualSearchTool,
      clipYoutubeTool, generateVoiceoverTool, processDatasetTool,
      createSceneTool, createDataVizTool, addToTimelineTool, previewSceneTool,
      renderVideoTool, critiqueVideoTool,
    ],
  });

  const evalPrompt = `You are running an eval test case. Skip research/plan mode — go directly to EXECUTE MODE.

${testCase.prompt}

IMPORTANT:
- The Remotion template is at: ${join(process.cwd(), "src/templates")}
- Copy it to: ${join(process.cwd(), "output/eval-" + testCase.id)}
- Create the scene(s), set up Root.tsx with registerRoot, install deps, and render to MP4.
- The entry point must have registerRoot() — create src/index.ts with:
  import { registerRoot } from "remotion";
  import { RemotionRoot } from "./Root";
  registerRoot(RemotionRoot);
- Use: npx remotion render src/index.ts Root out/video.mp4
- Output the final video path when done.`;

  try {
    let result = "";
    for await (const message of query({
      prompt: evalPrompt,
      options: {
        systemPrompt: "You are FilmFlow, an AI video production agent. Execute the given task directly — create scenes, compose timeline, render video. No planning mode needed.",
        cwd: process.cwd(),
        allowedTools: ["Read", "Write", "Edit", "Bash", "Glob", "Grep"],
        mcpServers: { "filmflow-tools": filmflowTools },
        permissionMode: "bypassPermissions",
        allowDangerouslySkipPermissions: true,
        maxTurns: 50,
      },
    })) {
      if ("result" in message) {
        result = message.result;
        console.log(result);
      }
    }

    // Find the rendered video
    const videoPath = join(process.cwd(), "output", `eval-${testCase.id}`, "out", "video.mp4");

    if (!existsSync(videoPath)) {
      return {
        testId: testCase.id,
        timestamp: new Date().toISOString(),
        iteration: loadResults(testCase.id).length + 1,
        critique: null,
        averageScore: 0,
        passed: false,
        videoPath: null,
        error: "Video not rendered — file not found",
      };
    }

    // Critique with Gemini
    const apiKey = process.env.GOOGLE_API_KEY;
    let critique: VideoCritique | null = null;
    let avgScore = 0;

    if (apiKey) {
      critique = await critiqueVideo(videoPath, apiKey);
      avgScore = (
        critique.pacing.score +
        critique.visual_coherence.score +
        critique.data_accuracy.score +
        critique.audio_sync.score +
        critique.overall.score
      ) / 5;
      console.log(`\n📊 Scores: pacing=${critique.pacing.score} visual=${critique.visual_coherence.score} data=${critique.data_accuracy.score} audio=${critique.audio_sync.score} overall=${critique.overall.score}`);
      console.log(`📈 Average: ${avgScore.toFixed(1)} / 10 (target: ${testCase.targetScore})`);
    } else {
      console.log("⚠️  GOOGLE_API_KEY not set — skipping Gemini critique");
    }

    const evalResult: EvalResult = {
      testId: testCase.id,
      timestamp: new Date().toISOString(),
      iteration: loadResults(testCase.id).length + 1,
      critique,
      averageScore: avgScore,
      passed: avgScore >= testCase.targetScore,
      videoPath,
      error: null,
    };

    saveResult(testCase.id, evalResult);
    return evalResult;
  } catch (e: any) {
    const evalResult: EvalResult = {
      testId: testCase.id,
      timestamp: new Date().toISOString(),
      iteration: loadResults(testCase.id).length + 1,
      critique: null,
      averageScore: 0,
      passed: false,
      videoPath: null,
      error: e.message,
    };
    saveResult(testCase.id, evalResult);
    return evalResult;
  }
}

// Main
const args = process.argv.slice(2);

if (args.includes("--list")) {
  console.log("\nFilmFlow Eval Test Cases:\n");
  for (const tc of TEST_CASES) {
    const results = loadResults(tc.id);
    const lastScore = results.length > 0 ? results[results.length - 1].averageScore.toFixed(1) : "—";
    const status = results.length > 0 && results[results.length - 1].passed ? "✅" : "⬜";
    console.log(`  ${status} ${tc.id.padEnd(20)} ${tc.name.padEnd(30)} Score: ${lastScore}`);
  }
  process.exit(0);
}

mkdirSync(RESULTS_DIR, { recursive: true });

const targetId = args[0];
const cases = targetId
  ? TEST_CASES.filter((tc) => tc.id === targetId)
  : TEST_CASES;

if (cases.length === 0) {
  console.error(`Unknown test case: ${targetId}`);
  console.error(`Available: ${TEST_CASES.map((tc) => tc.id).join(", ")}`);
  process.exit(1);
}

console.log(`\n🎬 FilmFlow Eval Runner — ${cases.length} test case(s)\n`);

const results: EvalResult[] = [];
for (const tc of cases) {
  const result = await runTestCase(tc);
  results.push(result);
}

// Summary
console.log(`\n${"=".repeat(60)}`);
console.log("📊 EVAL SUMMARY");
console.log(`${"=".repeat(60)}\n`);

for (const r of results) {
  const icon = r.passed ? "✅" : r.error ? "❌" : "⚠️";
  console.log(`  ${icon} ${r.testId.padEnd(20)} Score: ${r.averageScore.toFixed(1)} / 10  ${r.error || ""}`);
}

const passed = results.filter((r) => r.passed).length;
console.log(`\n  ${passed}/${results.length} passed\n`);
