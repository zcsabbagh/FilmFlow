import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import * as cheerio from "cheerio";

export const scrapeTableTool = tool(
  "scrape_table",
  "Extract data tables from a web page URL. Returns tables as arrays of objects with column headers as keys.",
  {
    url: z.string().url().describe("URL of the web page to scrape tables from"),
    tableIndex: z.number().optional().default(0).describe("Which table to extract (0-indexed)"),
  },
  async ({ url, tableIndex }) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
    const html = await res.text();
    const $ = cheerio.load(html);
    const tables = $("table");
    if (tables.length === 0) {
      return { content: [{ type: "text" as const, text: "No tables found on page." }] };
    }
    const table = tables.eq(Math.min(tableIndex, tables.length - 1));
    const headers: string[] = [];
    table.find("thead th, tr:first-child th").each((_, el) => {
      headers.push($(el).text().trim());
    });
    if (headers.length === 0) {
      table.find("tr:first-child td").each((_, el) => {
        headers.push($(el).text().trim());
      });
    }
    const rows: Record<string, string>[] = [];
    const dataRows = headers.length > 0
      ? table.find("tbody tr, tr").slice(1)
      : table.find("tr").slice(1);
    dataRows.each((_, row) => {
      const cells: Record<string, string> = {};
      $(row).find("td").each((i, cell) => {
        const key = headers[i] || `col_${i}`;
        cells[key] = $(cell).text().trim();
      });
      if (Object.keys(cells).length > 0) rows.push(cells);
    });
    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({ tableCount: tables.length, headers, rowCount: rows.length, rows }, null, 2),
      }],
    };
  },
  { annotations: { readOnlyHint: true, openWorldHint: true } }
);
