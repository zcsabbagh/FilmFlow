# Data Visualization Skill

Design animated data visualizations in the Vox editorial style. This skill is used during EXECUTE MODE when choosing and configuring visualizations for each scene.

## Visualization Selection — THINK CREATIVELY

**WARNING: Do NOT fall back on the same 6 templates for every video.** The biggest failure mode is producing videos that all look identical — StatCard hook → LineChart → BarChart → ComparisonChart → Map → Closing. If your scene sequence looks like that, START OVER.

### The Template Trap

The reusable components (StatCard, AnimatedBarChart, etc.) exist as building blocks, NOT as a menu to pick from. Real Vox invents a new visual concept for almost every scene. They might show:
- A physical object being manipulated (a globe being cut, a dollar bill being torn)
- A diagram that builds step by step (a flowchart, a process, a cause-and-effect chain)
- Side-by-side panels that reveal simultaneously
- An animated map with arrows and annotations showing movement
- A stack of items growing/shrinking to show scale
- A clock or calendar visualization showing time passage
- An isometric or 3D-style infographic
- A "before and after" split-screen
- Pictograms (rows of person icons, dollar icons, house icons)
- Annotated screenshots of real documents, reports, legislation

### How to Choose Visuals

For each scene, ask: **"What VISUAL METAPHOR best explains this concept?"**

NOT: "What chart type matches this data?"

Examples:
- "Healthcare costs tripled" → Don't use a bar chart. Show three stacked hospital bills, or a thermometer rising, or a receipt that keeps scrolling
- "$7.25 frozen since 2009" → Don't use a StatCard. Show a block of ice with the number frozen inside, or a calendar flipping from 2009 to 2025 with the number staying static
- "75% of land is single-family" → Don't use a pie chart. Show an aerial grid of SF where 3 out of 4 squares are colored as houses, or zoom into a map and shade the restricted zones
- "6 jobs per 1 home" → Don't use a bar chart. Show 6 person icons walking toward 1 house icon, or show 6 office buildings next to 1 tiny house

### Template Components Are Last Resort

Use `create_scene` (custom TSX) for MOST scenes. Only fall back to template components when:
- You're short on time and need a quick chart
- The data genuinely is best shown as a standard chart (rare)
- You're composing multiple small charts within a larger custom scene

### Minimum Variety Rule

In any video, you MUST have:
- At least 2 scenes that are entirely custom (no template components)
- No template component used more than once across the whole video
- At least 1 scene using real-world imagery (photo, screenshot, video clip)
- At least 1 scene using a visual metaphor (not a standard chart)

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

**Layer every frame.** Never have a blank background. But NEVER just show a stock photo full-screen:
- Faded background photo (opacity 0.1-0.15, grayscale) as TEXTURE, not content
- Photos should be RELEVANT to what's being said at that moment — search Pexels/Pixabay for the specific concept
- Overlay data/text ON TOP of the image, not next to it
- Images can slide in from the side as PANELS (40% width) alongside data on the other 60%
- Use subtle grid overlay (60px grid, opacity 0.2-0.3) for additional texture
- Use gradient masks on images so they blend with the background instead of sitting as rectangles

**Sound effects for transitions.** Use `generate_sound_effect` to create:
- A "subtle whoosh" for scene transitions
- A "soft impact" for number reveals
- A "gentle slide" for text appearing
Add these as `<Audio>` tags at transition points in scenes.

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

**Every video must feel visually unique.** If someone watches your housing video and minimum wage video back-to-back, they should NOT think "this looks like the same video with different numbers."

How to achieve this:
- **Start with the topic's natural visual language.** Housing → buildings, blueprints, maps. Healthcare → human bodies, pills, hospital imagery. Wages → money, clocks, paychecks. Let the topic drive the aesthetic, not a template.
- **Invent at least 2 scene types you've never used before.** Every video should push the visual vocabulary.
- **Vary the composition.** Don't always put the big number top-left. Try center-screen, bottom-right, full-bleed, split-screen, text-only, image-only.
- **Vary the animation style.** Not everything needs to spring in. Try: typewriter reveal, horizontal wipe, vertical stack-build, counter with blur, zoom from detail to wide.

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
