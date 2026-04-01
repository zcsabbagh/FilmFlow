import "dotenv/config";
import { runAgent } from "./agent.js";

const prompt = process.argv.slice(2).join(" ");

if (!prompt) {
  console.error("Usage: filmflow <prompt>");
  console.error('Example: filmflow "Make a video about the housing crisis in SF"');
  process.exit(1);
}

await runAgent(prompt);
