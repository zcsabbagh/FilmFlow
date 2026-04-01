import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

export const datasetSearchTool = tool(
  "dataset_search",
  "Search public data sources for datasets. Searches data.gov and World Bank APIs. Returns dataset names, descriptions, and download URLs.",
  {
    query: z.string().describe("Search query for datasets"),
    source: z.enum(["datagov", "worldbank"]).optional().default("datagov").describe("Which data source to search"),
  },
  async ({ query, source }) => {
    let results: any[];
    if (source === "worldbank") {
      const res = await fetch(`https://api.worldbank.org/v2/indicator?format=json&per_page=10&source=2&search=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error(`World Bank API error: ${res.status}`);
      const data = await res.json();
      results = (data[1] || []).map((item: any) => ({
        id: item.id, name: item.name, description: item.sourceNote,
        source: "World Bank",
        url: `https://api.worldbank.org/v2/country/all/indicator/${item.id}?format=json&per_page=1000`,
      }));
    } else {
      const res = await fetch(`https://catalog.data.gov/api/3/action/package_search?q=${encodeURIComponent(query)}&rows=10`);
      if (!res.ok) throw new Error(`data.gov API error: ${res.status}`);
      const data = await res.json();
      results = (data.result?.results || []).map((item: any) => ({
        id: item.id, name: item.title, description: item.notes,
        source: "data.gov",
        url: item.resources?.[0]?.url || null,
        format: item.resources?.[0]?.format || null,
      }));
    }
    return {
      content: [{ type: "text" as const, text: JSON.stringify(results, null, 2) }],
    };
  },
  { annotations: { readOnlyHint: true, openWorldHint: true } }
);
