import { readFile } from "fs/promises";

export type CritiqueCategory = {
  score: number;
  notes: string;
};

export type VideoCritique = {
  pacing: CritiqueCategory;
  visual_coherence: CritiqueCategory;
  data_accuracy: CritiqueCategory;
  audio_sync: CritiqueCategory;
  overall: CritiqueCategory;
};

export async function critiqueVideo(
  videoPath: string,
  apiKey: string
): Promise<VideoCritique> {
  const videoBytes = await readFile(videoPath);
  const base64Video = videoBytes.toString("base64");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inline_data: {
                  mime_type: "video/mp4",
                  data: base64Video,
                },
              },
              {
                text: `You are a professional video editor reviewing an explainer video.
Evaluate this video and return a JSON object with these categories:
- pacing: { score: 1-10, notes: string }
- visual_coherence: { score: 1-10, notes: string }
- data_accuracy: { score: 1-10, notes: string }
- audio_sync: { score: 1-10, notes: string }
- overall: { score: 1-10, notes: string }

Return ONLY valid JSON, no markdown.`,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`Gemini API error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const text = data.candidates[0].content.parts[0].text;
  return JSON.parse(text) as VideoCritique;
}
