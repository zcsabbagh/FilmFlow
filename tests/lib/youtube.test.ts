import { describe, it, expect, mock, beforeEach, afterEach } from "bun:test";
import { searchYouTube } from "../../src/lib/youtube";

describe("searchYouTube", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("returns structured search results from mocked API response", async () => {
    const mockResponse = {
      items: [
        {
          id: { videoId: "abc123" },
          snippet: {
            title: "Test Video",
            channelTitle: "Test Channel",
            description: "A test video description",
            publishedAt: "2024-01-01T00:00:00Z",
          },
        },
        {
          id: { videoId: "def456" },
          snippet: {
            title: "Another Video",
            channelTitle: "Another Channel",
            description: "Another description",
            publishedAt: "2024-02-01T00:00:00Z",
          },
        },
      ],
    };

    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(JSON.stringify(mockResponse), { status: 200 }))
    ) as typeof fetch;

    const results = await searchYouTube("test query", "fake-api-key", 5);

    expect(results).toHaveLength(2);
    expect(results[0]).toEqual({
      videoId: "abc123",
      title: "Test Video",
      channelTitle: "Test Channel",
      description: "A test video description",
      publishedAt: "2024-01-01T00:00:00Z",
    });
    expect(results[1]).toEqual({
      videoId: "def456",
      title: "Another Video",
      channelTitle: "Another Channel",
      description: "Another description",
      publishedAt: "2024-02-01T00:00:00Z",
    });

    // Verify fetch was called with correct URL params
    const fetchMock = globalThis.fetch as ReturnType<typeof mock>;
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const calledUrl = (fetchMock.mock.calls[0] as any[])[0] as string;
    expect(calledUrl).toContain("q=test+query");
    expect(calledUrl).toContain("maxResults=5");
    expect(calledUrl).toContain("key=fake-api-key");
  });

  it("throws on API error", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response("Not Found", { status: 404 }))
    ) as typeof fetch;

    expect(searchYouTube("test", "fake-key")).rejects.toThrow(
      "YouTube API error: 404"
    );
  });
});
