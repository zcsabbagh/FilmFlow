import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

export const fredSearchTool = tool(
  "search_fred",
  `Search and retrieve economic time series data from FRED (Federal Reserve Economic Data).
Covers interest rates, GDP, unemployment, CPI, housing prices, wages, and more.
Use series IDs like: FEDFUNDS, GDP, UNRATE, CPIAUCSL, MSPUS (median home price),
FEDMINNFRWG (federal minimum wage), A939RX0Q048SBEA (real GDP per capita).`,
  {
    seriesId: z.string().optional().describe("FRED series ID to fetch (e.g. 'MSPUS', 'UNRATE')"),
    searchQuery: z.string().optional().describe("Search for series by keyword (e.g. 'median home price')"),
    startDate: z.string().optional().describe("Start date YYYY-MM-DD (e.g. '2000-01-01')"),
    endDate: z.string().optional().describe("End date YYYY-MM-DD"),
    limit: z.number().optional().default(100).describe("Max observations to return"),
  },
  async ({ seriesId, searchQuery, startDate, endDate, limit }) => {
    const apiKey = process.env.FRED_API_KEY;
    if (!apiKey) throw new Error("FRED_API_KEY not set");

    if (searchQuery && !seriesId) {
      // Search for series
      const res = await fetch(
        `https://api.stlouisfed.org/fred/series/search?search_text=${encodeURIComponent(searchQuery)}&api_key=${apiKey}&file_type=json&limit=10`
      );
      if (!res.ok) throw new Error(`FRED search error: ${res.status}`);
      const data = await res.json();
      const results = (data.seriess || []).map((s: any) => ({
        id: s.id,
        title: s.title,
        frequency: s.frequency,
        units: s.units,
        lastUpdated: s.last_updated,
      }));
      return { content: [{ type: "text" as const, text: JSON.stringify(results, null, 2) }] };
    }

    if (!seriesId) throw new Error("Provide either seriesId or searchQuery");

    // Fetch observations
    let url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json&limit=${limit}`;
    if (startDate) url += `&observation_start=${startDate}`;
    if (endDate) url += `&observation_end=${endDate}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`FRED error: ${res.status}`);
    const data = await res.json();

    const observations = (data.observations || [])
      .filter((o: any) => o.value !== ".")
      .map((o: any) => ({
        date: o.date,
        value: parseFloat(o.value),
      }));

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            seriesId,
            count: observations.length,
            observations: observations.slice(-50), // Last 50 data points
          }, null, 2),
        },
      ],
    };
  },
  { annotations: { readOnlyHint: true, openWorldHint: true } }
);
