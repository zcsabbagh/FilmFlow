# Video Production Skill

End-to-end workflow for producing a FilmFlow explainer video. This skill orchestrates the full pipeline from prompt to final MP4.

## Production Pipeline

```
PLAN → SCRIPT → VOICEOVER → VISUALS → ASSEMBLE → RENDER → CRITIQUE → ITERATE
```

Follow each phase in order. Do not skip ahead.

## Phase 1: PLAN (Research & Storyboard)

1. **Research the topic thoroughly**
   - `web_search` — find key facts, recent news, expert opinions
   - `youtube_search` + `youtube_transcript` — find source videos, extract quotes and context
   - `dataset_search` — find quantitative data for visualizations
   - `scrape_table` — extract data tables from Wikipedia, government sites
   - `fetch_wikimedia_image` — find historical photos (public domain)

2. **Write the storyboard**
   - Follow the scriptwriting skill for the narration
   - For each scene, specify: narration text, visual type, data source, duration estimate
   - Present the storyboard to the user and WAIT for approval

## Phase 2: SCRIPT & VOICEOVER

For each scene in the approved storyboard:

1. **Finalize the narration text** — with v3 audio tags inline (see scriptwriting skill)
2. **Generate voiceover** with `generate_voiceover`
   - **ALWAYS use v3** — it's the default. Include audio tags: `[pause]`, `[serious]`, `[sighs]`, `[curious]`
   - Default speed is 1.35x (punchy and fast). Use 1.15 for emotional moments, 1.5 for fast data dumps
   - Choose voice: `narrator-male` (British male) or `narrator-female` (British female)
   - This returns word-level timing data (`.timing.json`)
3. **Generate transition SFX** with `generate_sound_effect`
   - Generate 2-3 sound effects for the video: "subtle whoosh transition", "soft data reveal impact", "gentle paper slide"
   - Use these in `<Audio>` tags at scene transitions and data reveals
4. **Calculate scene duration** — use `durationFrames` + 20 frames padding (not 30 — keep it tight)

**Critical:** Generate ALL voiceovers AND SFX before building visuals.

**NO DEAD AIR.** The narration should be continuous — no gaps longer than 1 second between scenes. Set each scene's frame count to EXACTLY `durationFrames + 15` (0.5s padding), not more. If a scene has both narration and a video clip, overlap them or keep the clip SHORT (3-5s). The viewer should hear talking the ENTIRE time — if there's a 3-second gap with no narration, the video feels broken.

## HARD RULES — NEVER VIOLATE

1. **NEVER reuse interview clips.** For EVERY video, find 2-4 SHORT clips (3-5 seconds each) specific to THIS topic:
   - Use `youtube_search` to find 5-10 candidate videos on the topic
   - Use `youtube_transcript` to scan each for good moments (emotional quotes, expert statements, on-the-ground footage)
   - Use `clip_youtube_video` to clip 3-5 second segments from different videos
   - Scatter these micro-clips throughout the video between data scenes
   - Each clip should show a DIFFERENT person/perspective
   - If you truly can't find clips, use B-roll video from Pexels instead — NEVER reuse clips from another FilmFlow video

2. **NEVER use generic stock images that just transition one to the next.** Every image must be OVERLAYED with data, text, or graphics — never shown alone as a full-screen static shot. Use images as BACKGROUNDS (opacity 0.1-0.2) behind data, or as PANELS that slide in from the side alongside text.

3. **Images must be RELEVANT to the specific narration.** When the narrator says "healthcare costs tripled," show a hospital bill image. When they say "pension," show an older worker. Don't show a random sunset.

4. **Pair every animation with the exact word being spoken.** Read the `.timing.json` and set animation start frames to the frame when the narrator says the relevant number or concept. This is non-negotiable.

5. **NEVER show interview/video clips full-screen.** Always composite them:
   - Place the clip in a rounded rectangle (borderRadius 12px) at 60-70% size
   - Position it off-center (left or right third)
   - Put it on top of a colored or textured background (not black)
   - Add a subtle drop shadow
   - Include a lower-third with the speaker's quote and attribution
   - The background behind the clip should use the warm paper color or a relevant image at low opacity

## Phase 3: VISUALS

For each scene, decide the visual approach based on the storyboard:

### CRITICAL: Every Narration Beat Gets a Visual Beat

**Never leave a static visual on screen while narration continues.** The cardinal sin of explainer video is a number sitting on screen for 20 seconds while the narrator talks over it.

Break each scene's narration into beats. Each beat (2-5 seconds) gets its own visual change:

Example for a 25-second scene about housing costs:
- Beat 1 (0-5s): "$1.5M" counter animates up → number is the focus
- Beat 2 (5-12s): bar chart grows showing SF vs national median → comparison is the focus
- Beat 3 (12-18s): "$133K income needed" flies in from right → new stat appears
- Beat 4 (18-25s): "78% of income" pie/ring animates → final punch

Use `<Sequence>` to compose multiple visuals within a single scene. Each Sequence contains a different component or animation state. The voiceover `.timing.json` tells you exactly when each word is spoken — use it to trigger visual transitions on the right frame.

### Data Visualization Scenes
1. **Prepare the data:** `process_dataset` or `scrape_table` → clean JSON
2. **Choose the viz type** following the data-visualization skill
3. **Create the scene** using `create_scene` with custom TSX that composes multiple visual beats within `<Sequence>` blocks
4. **Sync to voiceover:** Read the `.timing.json` file. Map each narration beat to a visual transition. No visual should be static for more than 5 seconds.

### YouTube Clip Scenes
1. **Find the right video:** `youtube_search` for the topic
2. **Find the right moment:** `youtube_transcript` to search captions for relevant quotes
3. **Optional — visual search:** If you need a specific visual (not just a quote), use `index_video` then `visual_search`
4. **Clip it:** `clip_youtube_video` with the start/end timestamps
5. **Create a scene** that displays the clip with a Remotion `<Video>` component, plus lower-third text overlay

### Photo/Image Scenes
1. **Find the image:** `fetch_wikimedia_image` for historical photos, or use user-provided assets
2. **Create a scene** with the image displayed using Remotion's `<Img>` component
3. Apply Ken Burns effect (slow zoom/pan) for static images

### Headline Screenshot Scenes
1. **Find the article:** `web_search` to find a relevant news article URL
2. **Screenshot it:** `screenshot_headline` with the key phrase highlighted
3. **Create a scene** that displays the screenshot with a zoom-in animation

### Title Card Scenes
Write a custom scene with `create_scene`:
- Large serif title text (Playfair Display)
- Subtitle in sans-serif (Source Sans 3)
- Warm paper background
- Fade-in animation

## Background Music

EVERY video must have background music. The template includes `public/audio/background-music.mp3` (2:10 long).

Add this to the ROOT composition (not individual scenes) so it plays continuously:
```tsx
<Audio src={staticFile("audio/background-music.mp3")} volume={0.20} />
```

Volume 0.20 (20%) — audible but doesn't compete with narration. Increase to 0.30 during non-narrated moments (intro montage, interview clips). Decrease to 0.12 during dense data narration.

## Intro Rules

The intro MUST be punchy — 3-5 seconds max. It should:
- Open with a RAPID image montage (3-4 images, each shown for 15-20 frames)
- Images should be grayscale, high-contrast, with a dark overlay
- The hook stat or phrase punches in OVER the images (large serif, white text on dark)
- Add a transition SFX (whoosh or impact) as the text appears
- Background music should be louder here (volume 0.25)
- Then CUT immediately to the first data scene or interview

DO NOT make the intro a slow fade-in. It should hit hard and fast.

## Phase 4: ASSEMBLE

1. **List all scenes in order** with their durations (from voiceover timing)
2. **Add audio paths** — each scene's voiceover MP3 file
3. **Call `add_to_timeline`** with the complete scene list
   - Scene filenames (without extension)
   - Duration in frames (from voiceover `durationFrames` + padding)
   - Audio paths (relative to `public/`)

## Phase 5: RENDER & CRITIQUE

1. **Preview key frames** — `preview_scene` at the midpoint of each scene to verify visuals
2. **Render the full video** — `render_video` → MP4
3. **Critique** — `critique_video` sends the MP4 to Gemini for review
4. **Evaluate scores:**
   - All categories ≥ 7: **Ship it.** Present the final video to the user.
   - Any category < 7: **Fix and re-render.** Read Gemini's notes, fix the weakest scenes, re-render.
   - Max 3 critique-fix iterations. After 3, present what you have with the scores.

## Project Setup

Every video gets its own Remotion project:

1. **Copy the template:** `cp -r src/templates output/<video-slug>`
2. **Install deps:** `cd output/<video-slug> && bun install`
3. **Create scenes** in `output/<video-slug>/src/scenes/`
4. **Assets go in** `output/<video-slug>/public/` (clips/, audio/, images/, data/)
5. **Entry point** is `src/index.ts` (already has `registerRoot`)
6. **Render with** `npx remotion render src/index.ts Root out/video.mp4`

## Pacing Guidelines

| Scene Type | Target Duration | Frames (30fps) |
|-----------|----------------|-----------------|
| Hook / title | 15-20s | 450-600 |
| Data viz | 20-35s | 600-1050 |
| YouTube clip | 10-20s | 300-600 |
| Photo with narration | 10-15s | 300-450 |
| Headline screenshot | 5-10s | 150-300 |
| Closing | 10-15s | 300-450 |
| **Total target** | **2:30 - 4:00** | **4500-7200** |

## Scene Transitions

Between scenes, allow a brief pause:
- Add 15-30 frames of padding between scenes (0.5-1 second)
- Fade-out the current scene in the last 10 frames (opacity interpolation)
- Fade-in the next scene in the first 10 frames
- This creates a gentle dissolve effect

## Checklist Before Rendering

- [ ] All voiceovers generated with word-level timing
- [ ] All data downloaded and processed
- [ ] All YouTube clips downloaded
- [ ] All scenes created and reference correct data/audio paths
- [ ] Root.tsx updated with all scenes via `add_to_timeline`
- [ ] Entry point (`src/index.ts`) has `registerRoot`
- [ ] `bun install` run in the project directory
- [ ] Font files present in `public/fonts/`
- [ ] TopoJSON data present in `public/data/` (if using maps)
