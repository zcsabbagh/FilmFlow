import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

export const censusSearchTool = tool(
  "search_census",
  `Query the US Census Bureau API for demographic, housing, income, and population data.
Returns structured data by state, county, or national level.
Common datasets: acs/acs5 (American Community Survey), dec/pl (Decennial Census).
Common variables: B01001_001E (total population), B19013_001E (median household income),
B25077_001E (median home value), B25064_001E (median rent), B17001_001E (poverty count).`,
  {
    dataset: z.string().optional().default("acs/acs5").describe("Census dataset (e.g. 'acs/acs5', 'dec/pl')"),
    year: z.number().optional().default(2022).describe("Data year (e.g. 2022)"),
    variables: z.array(z.string()).describe("Census variable codes (e.g. ['B19013_001E', 'NAME'])"),
    geo: z.string().optional().default("state:*").describe("Geography filter (e.g. 'state:*', 'state:06', 'county:*&in=state:06')"),
  },
  async ({ dataset, year, variables, geo }) => {
    const apiKey = process.env.CENSUS_API_KEY;
    if (!apiKey) throw new Error("CENSUS_API_KEY not set");

    const varsStr = variables.join(",");
    const url = `https://api.census.gov/data/${year}/${dataset}?get=${varsStr}&for=${geo}&key=${apiKey}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Census API error: ${res.status} ${await res.text()}`);

    const data = await res.json();

    // First row is headers, rest is data
    const headers = data[0] as string[];
    const rows = data.slice(1).map((row: string[]) => {
      const obj: Record<string, string | number> = {};
      headers.forEach((h, i) => {
        const val = row[i];
        const num = Number(val);
        obj[h] = isNaN(num) || h === "state" || h === "county" ? val : num;
      });
      return obj;
    });

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            dataset: `${year}/${dataset}`,
            variables: headers,
            rowCount: rows.length,
            rows: rows.slice(0, 20), // Cap at 20 for readability
            totalRows: rows.length,
          }, null, 2),
        },
      ],
    };
  },
  { annotations: { readOnlyHint: true, openWorldHint: true } }
);
