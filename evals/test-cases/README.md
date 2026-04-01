# FilmFlow Eval Test Cases

Each test case defines a prompt, expected scene types, and quality thresholds.
The eval harness renders each one, sends it to Gemini for critique, and tracks scores over time.

## Test Cases

| # | Name | Tests | Target Score |
|---|------|-------|-------------|
| 1 | `stat-card` | Single StatCard animation | 7/10 |
| 2 | `bar-chart` | AnimatedBarChart with 5+ categories | 7/10 |
| 3 | `line-chart` | AnimatedLineChart with trend data | 7/10 |
| 4 | `comparison` | ComparisonChart (A vs B) | 7/10 |
| 5 | `timeline` | AnimatedTimeline with 5+ events | 7/10 |
| 6 | `choropleth` | ChoroplethMap with state data | 7/10 |
| 7 | `multi-scene` | 3 scenes composed with transitions | 7/10 |
| 8 | `narration-sync` | Data viz + ElevenLabs voiceover | 7/10 |
| 9 | `mini-explainer` | Full 2-minute explainer video | 7/10 |
| 10 | `complex-multi-viz` | 4+ viz types in one video | 7/10 |

## Scoring

Gemini evaluates on 5 axes (1-10 each):
- **Pacing** — scene timing and rhythm
- **Visual Coherence** — consistent style, clean transitions
- **Data Accuracy** — charts match narration/data
- **Audio Sync** — voiceover aligned with visuals
- **Overall** — professional explainer quality

## Running Evals

```bash
bun run evals/run.ts           # Run all test cases
bun run evals/run.ts stat-card # Run a single test case
```
