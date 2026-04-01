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

### Animation Principles
- **Stagger entries.** Bars grow one by one (5 frame delay each). Lines draw progressively. Timeline events slide in sequentially.
- **Spring physics** for natural motion. Use Remotion's `spring()` with `{ damping: 20, stiffness: 100 }`.
- **Hold the final state.** After animation completes, hold for at least 2 seconds so the viewer can read.
- **Sync to narration.** When the narrator says a number, that's when it should appear on screen.

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
