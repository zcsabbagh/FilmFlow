import "dotenv/config";
import { createInterface } from "readline";
import { runAgent } from "./agent.js";

const prompt = process.argv.slice(2).join(" ");

if (!prompt) {
  console.error("Usage: filmflow <prompt>");
  console.error('Example: filmflow "Make a video about the housing crisis in SF"');
  process.exit(1);
}

const rl = createInterface({ input: process.stdin, output: process.stdout });

function askUser(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer));
  });
}

await runAgent(prompt, askUser);
rl.close();
