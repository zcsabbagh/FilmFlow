# Data Visualization Skill

Design animated data visualizations in the Vox editorial style. This skill is used during EXECUTE MODE when choosing and configuring visualizations for each scene.

## Visualization Selection

Match the data type to the right viz. Never use a complex viz when a simple one works.

| Data Pattern | Best Viz | Example |
|-------------|----------|---------|
| Single key number | **StatCard** | "$1.3M median home price" |
| Comparing categories | **AnimatedBarChart** | "Housing prices by city" |
| Trend over time | **AnimatedLineChart** | "Rent prices 2010-2024" |
| A vs B comparison | **ComparisonChart** | "SF builds 3K vs Tokyo builds 140K" |
| Chronological events | **AnimatedTimeline** | "History of housing policy" |
| Geographic data | **ChoroplethMap** | "Swing states", "Most expensive states" |
| Proportional comparison | **DotGrid** (use ComparisonChart) | "Texas vs Vermont population" |

## The Vox Data Viz Aesthetic

Reference images are in `visualization-inspo/`. Key principles:

### Colors
- **Background:** warm off-white paper (#f5f3ef) — NEVER dark backgrounds
- **Primary data:** salmon/coral (#e8a87c) — the signature Vox accent
- **Secondary data:** slate blue (#5b7e96), muted red (#c0392b)
- **Text:** dark charcoal (#3d3d3d), not pure black
- **Captions/sources:** light gray (#8a8a8a)

### Typography
- **Titles:** Playfair Display (serif), bold, 42-48px
- **Big call-out numbers:** Playfair Display, black weight (900), 80-200px
- **Labels and body:** Source Sans 3 (sans-serif), regular/semibold, 16-28px
- **Sources:** Source Sans 3, light gray, 14-16px

### Chart Style
- **No gridlines.** Let the data speak.
- **No chart borders or backgrounds.** Flat and clean.
- **Thick lines** (4px stroke) on line charts
- **Large dots** (8px radius) at data points
- **Sharp corners** on bars (no border-radius)
- **Call-out labels** for key data points — place the number right next to the peak/trough in large bold serif

### Animation Principles: Voice-Synced Choreography

**The #1 rule: every narration beat triggers a visual beat.** No static frames for more than 3 seconds.

The `generate_voiceover` tool returns a `.timing.json` file with word-level frame numbers. You MUST read this file and use it to choreograph every visual change.

**How to choreograph a scene:**

1. Read the `.timing.json` for the scene
2. Identify key phrases in the narration (numbers, transitions, key claims)
3. Map each phrase to a visual action:
   - When narrator says a number → that number animates on screen
   - When narrator says "but" or a contrast → visual transition happens
   - When narrator names a comparison → the comparison element appears
4. Write the scene component using `useCurrentFrame()` with the exact frame numbers from the timing data

**Example — "The jobs-housing mismatch" scene:**

```
Narration timing:                          Visual action:
─────────────────────────────────────────────────────────
frame 0:    "The consequences were slow"  → Title fades in
frame 93:   "In the mid-nineties, a home" → Line chart starts drawing
frame 179:  "three hundred thousand"       → "$300K" call-out appears at data point
frame 249:  "By two thousand"              → Line draws to 2000 point
frame 296:  "five hundred thousand"        → "$500K" call-out appears
frame 356:  "Then the tech boom hit"       → Line accelerates through 2005-2016
frame 430:  "the Bay Area added"           → CUT to bar chart, jobs bar starts growing
frame 547:  "three hundred and seventy"    → Jobs bar reaches 373K, number appears
frame 640:  "But it permitted only"        → Homes bar starts growing (much smaller)
frame 670:  "fifty-eight thousand"         → Homes bar reaches 58K, number appears
frame 732:  "That's six jobs"              → Large "6:1" call-out between the bars
```

**Implementation pattern:**

```tsx
// Read timing data at module level or via props
const TIMING = {
  lineStart: 93,        // "In the mid-nineties"
  label300k: 179,       // "three hundred thousand"
  label500k: 296,       // "five hundred thousand"
  techBoom: 356,        // "Then the tech boom hit"
  cutToBars: 430,       // "the Bay Area added"
  jobsLand: 547,        // "three hundred and seventy-three"
  homesStart: 640,      // "But it permitted only"
  homesLand: 670,       // "fifty-eight thousand"
  ratioCallout: 732,    // "That's six jobs"
};

// In the component, use frame-based conditions:
const frame = useCurrentFrame();
const showBars = frame >= TIMING.cutToBars;
const jobsProgress = showBars
  ? interpolate(frame, [TIMING.cutToBars, TIMING.jobsLand], [0, 1], { extrapolateRight: "clamp" })
  : 0;
```

**Key rules:**
- **NEVER use the template components as full-scene replacements.** The templates (AnimatedBarChart, etc.) are building blocks. Compose them inside custom scenes with `<Sequence>` blocks timed to the narration.
- **Spring physics** for natural motion: `spring({ damping: 20, stiffness: 100 })`.
- **Use `<Sequence from={frame}>` to orchestrate cuts** between different visual states within a scene.
- **Call-out labels** (big serif numbers placed near data points) should fade+slide in over 10-15 frames using `interpolate()`.
- **Contrast transitions** ("But..." moments): use a 5-frame opacity cross-fade between visual states.
- **Hold the final state** for at least 1.5 seconds after the last animation so the viewer can absorb it.

### Motion Design Principles (Gap: 3/10 vs Real Vox)

Real Vox uses multi-layered, physically-inspired motion. Our current animations are too simple (basic fades and grows). To close the gap:

**Layer every frame.** Never have a blank background. Use:
- Faded background photo from Wikimedia (opacity 0.1-0.15, grayscale)
- Subtle grid overlay (60px grid, opacity 0.2-0.3) for texture
- Diagonal hash lines (opacity 0.03) for depth

**Asymmetric layouts.** Don't center everything. Place the main element left-aligned at ~58% width, with supporting context on the right. This creates visual hierarchy.

**Multi-stage reveals per element:**
1. Scale from 0.85→1.0 (subtle size change)
2. Opacity from 0→1 (fade in)
3. Slide from 15px→0 in Y (lift into position)
All three happening simultaneously over 15-20 frames.

**Accent lines and separators.** After a number appears, draw a thin horizontal line (2px, accent color) underneath using spring animation. This creates a visual "underline" moment.

**Dim and shift focus.** When a new element appears, dim the previous one to 0.2 opacity. This creates a spotlight effect — the viewer's eye is always guided.

**Easing matters.** Always use `Easing.out(Easing.cubic)` for slides, `spring()` for scales. Never use linear interpolation for any visual motion.

## Visual Variety Rule

**Track which viz types you've used across the video.** Before choosing a viz for a new scene, check what's already been used. Aim for maximum variety:

- Never use the same viz type in back-to-back scenes
- If a viz type has been used twice, strongly prefer a different type unless it's genuinely the only option
- In a 6-scene video, aim for 5+ distinct visual types
- Remember you have MORE than just charts: ChoroplethMap, AnimatedTimeline, headline screenshots, YouTube clips, Wikimedia photos, custom scenes with progress bars or paycheck graphics

**Visual type inventory** — check off as you assign them:
- [ ] StatCard (big number)
- [ ] AnimatedBarChart
- [ ] AnimatedLineChart
- [ ] ComparisonChart (horizontal bars)
- [ ] ChoroplethMap (colored map)
- [ ] AnimatedTimeline (chronological events)
- [ ] Headline screenshot (news article with yellow highlight)
- [ ] YouTube clip (interview/footage)
- [ ] Photo with Ken Burns (Wikimedia historical image)
- [ ] Custom viz (progress bar, paycheck graphic, flowchart, dot grid)

If you've checked fewer than 5 types in a 6-scene video, reconsider your choices.

## Choosing the "Coolest" Visualization

When the data could work with multiple viz types, follow this decision process:

1. **What's the ONE insight?** Every viz should communicate exactly one takeaway.
2. **What creates the strongest contrast?** The best Vox vizzes show surprising scale differences.
3. **Can it be understood in 3 seconds?** If the viewer needs to study it, simplify.

### Hierarchy of Impact

From most to least impactful:

1. **Comparison that reveals absurdity** — "SF builds 3K units, Tokyo builds 140K" (ComparisonChart with dot grid)
2. **Single number that shocks** — "$700K per subsidized unit" (StatCard)
3. **Trend that tells a story** — "Home prices 2010-2024" (AnimatedLineChart with call-out at peak)
4. **Categories ranked** — "Prices by city" (AnimatedBarChart, sorted largest to smallest)
5. **Geographic pattern** — "Most expensive states" (ChoroplethMap)
6. **Timeline of events** — "Policy history" (AnimatedTimeline)

### When to Use Custom Scenes

Use `create_scene` (write TSX directly) instead of templates when:
- The viz needs a unique layout (flowchart, Rube Goldberg machine, split screen)
- You want to combine multiple viz types in one frame
- The data has a spatial/physical metaphor (dot grid showing population, icons)
- You need photo/image overlays (Wikimedia photos, headline screenshots)

## Preparing Data

Always use `process_dataset` to clean raw data before visualization:
- Round numbers to significant digits
- Sort by value (largest first for bar charts)
- Limit to 5-8 categories max (too many bars = unreadable)
- Include units and source attribution

## Source Attribution

EVERY visualization must include a source line at the bottom-left:
```
Source: US Census Bureau, 2024
```
Use `tokens.colors.textLight` (#b0b0b0), Source Sans 3, 14-16px.
