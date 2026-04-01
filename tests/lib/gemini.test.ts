import { describe, it, expect, mock, afterEach } from "bun:test";
import { critiqueVideo } from "../../src/lib/gemini";

// Mock fs/promises readFile
const mockReadFile = mock(() => Promise.resolve(Buffer.from("fake-video-data")));
mock.module("fs/promises", () => ({
  readFile: mockReadFile,
}));

describe("critiqueVideo", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("returns structured critique from mocked response", async () => {
    const mockCritique = {
      pacing: { score: 8, notes: "Good pacing throughout" },
      visual_coherence: { score: 7, notes: "Mostly coherent visuals" },
      data_accuracy: { score: 9, notes: "Data is accurate" },
      audio_sync: { score: 6, notes: "Slight audio delay" },
      overall: { score: 7, notes: "Solid video overall" },
    };

    const mockApiResponse = {
      candidates: [
        {
          content: {
            parts: [{ text: JSON.stringify(mockCritique) }],
          },
        },
      ],
    };

    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(JSON.stringify(mockApiResponse), { status: 200 }))
    ) as typeof fetch;

    const result = await critiqueVideo("/fake/video.mp4", "fake-api-key");

    expect(result.pacing.score).toBe(8);
    expect(result.pacing.notes).toBe("Good pacing throughout");
    expect(result.visual_coherence.score).toBe(7);
    expect(result.data_accuracy.score).toBe(9);
    expect(result.audio_sync.score).toBe(6);
    expect(result.audio_sync.notes).toBe("Slight audio delay");
    expect(result.overall.score).toBe(7);

    // Verify fetch was called with correct URL
    const fetchMock = globalThis.fetch as ReturnType<typeof mock>;
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [calledUrl, calledOptions] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(calledUrl).toContain("gemini-2.0-flash");
    expect(calledUrl).toContain("key=fake-api-key");
    expect(calledOptions.method).toBe("POST");

    const body = JSON.parse(calledOptions.body as string);
    expect(body.contents[0].parts[0].inline_data.mime_type).toBe("video/mp4");
    expect(body.generationConfig.responseMimeType).toBe("application/json");
  });

  it("throws on API error", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response("Server Error", { status: 500 }))
    ) as typeof fetch;

    expect(critiqueVideo("/fake/video.mp4", "bad-key")).rejects.toThrow(
      "Gemini API error: 500"
    );
  });
});
