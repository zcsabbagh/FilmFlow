import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { writeFile, mkdir, readFile } from "fs/promises";
import { join } from "path";

export const createDataVizTool = tool(
  "create_data_viz",
  `Create an animated data visualization scene from a template and data file.

Available templates:
- AnimatedBarChart: { data: [{label, value}], title?, caption? }
- AnimatedLineChart: { data: [{x, y}], title?, caption?, color? }
- StatCard: { value: number, label: string, prefix?, suffix?, caption? }
- ChoroplethMap: { data: [{region, value}], title?, caption? }
- AnimatedTimeline: { events: [{date, title, description?}], title? }
- ComparisonChart: { leftLabel, rightLabel, leftValue, rightValue, title?, caption?, unit? }`,
  {
    projectDir: z.string().describe("Path to the Remotion project directory"),
    filename: z.string().describe("Scene filename (e.g. 'Scene02-RentPrices.tsx')"),
    template: z.enum(["AnimatedBarChart", "AnimatedLineChart", "StatCard", "ChoroplethMap", "AnimatedTimeline", "ComparisonChart"]).describe("Which viz template to use"),
    dataPath: z.string().describe("Path to the JSON data file (output of process_dataset)"),
    props: z.string().describe("JSON string of additional props for the template (title, caption, etc.)"),
  },
  async ({ projectDir, filename, template, dataPath, props }) => {
    const data = JSON.parse(await readFile(dataPath, "utf-8"));
    const extraProps = JSON.parse(props);
    const scenesDir = join(projectDir, "src", "scenes");
    await mkdir(scenesDir, { recursive: true });
    const allProps = { ...extraProps, data };
    const propsStr = JSON.stringify(allProps, null, 2);
    const code = `import { ${template} } from "../components/${template}";\n\nconst data = ${propsStr};\n\nexport const Scene: React.FC = () => {\n  return <${template} {...data} />;\n};\n`;
    const filePath = join(scenesDir, filename);
    await writeFile(filePath, code);
    return { content: [{ type: "text" as const, text: JSON.stringify({ path: filePath, template, dataRows: Array.isArray(data) ? data.length : 0 }) }] };
  }
);
