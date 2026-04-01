import { query, createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";
import { mkdirSync, readFileSync } from "fs";
import { join } from "path";

// Research tools
import { youtubeSearchTool } from "./tools/research/youtube-search.js";
import { youtubeTranscriptTool } from "./tools/research/youtube-transcript.js";
import { datasetSearchTool } from "./tools/research/dataset-search.js";
import { scrapeTableTool } from "./tools/research/scrape-table.js";
import { wikimediaImageTool } from "./tools/research/wikimedia-image.js";
import { headlineScreenshotTool } from "./tools/research/headline-screenshot.js";

// Visual search tools
import { indexVideoTool } from "./tools/visual-search/index-video.js";
import { visualSearchTool } from "./tools/visual-search/visual-search.js";

// Asset tools
import { clipYoutubeTool } from "./tools/assets/clip-youtube.js";
import { generateVoiceoverTool } from "./tools/assets/generate-voiceover.js";
import { processDatasetTool } from "./tools/assets/process-dataset.js";

// Composition tools
import { createSceneTool } from "./tools/composition/create-scene.js";
import { createDataVizTool } from "./tools/composition/create-data-viz.js";
import { addToTimelineTool } from "./tools/composition/add-to-timeline.js";
import { previewSceneTool } from "./tools/composition/preview-scene.js";

// Render tools
import { renderVideoTool } from "./tools/render/render-video.js";
import { critiqueVideoTool } from "./tools/render/critique-video.js";

// Load skills from .claude/skills/ at startup
function loadSkills(): string {
  const skillsDir = join(process.cwd(), ".claude", "skills");
  const skillFiles = ["research.md", "scriptwriting.md", "data-visualization.md", "video-production.md"];

  const skills = skillFiles.map((file) => {
    try {
      return readFileSync(join(skillsDir, file), "utf-8");
    } catch {
      return `[Skill ${file} not found]`;
    }
  });

  return skills.join("\n\n---\n\n");
}

const SYSTEM_PROMPT = `You are FilmFlow, an AI video journalist that creates Vox-style explainer videos.

You have access to powerful tools for researching topics, finding footage, processing data,
creating visualizations, and rendering videos. Each video you create is a Remotion project.

You follow three core skills that define your production quality. Read them carefully — they are
your playbook for every video you create.

${loadSkills()}
`;

type AskUserFn = (question: string) => Promise<string>;

function getSharedOptions() {
  const filmflowTools = createSdkMcpServer({
    name: "filmflow-tools",
    tools: [
      // Research
      youtubeSearchTool,
      youtubeTranscriptTool,
      datasetSearchTool,
      scrapeTableTool,
      wikimediaImageTool,
      headlineScreenshotTool,
      // Visual search
      indexVideoTool,
      visualSearchTool,
      // Assets
      clipYoutubeTool,
      generateVoiceoverTool,
      processDatasetTool,
      // Composition
      createSceneTool,
      createDataVizTool,
      addToTimelineTool,
      previewSceneTool,
      // Render
      renderVideoTool,
      critiqueVideoTool,
    ],
  });

  return {
    systemPrompt: SYSTEM_PROMPT,
    cwd: process.cwd(),
    allowedTools: [
      "Read", "Write", "Edit", "Bash", "Glob", "Grep",
      "WebSearch", "WebFetch",
    ],
    mcpServers: {
      "filmflow-tools": filmflowTools,
    },
    permissionMode: "bypassPermissions" as const,
    allowDangerouslySkipPermissions: true,
    maxTurns: 200,
  };
}

async function runQuery(prompt: string, options: ReturnType<typeof getSharedOptions> & { resume?: string }): Promise<string | undefined> {
  let sessionId: string | undefined;

  for await (const message of query({ prompt, options })) {
    // Capture session ID from init message
    if (message.type === "system" && message.subtype === "init") {
      sessionId = message.session_id;
    }
    if ("result" in message) {
      console.log(message.result);
    }
  }

  return sessionId;
}

export async function runAgent(prompt: string, askUser: AskUserFn) {
  const outputDir = join(process.cwd(), "output");
  mkdirSync(outputDir, { recursive: true });

  const options = getSharedOptions();

  // First turn: send the initial prompt
  console.log("\n🎬 FilmFlow — starting...\n");
  const sessionId = await runQuery(prompt, options);

  if (!sessionId) {
    console.error("Failed to get session ID");
    return;
  }

  console.log(`\n📎 Session: ${sessionId}\n`);

  // Interactive loop: resume the session with user follow-ups
  while (true) {
    const response = await askUser("\n> ");
    const trimmed = response.trim().toLowerCase();

    if (trimmed === "exit" || trimmed === "quit" || trimmed === "") {
      console.log("👋 Done.");
      break;
    }

    // Resume the same session with the user's follow-up
    await runQuery(response, { ...options, resume: sessionId });
  }
}

/**
 * Resume a previous session by ID.
 * Usage: filmflow --resume <session-id> "your follow-up message"
 */
export async function resumeAgent(sessionId: string, prompt: string, askUser: AskUserFn) {
  const options = getSharedOptions();

  console.log(`\n🎬 FilmFlow — resuming session ${sessionId}...\n`);
  await runQuery(prompt, { ...options, resume: sessionId });

  // Interactive loop
  while (true) {
    const response = await askUser("\n> ");
    const trimmed = response.trim().toLowerCase();

    if (trimmed === "exit" || trimmed === "quit" || trimmed === "") {
      console.log("👋 Done.");
      break;
    }

    await runQuery(response, { ...options, resume: sessionId });
  }
}
