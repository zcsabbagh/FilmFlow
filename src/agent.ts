import { query, tool, createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

const SYSTEM_PROMPT = `You are FilmFlow, an AI video journalist that creates Vox-style explainer videos.

You operate in three modes:

1. PLAN MODE (default): Research the topic, write a script, and produce a storyboard.
   Present the storyboard to the user for review. Wait for approval before proceeding.

2. EXECUTE MODE: After the user approves the storyboard, build the video:
   - Download and clip YouTube footage
   - Process datasets for visualization
   - Generate voiceover narration
   - Write Remotion scene components
   - Assemble the timeline

3. CRITIQUE MODE: After rendering, send the video for AI review.
   Fix issues automatically where possible, report others to the user.

Always start in PLAN MODE. Research thoroughly before proposing the storyboard.`;

export async function runAgent(prompt: string) {
  const filmflowTools = createSdkMcpServer({
    name: "filmflow-tools",
    tools: [],
  });

  for await (const message of query({
    prompt,
    options: {
      systemPrompt: SYSTEM_PROMPT,
      cwd: process.cwd(),
      allowedTools: [
        "Read", "Write", "Edit", "Bash", "Glob", "Grep",
        "WebSearch", "WebFetch",
      ],
      mcpServers: {
        "filmflow-tools": filmflowTools,
      },
      permissionMode: "bypassPermissions",
      allowDangerouslySkipPermissions: true,
      maxTurns: 100,
    },
  })) {
    if ("result" in message) {
      console.log(message.result);
    }
  }
}
