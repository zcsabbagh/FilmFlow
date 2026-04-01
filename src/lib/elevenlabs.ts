export type SpeechResult = {
  audio: Buffer;
};

export type WordTiming = {
  word: string;
  startSeconds: number;
  endSeconds: number;
};

export type SpeechWithTimingResult = {
  audio: Buffer;
  words: WordTiming[];
  durationSeconds: number;
};

export async function generateSpeech(
  text: string,
  apiKey: string,
  voiceId = "21m00Tcm4TlvDq8ikWAM", // Rachel — default narrator voice
  model: "eleven_multilingual_v2" | "eleven_v3" = "eleven_multilingual_v2"
): Promise<SpeechResult> {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: model,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`ElevenLabs API error: ${res.status} ${await res.text()}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return { audio: Buffer.from(arrayBuffer) };
}

/**
 * Generate speech with word-level timing data.
 * Uses the /with-timestamps endpoint to get character-level alignment,
 * then aggregates into word-level timing.
 */
export async function generateSpeechWithTiming(
  text: string,
  apiKey: string,
  voiceId = "21m00Tcm4TlvDq8ikWAM",
  model: "eleven_multilingual_v2" | "eleven_v3" = "eleven_multilingual_v2"
): Promise<SpeechWithTimingResult> {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: model,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`ElevenLabs API error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();

  // Decode audio from base64
  const audio = Buffer.from(data.audio_base64, "base64");

  // Aggregate character-level alignment into word-level
  const alignment = data.alignment;
  const chars: string[] = alignment.characters;
  const starts: number[] = alignment.character_start_times_seconds;
  const ends: number[] = alignment.character_end_times_seconds;

  const words: WordTiming[] = [];
  let currentWord = "";
  let wordStart = 0;
  let wordEnd = 0;

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];

    if (char === " " || char === "\n" || char === "\t") {
      // Whitespace = word boundary
      if (currentWord.length > 0) {
        words.push({
          word: currentWord,
          startSeconds: wordStart,
          endSeconds: wordEnd,
        });
        currentWord = "";
      }
    } else {
      if (currentWord.length === 0) {
        wordStart = starts[i];
      }
      currentWord += char;
      wordEnd = ends[i];
    }
  }

  // Don't forget the last word
  if (currentWord.length > 0) {
    words.push({
      word: currentWord,
      startSeconds: wordStart,
      endSeconds: wordEnd,
    });
  }

  const durationSeconds =
    words.length > 0 ? words[words.length - 1].endSeconds : 0;

  return { audio, words, durationSeconds };
}
