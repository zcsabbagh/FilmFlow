import { describe, it, expect, mock, beforeEach, afterEach } from "bun:test";

// Mock the SDK's tool() so it returns {name, handler}
mock.module("@anthropic-ai/claude-agent-sdk", () => ({
  tool: (name: string, _desc: string, _schema: any, handler: Function, _extras?: any) => ({
    name,
    handler,
  }),
}));

// Dynamic import so mock.module is applied first
const { pixabaySearchTool } = await import("../../src/tools/research/pixabay");
const searchHandler = (pixabaySearchTool as any).handler;

describe("pixabaySearchTool", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    process.env.PIXABAY_API_KEY = "test-pixabay-key";
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("returns structured image results", async () => {
    const mockImages = {
      hits: [
        {
          id: 789,
          tags: "food, burger, restaurant",
          imageWidth: 1920,
          imageHeight: 1080,
          largeImageURL: "https://pixabay.com/get/large-789.jpg",
          user: "PhotoPro",
        },
        {
          id: 790,
          tags: "kitchen, chef, cooking",
          imageWidth: 3840,
          imageHeight: 2160,
          largeImageURL: "https://pixabay.com/get/large-790.jpg",
          user: "StockUser",
        },
      ],
    };

    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(JSON.stringify(mockImages), { status: 200 }))
    ) as typeof fetch;

    const result = await searchHandler({ query: "fast food", type: "photo", perPage: 5 }, {});

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].id).toBe(789);
    expect(parsed[0].tags).toBe("food, burger, restaurant");
    expect(parsed[0].downloadUrl).toBe("https://pixabay.com/get/large-789.jpg");
    expect(parsed[0].user).toBe("PhotoPro");
    expect(parsed[1].id).toBe(790);

    const fetchMock = globalThis.fetch as ReturnType<typeof mock>;
    const [calledUrl] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(calledUrl).toContain("pixabay.com/api/");
    expect(calledUrl).toContain("image_type=photo");
    expect(calledUrl).toContain("key=test-pixabay-key");
  });

  it("returns structured video results", async () => {
    const mockVideos = {
      hits: [
        {
          id: 100,
          tags: "traffic, cars, highway",
          duration: 15,
          videos: {
            large: { url: "https://pixabay.com/vimeo/large-100.mp4" },
            medium: { url: "https://pixabay.com/vimeo/medium-100.mp4" },
          },
          user: "VideoMaker",
        },
      ],
    };

    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(JSON.stringify(mockVideos), { status: 200 }))
    ) as typeof fetch;

    const result = await searchHandler({ query: "traffic", type: "video", perPage: 5 }, {});

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].id).toBe(100);
    expect(parsed[0].tags).toBe("traffic, cars, highway");
    expect(parsed[0].downloadUrl).toBe("https://pixabay.com/vimeo/large-100.mp4");
    expect(parsed[0].user).toBe("VideoMaker");
    expect(parsed[0].duration).toBe(15);

    const fetchMock = globalThis.fetch as ReturnType<typeof mock>;
    const [calledUrl] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(calledUrl).toContain("pixabay.com/api/videos/");
  });

  it("throws when PIXABAY_API_KEY is missing", async () => {
    delete process.env.PIXABAY_API_KEY;

    expect(searchHandler({ query: "test", type: "photo", perPage: 5 }, {})).rejects.toThrow(
      "PIXABAY_API_KEY not set"
    );
  });
});
