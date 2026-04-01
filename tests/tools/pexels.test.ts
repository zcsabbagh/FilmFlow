import { describe, it, expect, mock, beforeEach, afterEach } from "bun:test";

// Mock the SDK's tool() so it returns {name, handler} and we can call handler directly
mock.module("@anthropic-ai/claude-agent-sdk", () => ({
  tool: (name: string, _desc: string, _schema: any, handler: Function, _extras?: any) => ({
    name,
    handler,
  }),
}));

// Dynamic import so mock.module is applied first (static imports get hoisted above mock.module)
const { pexelsSearchTool, pexelsDownloadTool } = await import("../../src/tools/research/pexels");
const searchHandler = (pexelsSearchTool as any).handler;
const downloadHandler = (pexelsDownloadTool as any).handler;

describe("pexelsSearchTool", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    process.env.PEXELS_API_KEY = "test-pexels-key";
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("returns structured photo results", async () => {
    const mockPhotos = {
      photos: [
        {
          id: 123,
          url: "https://pexels.com/photo/123",
          width: 1920,
          height: 1080,
          src: { large2x: "https://images.pexels.com/123/large2x.jpg", original: "https://images.pexels.com/123/original.jpg" },
          photographer: "Jane Doe",
          alt: "Hospital corridor",
        },
      ],
    };

    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(JSON.stringify(mockPhotos), { status: 200 }))
    ) as typeof fetch;

    const result = await searchHandler({ query: "hospital corridor", type: "photos", perPage: 5 }, {});

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].id).toBe(123);
    expect(parsed[0].url).toBe("https://pexels.com/photo/123");
    expect(parsed[0].downloadUrl).toBe("https://images.pexels.com/123/large2x.jpg");
    expect(parsed[0].photographer).toBe("Jane Doe");

    const fetchMock = globalThis.fetch as ReturnType<typeof mock>;
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [calledUrl, calledOptions] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(calledUrl).toContain("api.pexels.com/v1/search");
    expect(calledUrl).toContain("hospital%20corridor");
    expect((calledOptions.headers as Record<string, string>).Authorization).toBe("test-pexels-key");
  });

  it("returns structured video results", async () => {
    const mockVideos = {
      videos: [
        {
          id: 456,
          url: "https://pexels.com/video/456",
          duration: 30,
          width: 1920,
          height: 1080,
          video_files: [
            { quality: "hd", link: "https://videos.pexels.com/456/hd.mp4" },
            { quality: "sd", link: "https://videos.pexels.com/456/sd.mp4" },
          ],
          user: { name: "John Smith" },
        },
      ],
    };

    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(JSON.stringify(mockVideos), { status: 200 }))
    ) as typeof fetch;

    const result = await searchHandler({ query: "city skyline", type: "videos", perPage: 5 }, {});

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].id).toBe(456);
    expect(parsed[0].downloadUrl).toBe("https://videos.pexels.com/456/hd.mp4");
    expect(parsed[0].photographer).toBe("John Smith");
    expect(parsed[0].duration).toBe(30);

    const fetchMock = globalThis.fetch as ReturnType<typeof mock>;
    const [calledUrl] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(calledUrl).toContain("api.pexels.com/videos/search");
  });

  it("throws when PEXELS_API_KEY is missing", async () => {
    delete process.env.PEXELS_API_KEY;

    expect(searchHandler({ query: "test", type: "photos", perPage: 5 }, {})).rejects.toThrow(
      "PEXELS_API_KEY not set"
    );
  });
});

describe("pexelsDownloadTool", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    process.env.PEXELS_API_KEY = "test-pexels-key";
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("downloads and saves a file", async () => {
    const fakeFileData = new Uint8Array([0x89, 0x50, 0x4e, 0x47]); // PNG header bytes

    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(fakeFileData, { status: 200 }))
    ) as typeof fetch;

    const result = await downloadHandler(
      { url: "https://images.pexels.com/123/large2x.jpg", outputDir: "/tmp/filmflow-test-pexels", filename: "test.jpg" },
      {}
    );

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.path).toBe("/tmp/filmflow-test-pexels/test.jpg");
    expect(parsed.sizeBytes).toBe(4);
  });
});
