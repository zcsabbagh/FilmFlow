import { describe, it, expect, mock, afterEach } from "bun:test";

// Mock the SDK's tool() so it returns {name, handler}
mock.module("@anthropic-ai/claude-agent-sdk", () => ({
  tool: (name: string, _desc: string, _schema: any, handler: Function, _extras?: any) => ({
    name,
    handler,
  }),
}));

// Dynamic import so mock.module is applied first
const { locSearchTool, locDownloadTool } = await import("../../src/tools/research/loc");
const searchHandler = (locSearchTool as any).handler;
const downloadHandler = (locDownloadTool as any).handler;

describe("locSearchTool", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("returns structured results with Public Domain rights", async () => {
    const mockLocResponse = {
      results: [
        {
          title: "Breadline during the Great Depression",
          date: "1932",
          url: "https://www.loc.gov/item/2001234/",
          image_url: ["https://tile.loc.gov/storage-services/photos/2001234.jpg"],
          description: ["Men waiting in a breadline during the Great Depression, New York City."],
        },
        {
          title: "Dust Bowl farm",
          date: "1936",
          url: "https://www.loc.gov/item/2005678/",
          image_url: ["https://tile.loc.gov/storage-services/photos/2005678.jpg"],
          description: ["An abandoned farm in Oklahoma during the Dust Bowl era."],
        },
      ],
    };

    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(JSON.stringify(mockLocResponse), { status: 200 }))
    ) as typeof fetch;

    const result = await searchHandler({ query: "Great Depression", type: "photos", count: 5 }, {});

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].title).toBe("Breadline during the Great Depression");
    expect(parsed[0].date).toBe("1932");
    expect(parsed[0].imageUrl).toBe("https://tile.loc.gov/storage-services/photos/2001234.jpg");
    expect(parsed[0].rights).toBe("Public Domain (Library of Congress)");
    expect(parsed[1].title).toBe("Dust Bowl farm");
    expect(parsed[1].rights).toBe("Public Domain (Library of Congress)");

    const fetchMock = globalThis.fetch as ReturnType<typeof mock>;
    const [calledUrl] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(calledUrl).toContain("loc.gov/search/");
    expect(calledUrl).toContain("Great%20Depression");
    expect(calledUrl).toContain("fo=json");
  });

  it("does not require any API key", async () => {
    delete process.env.LOC_API_KEY;
    delete process.env.LIBRARY_OF_CONGRESS_API_KEY;

    const mockLocResponse = { results: [] };

    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(JSON.stringify(mockLocResponse), { status: 200 }))
    ) as typeof fetch;

    // Should not throw - LOC is free, no API key needed
    const result = await searchHandler({ query: "test", type: "all", count: 5 }, {});
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed).toEqual([]);
  });

  it("handles items with missing image_url", async () => {
    const mockLocResponse = {
      results: [
        {
          title: "A newspaper article",
          date: "1920",
          url: "https://www.loc.gov/item/999/",
          image_url: null,
          description: ["Short description."],
        },
      ],
    };

    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(JSON.stringify(mockLocResponse), { status: 200 }))
    ) as typeof fetch;

    const result = await searchHandler({ query: "newspaper", type: "newspapers", count: 1 }, {});

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed[0].imageUrl).toBeNull();
    expect(parsed[0].rights).toBe("Public Domain (Library of Congress)");
  });
});

describe("locDownloadTool", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("downloads an image and reports Public Domain rights", async () => {
    const fakeImageData = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]); // JPEG header bytes

    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(fakeImageData, { status: 200 }))
    ) as typeof fetch;

    const result = await downloadHandler(
      { imageUrl: "https://tile.loc.gov/storage-services/photos/2001234.jpg", outputDir: "/tmp/filmflow-test-loc", filename: "depression.jpg" },
      {}
    );

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.path).toBe("/tmp/filmflow-test-loc/depression.jpg");
    expect(parsed.sizeBytes).toBe(4);
    expect(parsed.rights).toBe("Public Domain");
  });

  it("does not send any API key headers", async () => {
    const fakeData = new Uint8Array([0x00]);

    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(fakeData, { status: 200 }))
    ) as typeof fetch;

    await downloadHandler(
      { imageUrl: "https://tile.loc.gov/test.jpg", outputDir: "/tmp/filmflow-test-loc", filename: "test.jpg" },
      {}
    );

    const fetchMock = globalThis.fetch as ReturnType<typeof mock>;
    const callArgs = fetchMock.mock.calls[0] as [string, RequestInit?];
    // LOC download should not pass any headers/options - just the URL
    expect(callArgs).toHaveLength(1);
  });
});
