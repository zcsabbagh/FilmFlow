import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export const processDatasetTool = tool(
  "process_dataset",
  "Fetch a dataset from a URL (CSV or JSON), then filter/transform it using a JavaScript expression. Outputs viz-ready JSON.",
  {
    url: z.string().url().describe("URL of the dataset (CSV or JSON)"),
    outputDir: z.string().describe("Directory to save processed data"),
    filename: z.string().describe("Output filename (e.g. 'housing_prices.json')"),
    transformExpression: z.string().optional().describe("JavaScript expression to transform data. Variable `data` holds the parsed array. Example: `data.filter(d => d.year >= 2010)`"),
  },
  async ({ url, outputDir, filename, transformExpression }) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch dataset: ${res.status}`);
    const contentType = res.headers.get("content-type") || "";
    const text = await res.text();
    let data: any[];
    if (contentType.includes("json") || url.endsWith(".json")) {
      const parsed = JSON.parse(text);
      data = Array.isArray(parsed) ? parsed : [parsed];
    } else {
      // Parse CSV
      const lines = text.trim().split("\n");
      const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
      data = lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
        const row: Record<string, string | number> = {};
        headers.forEach((h, i) => {
          const num = Number(values[i]);
          row[h] = isNaN(num) ? values[i] : num;
        });
        return row;
      });
    }
    if (transformExpression) {
      const fn = new Function("data", `return ${transformExpression}`);
      data = fn(data);
    }
    await mkdir(outputDir, { recursive: true });
    const outputPath = join(outputDir, filename);
    await writeFile(outputPath, JSON.stringify(data, null, 2));
    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({ path: outputPath, rowCount: data.length, columns: data.length > 0 ? Object.keys(data[0]) : [], sample: data.slice(0, 3) }),
      }],
    };
  }
);
