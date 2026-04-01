# FilmFlow — Design Spec

**Date:** 2026-04-01
**Status:** Draft
**Author:** Zane + Claude

## Vision

"Vibecoding" for high-quality video journalism. An AI terminal agent that takes a natural language prompt and produces a fully rendered Vox-style explainer video (MP4) with narration, sourced footage, data visualizations, and motion graphics.

Just as Claude Code abstracted away DevOps and deployment for software creation, FilmFlow abstracts away After Effects, motion design, and video editing for video journalism.

## Scope — MVP

**In scope:**
- Vox-style explainer videos with strong data visualization
- Terminal-based agent (no UI — engine only)
- YouTube research via transcript analysis + clipping
- Public dataset search, scraping, and processing
- ElevenLabs TTS narration
- Remotion-based video composition and rendering
- Plan mode (storyboard review) before expensive rendering
- Gemini Video Understanding for agent self-critique after rendering

**Out of scope (future):**
- Web UI / visual timeline editor
- User-provided datasets (CSV/JSON upload)
- Visual analysis of YouTube videos (frame-level)
- News packages, talking head formats
- AI-generated imagery (Runway, Sora, etc.)
- User-recorded voiceover

## Core User Journey

```
1. User runs: filmflow "Make a video about the housing crisis in SF"
2. Agent enters PLAN MODE:
   - Researches topic (web search, YouTube, datasets)
   - Writes script with narration
   - Produces storyboard: scene-by-scene breakdown with
     descriptions, data viz specs, clip references, timing
3. User reviews storyboard, iterates via prompting
   ("make the intro shorter", "add a chart comparing rent prices")
4. User approves → Agent enters EXECUTE MODE:
   - Downloads/clips YouTube footage
   - Processes datasets
   - Generates voiceover via ElevenLabs
   - Writes Remotion scene components
   - Assembles timeline
5. Agent renders video → MP4
6. Agent enters CRITIQUE MODE:
   - Sends rendered video to Gemini Video Understanding
   - Reviews pacing, visual quality, data accuracy, transitions
   - Suggests improvements or auto-fixes minor issues
7. Final MP4 output
```

## Architecture

### Agent Core

Built on the **Claude Agent SDK (TypeScript)**. Claude is the director — it orchestrates the entire pipeline through custom tools. The agent uses plan/execute modes similar to Claude Code.

```
┌─────────────────────────────────────────────┐
│              Claude Agent (Opus)             │
│                                             │
│  ┌─────────┐ ┌──────────┐ ┌─────────────┐  │
│  │Research │ │  Asset   │ │ Composition │  │
│  │ Tools   │ │  Tools   │ │   Tools     │  │
│  └────┬────┘ └────┬─────┘ └──────┬──────┘  │
│       │           │              │          │
│  ┌────┴────┐ ┌────┴─────┐ ┌─────┴──────┐  │
│  │Render   │ │ Critique │ │  Built-in  │  │
│  │ Tools   │ │  Tools   │ │   Tools    │  │
│  └─────────┘ └──────────┘ └────────────┘  │
└─────────────────────────────────────────────┘
```

### Custom Tools

#### 1. Research Tools

| Tool | Description | Implementation |
|------|-------------|----------------|
| `youtube_search` | Search YouTube for relevant videos on a topic | YouTube Data API v3 |
| `youtube_transcript` | Fetch timestamped captions for a video | `youtube-transcript` npm package |
| `dataset_search` | Search public data sources (data.gov, World Bank, FRED, WHO) | Multiple API clients |
| `scrape_table` | Extract data tables from web pages | Cheerio + heuristic table detection |

Built-in Agent SDK tools (`web_search`, `web_fetch`, `Read`, `Write`, `Bash`, `Glob`, `Grep`) are also available.

#### 2. Visual Search Tools (SentrySearch)

Powered by [SentrySearch](https://github.com/ssrajadh/sentrysearch) — semantic search over video using Gemini Embedding 2. Enables finding visually relevant moments in footage beyond what transcripts capture.

| Tool | Description | Implementation |
|------|-------------|----------------|
| `index_video` | Chunk and embed a downloaded video for semantic search | SentrySearch `index` via subprocess |
| `visual_search` | Search indexed video for visually matching moments | SentrySearch `search` via subprocess |

#### 3. Asset Tools

| Tool | Description | Implementation |
|------|-------------|----------------|
| `clip_youtube_video` | Download and clip a YouTube video segment by timestamps | `yt-dlp` subprocess |
| `generate_voiceover` | Generate narration audio from script text | ElevenLabs API |
| `process_dataset` | Clean/transform/filter a dataset, output viz-ready JSON | Pandas via subprocess or Node data libs |

#### 4. Composition Tools

| Tool | Description | Implementation |
|------|-------------|----------------|
| `create_scene` | Write a Remotion React component for a scene | Writes TSX to project `scenes/` dir |
| `create_data_viz` | Create animated data viz from a template + data | Parameterized Remotion components |
| `add_to_timeline` | Add a scene to the video timeline with duration/transition | Updates `Root.tsx` composition |
| `preview_scene` | Render a single scene to screenshot or short clip | Remotion `renderStill` / `renderMedia` |

#### 5. Render & Critique Tools

| Tool | Description | Implementation |
|------|-------------|----------------|
| `render_video` | Render full Remotion project to MP4 | `npx remotion render` |
| `critique_video` | Send rendered video to Gemini Video Understanding for review | Gemini API with video input |

### Data Viz Template System

A library of parameterized Remotion components with consistent design tokens (colors, fonts, animation curves, spacing):

- **AnimatedBarChart** — bars that grow, sort, or race
- **AnimatedLineChart** — line that draws progressively with data points
- **ChoroplethMap** — geographic data with animated color fills
- **AnimatedTimeline** — events along a time axis, progressive reveal
- **StatCard** — big number with label + animated count-up
- **ComparisonChart** — side-by-side or before/after comparisons

Each template accepts:
- `data`: structured JSON (output of `process_dataset`)
- `style`: optional overrides (colors, labels, annotations)
- `animation`: timing config (duration, easing, stagger)
- `caption`: text overlay / source attribution

### Design Tokens

All templates share a visual language:
```typescript
const tokens = {
  colors: {
    primary: '#1a1a2e',
    accent: '#e94560',
    secondary: '#0f3460',
    background: '#16213e',
    text: '#eee',
    chart: ['#e94560', '#0f3460', '#533483', '#48c9b0', '#f39c12'],
  },
  fonts: {
    heading: 'Inter',
    body: 'Inter',
    mono: 'JetBrains Mono',
  },
  animation: {
    easeIn: [0.4, 0, 1, 1],
    easeOut: [0, 0, 0.2, 1],
    spring: { damping: 20, stiffness: 300 },
  },
};
```

### Project Structure (per video)

```
/output/<video-slug>/
  ├── src/
  │   ├── Root.tsx              # Timeline assembly (Composition)
  │   ├── scenes/
  │   │   ├── Scene01-Intro.tsx
  │   │   ├── Scene02-DataViz.tsx
  │   │   └── Scene03-Conclusion.tsx
  │   ├── components/           # Shared viz templates
  │   │   ├── AnimatedBarChart.tsx
  │   │   ├── AnimatedLineChart.tsx
  │   │   ├── ChoroplethMap.tsx
  │   │   └── ...
  │   └── tokens.ts             # Design tokens
  ├── public/
  │   ├── clips/                # Downloaded YouTube clips
  │   ├── audio/                # ElevenLabs voiceover segments
  │   └── data/                 # Processed datasets (JSON)
  ├── package.json
  └── remotion.config.ts
```

### Self-Critique Loop (Gemini)

After rendering, the agent sends the video to Gemini Video Understanding and asks it to evaluate:

1. **Pacing** — are scenes too long/short? Does the rhythm feel right?
2. **Visual coherence** — do transitions work? Are overlays readable?
3. **Data accuracy** — do charts match the narration? Are labels correct?
4. **Audio sync** — does voiceover align with visual changes?
5. **Overall quality** — would this pass as a professional explainer?

Gemini returns structured feedback. The agent can then:
- Auto-fix minor issues (timing adjustments, transition changes)
- Re-render specific scenes
- Report issues that need user input

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Agent orchestration | Claude Agent SDK (TypeScript) |
| LLM | Claude Opus 4.6 |
| Video composition | Remotion |
| Data visualization | D3.js / custom Remotion components |
| YouTube research | YouTube Data API v3 + `youtube-transcript` |
| YouTube clipping | `yt-dlp` |
| Voiceover | ElevenLabs API |
| Dataset processing | Node.js data libs (or Python/Pandas subprocess) |
| Visual video search | SentrySearch (Gemini Embedding 2 + ChromaDB) |
| Self-critique | Gemini Video Understanding API |
| Web scraping | Cheerio |

### API Keys Required

- `ANTHROPIC_API_KEY` — Claude Agent SDK
- `YOUTUBE_API_KEY` — YouTube Data API v3
- `ELEVENLABS_API_KEY` — ElevenLabs TTS
- `GOOGLE_API_KEY` — Gemini Video Understanding

## Open Questions

1. **Video resolution/format** — 1080p default? 16:9 only?
2. **Music/background audio** — royalty-free music library? Or no music for MVP?
3. **YouTube clip fair use** — how much clipping is acceptable? Watermark handling?
4. **Max video length** — cap at 5 minutes for MVP?
5. **Remotion licensing** — Remotion requires a license for companies. Confirm approach.

## Future Roadmap

- Web UI with timeline editor and real-time preview
- User dataset upload (CSV/JSON)
- Visual analysis of YouTube videos (frame-level understanding)
- AI-generated imagery (Runway, Sora)
- Multiple video formats (news packages, data stories, social clips)
- Custom voice cloning
- Collaborative editing
- Template marketplace
