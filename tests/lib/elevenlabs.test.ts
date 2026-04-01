import { describe, it, expect, mock, afterEach } from "bun:test";
import { generateSpeech } from "../../src/lib/elevenlabs";

describe("generateSpeech", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("returns audio buffer from mocked response", async () => {
    const fakeAudio = new Uint8Array([0x00, 0x01, 0x02, 0x03, 0xff]);

    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(fakeAudio, { status: 200 }))
    ) as typeof fetch;

    const result = await generateSpeech("Hello world", "fake-api-key");

    expect(result.audio).toBeInstanceOf(Buffer);
    expect(result.audio.length).toBe(5);
    expect(result.audio[0]).toBe(0x00);
    expect(result.audio[4]).toBe(0xff);

    // Verify fetch was called with correct URL and headers
    const fetchMock = globalThis.fetch as ReturnType<typeof mock>;
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [calledUrl, calledOptions] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(calledUrl).toContain("text-to-speech/21m00Tcm4TlvDq8ikWAM");
    expect(calledOptions.method).toBe("POST");
    expect((calledOptions.headers as Record<string, string>)["xi-api-key"]).toBe("fake-api-key");

    const body = JSON.parse(calledOptions.body as string);
    expect(body.text).toBe("Hello world");
    expect(body.model_id).toBe("eleven_multilingual_v2");
  });

  it("uses custom voice ID when provided", async () => {
    const fakeAudio = new Uint8Array([0x00]);

    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(fakeAudio, { status: 200 }))
    ) as typeof fetch;

    await generateSpeech("Hello", "fake-key", "custom-voice-id");

    const fetchMock = globalThis.fetch as ReturnType<typeof mock>;
    const calledUrl = (fetchMock.mock.calls[0] as any[])[0] as string;
    expect(calledUrl).toContain("text-to-speech/custom-voice-id");
  });

  it("throws on API error", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response("Unauthorized", { status: 401 }))
    ) as typeof fetch;

    expect(generateSpeech("Hello", "bad-key")).rejects.toThrow(
      "ElevenLabs API error: 401"
    );
  });
});
