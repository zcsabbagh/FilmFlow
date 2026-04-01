# Research Skill

Conduct thorough research before writing any storyboard or script. This skill runs BEFORE the scriptwriting and video-production skills — it produces a research brief that informs the plan.

## Research Goal

Produce a **research brief** — a structured document with all the raw material needed to write a Vox-quality script. The brief should give the scriptwriter:
- Key facts and statistics with sources
- Historical context and timeline
- Best available data for visualizations
- Candidate interview clips from YouTube
- Relevant news headlines (for screenshot tool)
- Historical photos (for Wikimedia tool)
- Surprising comparisons and "wait, what?" facts

## Research Process

### Step 1: Broad Context Search

Use `web_search` to understand the landscape:
- Search the topic + "explained" or "why"
- Search the topic + "data" or "statistics"
- Search the topic + "history" or "timeline"

Read 3-5 top results with `web_fetch`. Extract:
- Core facts and statistics
- Key dates and events
- Expert names and quotes
- Surprising angles most people don't know about

### Step 2: Find the Data

For every claim that involves a number, find the actual data source:

1. **`dataset_search`** — search data.gov and World Bank for official datasets
2. **`scrape_table`** — pull data tables from Wikipedia, government reports, research papers
3. **`web_search`** + `web_fetch` — find charts and datasets in news articles, think tank reports

For each dataset found, note:
- What it measures
- Time range
- Source (for attribution)
- Download URL
- Which viz type would work best

### Step 3: Find YouTube Sources

Search for existing coverage of the topic:

1. **`youtube_search`** — search for the topic, filter for explainers, interviews, news segments
2. **`youtube_transcript`** — for the top 3-5 results, fetch transcripts and scan for:
   - Expert quotes ("The reason this happens is...")
   - Personal stories ("I've been on the waitlist for...")
   - Dramatic moments ("And then in 2012, everything changed...")
3. Note timestamps for potential clips (start/end seconds)

Look specifically for:
- **Expert interviews** — professors, policy makers, affected individuals
- **On-the-ground footage** — the thing itself (construction, protests, the city, the place)
- **Existing explainers** — what angle did others take? How can we do it differently?

### Step 4: Find Visuals

1. **`fetch_wikimedia_image`** — search for historical photos relevant to the topic
2. **`web_search`** — find news article URLs for the `screenshot_headline` tool
3. Note any maps that would be useful (which regions/states/countries to highlight)

### Step 5: Find the Angle

The most important research step. After gathering all material, answer:

1. **What's the most surprising fact?** — this becomes the hook
2. **What's the common misconception?** — this creates the "but here's the thing" turn
3. **What comparison reveals the most?** — this becomes the strongest data viz
4. **What's the human cost?** — this becomes the emotional anchor
5. **What's changing (or not)?** — this becomes the closing

### Step 6: Write the Research Brief

Output a structured brief:

```markdown
# Research Brief: [Topic]

## Hook Candidates
- [Surprising fact 1 — source]
- [Surprising fact 2 — source]
- [Surprising fact 3 — source]

## Key Statistics
| Stat | Value | Source | Viz Type |
|------|-------|--------|----------|
| ... | ... | ... | StatCard / BarChart / etc |

## Timeline
| Date | Event | Source |
|------|-------|--------|
| ... | ... | ... |

## Data Sources
- [Dataset name] — [URL] — [what it measures]
- ...

## YouTube Clips
| Video | Timestamp | Quote/Moment | Use For |
|-------|-----------|--------------|---------|
| ... | 2:15-2:45 | "Expert quote..." | Scene 3 B-roll |

## Photos Available
- [Description] — Wikimedia Commons
- ...

## News Headlines (for screenshot tool)
- [Headline] — [URL] — highlight: "[key phrase]"
- ...

## Recommended Angle
[2-3 sentences on the best angle based on what was found]
```

Hand this brief to the planning phase (video-production skill Phase 1).

## Research Quality Checks

Before declaring research complete:
- [ ] At least 3 unique data sources identified
- [ ] At least 2 YouTube videos with transcripts reviewed
- [ ] At least 1 historical photo found
- [ ] At least 1 news headline URL for screenshot tool
- [ ] The hook is a specific, surprising fact (not a vague statement)
- [ ] Every statistic has a named source
