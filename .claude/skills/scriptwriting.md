# Scriptwriting Skill

Write narration scripts in the Vox explainer style. This skill is used during PLAN MODE when writing the narration for each scene.

## The Vox Formula

Every Vox explainer follows a consistent structure. Study the transcripts in `scriptwriting-inspo/` for examples.

### Opening Hook (Scene 1, 15-20 seconds)

Start with a **concrete, surprising fact** — never an abstract statement. The hook should make the viewer think "wait, what?"

**Good hooks:**
- "This is Fiery Cross Island. Two years ago, it didn't exist."
- "Four hundred and thirty-five. That number hasn't changed in a hundred years."
- "The median home in San Francisco costs one-point-three million dollars."

**Bad hooks:**
- "Today we're going to talk about housing policy."
- "The South China Sea is an important geopolitical region."
- "Congress has been a topic of debate for centuries."

The hook establishes STAKES. The viewer should immediately understand why this matters to them.

### The "But Here's the Thing" Turn

After the hook, pivot with a contrast or complication. Vox scripts almost always have this beat:

- "But the strangest thing about Fiery Cross Island is that two years ago, it didn't exist."
- "But that number, 435, hasn't changed in about 100 years, even though the US population has tripled."
- "Here's the thing that you really care about..."

This turn creates tension. It says: "the obvious story isn't the real story."

### Explanation Body (2-4 scenes, 20-35 seconds each)

Build understanding in layers. Each scene adds ONE key concept:

1. **Context scene** — "How did we get here?" (timeline, history)
2. **Data scene** — "How bad is it?" (charts, numbers, comparisons)
3. **Mechanism scene** — "Why does this happen?" (the system, the process)
4. **Comparison scene** — "What does the alternative look like?" (another country, another era)

**Writing rules for body scenes:**
- Write for the EAR, not the eye. Read every line aloud.
- Use numbers sparingly. No more than 2-3 numbers per scene.
- Round aggressively: "about a hundred thousand" not "ninety-seven thousand four hundred and twelve"
- Write out numbers as words: "one-point-three million" not "$1.3M" (the narrator speaks them)
- Short sentences. 10-15 words max. Fragments are fine.
- One idea per sentence. Never combine two stats in one sentence.
- Use "you" and "your" — make it personal to the viewer.

### The Human Cost (1 scene, 20-25 seconds)

Before the conclusion, always ground the data in human impact. This is where Vox goes from informative to emotional:

- "The human toll is staggering."
- "Eight thousand three hundred people are unhoused."
- "San Francisco's Black population has fallen from thirteen percent to just five percent."

Don't editorialize. Let the facts carry the emotional weight.

### Closing (15-20 seconds)

End with a **callback to the hook** and a final punchy line. The best Vox closings reframe the opening:

- Hook: "435 hasn't changed in 100 years." → Close: "Maybe it's time it did."
- Hook: "$1.3M for a fixer-upper." → Close: "The tools to fix this exist. The only thing missing is permission to use them."

Never end with "and that's why X is important." End with a line that makes the viewer think.

## Word Count Targets

| Scene Type | Duration | Words (~150 wpm) |
|-----------|----------|-------------------|
| Hook | 15-20s | 38-50 words |
| Body scene | 25-35s | 63-88 words |
| Human cost | 20-25s | 50-63 words |
| Closing | 15-20s | 38-50 words |
| **Full 3-min video** | **~3:00** | **~450 words** |

## Voice and Tone

- **Authoritative but accessible.** Like a smart friend explaining something at dinner.
- **Never condescending.** Don't say "you might not know this, but..."
- **Curious, not angry.** Even on outrage-worthy topics, the tone is "isn't this fascinating/absurd?" not "this is terrible!"
- **Active voice.** "The city built 3,000 units" not "3,000 units were built by the city."
- **Present tense** for ongoing situations. Past tense only for completed historical events.

## Emotional Delivery with Audio Tags (v3)

When using ElevenLabs v3 (`model: "v3"` in `generate_voiceover`), you can embed audio tags inline in the narration text to control emotional delivery. These are bracketed cues that the TTS engine interprets as performance directions.

**Available tags:** `[sighs]`, `[excited]`, `[whispers]`, `[sad]`, `[laughs]`, `[serious]`, `[curious]`, `[angry]`, `[pause]`

**When to use each tag:**
- `[pause]` — before shocking stats or numbers that need to land. Gives the viewer a beat to absorb.
- `[serious]` — for human cost sections and gravity moments. Sets a deliberate, weighted tone.
- `[sighs]` — at "and yet..." turns, when the script pivots to something frustrating or absurd.
- `[curious]` — for "here's the thing" moments, when introducing a surprising angle.
- `[whispers]` — sparingly, for conspiratorial asides or dramatic effect.

**Rules:**
- Tags go INLINE in the narration text, not as metadata or separate instructions.
- Max 3-4 tags per scene — don't overuse. Let the writing carry most of the emotion.
- Never stack tags back-to-back (`[serious] [pause]` is fine, but `[serious] [sad] [sighs]` is too much).
- `[pause]` is the most useful tag. Use it to create breathing room before key numbers.

**Example:**
```
[serious] The federal minimum wage [pause] is seven dollars and twenty-five cents. [sighs] It has not changed in sixteen years.
```

## Using Word-Level Timing

After generating the voiceover with `generate_voiceover`, you get word-level timing data. Use this to sync animations:

1. Read the `.timing.json` file to find when key phrases are spoken
2. In the scene component, use `useCurrentFrame()` and check if the current frame matches a phrase's start frame
3. Trigger animations at the exact frame the narrator says the relevant word

Example: If the narrator says "one-point-three million" at frames 45-72, the StatCard number should animate during frames 45-72.
