import "dotenv/config";
import { createInterface } from "readline";
import { runAgent, resumeAgent } from "./agent.js";

const args = process.argv.slice(2);

const rl = createInterface({ input: process.stdin, output: process.stdout });

function askUser(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer));
  });
}

// Check for --resume flag
const resumeIndex = args.indexOf("--resume");
if (resumeIndex !== -1) {
  const sessionId = args[resumeIndex + 1];
  const prompt = args.slice(resumeIndex + 2).join(" ") || "Continue where we left off.";

  if (!sessionId) {
    console.error("Usage: filmflow --resume <session-id> [prompt]");
    process.exit(1);
  }

  await resumeAgent(sessionId, prompt, askUser);
} else {
  const prompt = args.join(" ");

  if (!prompt) {
    console.error("Usage: filmflow <prompt>");
    console.error('       filmflow --resume <session-id> [prompt]');
    console.error('');
    console.error('Examples:');
    console.error('  filmflow "Make a video about the housing crisis in SF"');
    console.error('  filmflow --resume abc123 "approved, build it"');
    process.exit(1);
  }

  await runAgent(prompt, askUser);
}

rl.close();
