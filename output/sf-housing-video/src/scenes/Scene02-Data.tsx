import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Audio,
  staticFile,
  Easing,
} from "remotion";
import { tokens } from "../tokens";

/**
 * Scene 02 — "The consequences were slow, then sudden"
 *
 * Voice-synced choreography from scene02-data.timing.json.
 * Every narration beat triggers a visual beat.
 */

// Timing constants mapped from word-level voiceover data
const T = {
  // Act 1: Line chart draws as narrator describes price history
  titleIn: 0,            // "The consequences..."
  lineStart: 93,         // "In the mid-nineties, a home..."
  price300k: 179,        // "three hundred thousand dollars"
  price500k: 249,        // "By two thousand, it was five hundred thousand"
  techBoom: 356,         // "Then the tech boom hit"
  techBoomEnd: 430,      // "Between twenty-twelve..."

  // Act 2: Cut to bar chart
  cutToBars: 430,        // "Between twenty-twelve and twenty-sixteen"
  jobsGrow: 509,         // "the Bay Area added"
  jobsLand: 610,         // "...thousand jobs."
  homesStart: 640,       // "But it permitted only"
  homesLand: 703,        // "...new homes."
  ratioCallout: 732,     // "That's six jobs for every one home"
};

// Price data for the line chart
const PRICES = [
  { year: "1995", value: 300000 },
  { year: "2000", value: 500000 },
  { year: "2005", value: 750000 },
  { year: "2008", value: 800000 },
  { year: "2012", value: 650000 },
  { year: "2016", value: 1100000 },
  { year: "2019", value: 1360000 },
  { year: "2025", value: 1500000 },
];

const CHART_LEFT = 140;
const CHART_TOP = 180;
const CHART_WIDTH = 1640;
const CHART_HEIGHT = 550;
const MAX_PRICE = 1600000;

export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Which act are we in?
  const showBars = frame >= T.cutToBars;

  // --- ACT 1: Line chart ---

  // Title
  const titleOpacity = interpolate(frame, [T.titleIn, T.titleIn + 20], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleSlide = interpolate(frame, [T.titleIn, T.titleIn + 20], [15, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Line draws progressively: starts at frame 93, reaches each point as narrator mentions it
  // Map narrator timing to data point indices
  const lineProgress = (() => {
    if (frame < T.lineStart) return 0;
    if (frame < T.price300k) {
      // Drawing to first point (1995 = index 0)
      return interpolate(frame, [T.lineStart, T.price300k], [0, 0.5 / PRICES.length], {
        extrapolateRight: "clamp",
      });
    }
    if (frame < T.price500k) {
      // Holding at first point, then drawing to second (2000)
      return interpolate(frame, [T.price300k, T.price500k], [0.5 / PRICES.length, 1.5 / PRICES.length], {
        extrapolateRight: "clamp",
      });
    }
    if (frame < T.techBoom) {
      // Slow draw through middle points
      return interpolate(frame, [T.price500k, T.techBoom], [1.5 / PRICES.length, 4 / PRICES.length], {
        extrapolateRight: "clamp",
      });
    }
    // "Tech boom hit" — accelerate through the rest
    return interpolate(frame, [T.techBoom, T.cutToBars], [4 / PRICES.length, 1], {
      extrapolateRight: "clamp",
    });
  })();

  // Convert prices to chart coordinates
  const points = PRICES.map((d, i) => ({
    x: CHART_LEFT + (i / (PRICES.length - 1)) * CHART_WIDTH,
    y: CHART_TOP + CHART_HEIGHT - (d.value / MAX_PRICE) * CHART_HEIGHT,
    year: d.year,
    value: d.value,
  }));

  const visibleCount = Math.max(1, Math.ceil(points.length * lineProgress));
  const pathData = points
    .slice(0, visibleCount)
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  // Call-out labels appear at exact narration moments
  const label300kOpacity = interpolate(frame, [T.price300k, T.price300k + 12], [0, 1], {
    extrapolateRight: "clamp",
  });
  const label300kSlide = interpolate(frame, [T.price300k, T.price300k + 12], [10, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const label500kOpacity = interpolate(frame, [T.price500k + 30, T.price500k + 42], [0, 1], {
    extrapolateRight: "clamp",
  });

  const label15mOpacity = interpolate(frame, [T.cutToBars - 20, T.cutToBars - 5], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Act 1 fades out when we cut to bars
  const act1Opacity = showBars
    ? interpolate(frame, [T.cutToBars, T.cutToBars + 15], [1, 0], { extrapolateRight: "clamp" })
    : 1;

  // --- ACT 2: Bar chart ---
  const act2Opacity = showBars
    ? interpolate(frame, [T.cutToBars, T.cutToBars + 15], [0, 1], { extrapolateRight: "clamp" })
    : 0;

  // Jobs bar grows from cutToBars to jobsLand
  const jobsProgress = interpolate(frame, [T.jobsGrow, T.jobsLand], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Homes bar grows after "But it permitted only..."
  const homesProgress = interpolate(frame, [T.homesStart, T.homesLand], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // "6:1" ratio callout
  const ratioOpacity = interpolate(frame, [T.ratioCallout, T.ratioCallout + 15], [0, 1], {
    extrapolateRight: "clamp",
  });
  const ratioScale = spring({
    frame: frame - T.ratioCallout,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  // Bar chart dimensions
  const BAR_WIDTH = 160;
  const BAR_MAX_HEIGHT = 500;
  const BAR_BOTTOM = 780;
  const JOBS_X = 700;
  const HOMES_X = 1050;

  const jobsHeight = BAR_MAX_HEIGHT * jobsProgress;
  const homesHeight = (58000 / 373000) * BAR_MAX_HEIGHT * homesProgress;

  return (
    <div
      style={{
        width: tokens.layout.width,
        height: tokens.layout.height,
        backgroundColor: tokens.colors.background,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Audio src={staticFile("audio/scene02-data.mp3")} />

      {/* ═══ ACT 1: Line Chart ═══ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: act1Opacity,
          padding: tokens.layout.padding,
        }}
      >
        {/* Title */}
        <div
          style={{
            fontFamily: tokens.fonts.heading,
            fontSize: 46,
            fontWeight: tokens.fontWeights.bold,
            color: tokens.colors.text,
            opacity: titleOpacity,
            transform: `translateY(${titleSlide}px)`,
          }}
        >
          SF median home price
        </div>

        {/* Chart */}
        <svg
          width={tokens.layout.width}
          height={tokens.layout.height}
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          {/* Y-axis gridlines */}
          {[300000, 600000, 900000, 1200000, 1500000].map((val) => {
            const y = CHART_TOP + CHART_HEIGHT - (val / MAX_PRICE) * CHART_HEIGHT;
            return (
              <g key={val}>
                <line
                  x1={CHART_LEFT}
                  y1={y}
                  x2={CHART_LEFT + CHART_WIDTH}
                  y2={y}
                  stroke={tokens.colors.backgroundAlt}
                  strokeWidth={1}
                />
                <text
                  x={CHART_LEFT - 16}
                  y={y + 5}
                  textAnchor="end"
                  fontFamily={tokens.fonts.body}
                  fontSize={14}
                  fill={tokens.colors.textLight}
                >
                  {val >= 1000000 ? `$${val / 1000000}M` : `$${val / 1000}K`}
                </text>
              </g>
            );
          })}

          {/* Baseline */}
          <line
            x1={CHART_LEFT}
            y1={CHART_TOP + CHART_HEIGHT}
            x2={CHART_LEFT + CHART_WIDTH}
            y2={CHART_TOP + CHART_HEIGHT}
            stroke={tokens.colors.textMuted}
            strokeWidth={1}
          />

          {/* The line */}
          <path
            d={pathData}
            fill="none"
            stroke={tokens.colors.text}
            strokeWidth={tokens.chart.lineWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data point dots */}
          {points.slice(0, visibleCount).map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={tokens.chart.dotRadius}
              fill={tokens.colors.accent}
            />
          ))}

          {/* X-axis year labels */}
          {points.slice(0, visibleCount).map((p) => (
            <text
              key={p.year}
              x={p.x}
              y={CHART_TOP + CHART_HEIGHT + 30}
              textAnchor="middle"
              fontFamily={tokens.fonts.body}
              fontSize={16}
              fill={tokens.colors.textMuted}
            >
              {p.year}
            </text>
          ))}

          {/* "$300K" call-out at first data point */}
          <text
            x={points[0].x + 10}
            y={points[0].y - 18}
            fontFamily={tokens.fonts.heading}
            fontSize={36}
            fontWeight={tokens.fontWeights.black}
            fill={tokens.colors.text}
            opacity={label300kOpacity}
            transform={`translate(0, ${label300kSlide})`}
          >
            $300K
          </text>

          {/* "$500K" call-out at 2000 data point */}
          {visibleCount > 1 && (
            <text
              x={points[1].x + 10}
              y={points[1].y - 18}
              fontFamily={tokens.fonts.heading}
              fontSize={32}
              fontWeight={tokens.fontWeights.bold}
              fill={tokens.colors.textMuted}
              opacity={label500kOpacity}
            >
              $500K
            </text>
          )}

          {/* "$1.5M" call-out at last data point */}
          {visibleCount >= PRICES.length && (
            <text
              x={points[points.length - 1].x - 20}
              y={points[points.length - 1].y - 20}
              textAnchor="end"
              fontFamily={tokens.fonts.heading}
              fontSize={40}
              fontWeight={tokens.fontWeights.black}
              fill={tokens.colors.text}
              opacity={label15mOpacity}
            >
              $1.5M
            </text>
          )}
        </svg>

        {/* Source */}
        <div
          style={{
            position: "absolute",
            bottom: tokens.layout.padding,
            left: tokens.layout.padding,
            fontFamily: tokens.fonts.body,
            fontSize: 14,
            color: tokens.colors.textLight,
            opacity: interpolate(frame, [T.lineStart, T.lineStart + 20], [0, 1], {
              extrapolateRight: "clamp",
            }),
          }}
        >
          Source: Redfin, SFist
        </div>
      </div>

      {/* ═══ ACT 2: Bar Chart — Jobs vs Housing ═══ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: act2Opacity,
          padding: tokens.layout.padding,
        }}
      >
        {/* Title */}
        <div
          style={{
            fontFamily: tokens.fonts.heading,
            fontSize: 46,
            fontWeight: tokens.fontWeights.bold,
            color: tokens.colors.text,
            opacity: act2Opacity,
          }}
        >
          The jobs-housing mismatch
        </div>
        <div
          style={{
            fontFamily: tokens.fonts.body,
            fontSize: 20,
            color: tokens.colors.textMuted,
            marginTop: 4,
            opacity: act2Opacity,
          }}
        >
          Bay Area, 2012–2016
        </div>

        {/* Jobs bar */}
        <div
          style={{
            position: "absolute",
            left: JOBS_X,
            bottom: tokens.layout.height - BAR_BOTTOM,
            width: BAR_WIDTH,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Value label */}
          <div
            style={{
              fontFamily: tokens.fonts.heading,
              fontSize: 36,
              fontWeight: tokens.fontWeights.black,
              color: tokens.colors.text,
              marginBottom: 8,
              opacity: jobsProgress > 0.8 ? 1 : 0,
            }}
          >
            {Math.round(373000 * jobsProgress).toLocaleString()}
          </div>
          {/* Bar */}
          <div
            style={{
              width: BAR_WIDTH,
              height: jobsHeight,
              backgroundColor: tokens.colors.accent,
            }}
          />
          {/* Label */}
          <div
            style={{
              fontFamily: tokens.fonts.body,
              fontSize: 18,
              color: tokens.colors.textMuted,
              marginTop: 12,
              textAlign: "center",
              opacity: jobsProgress > 0.3 ? 1 : 0,
            }}
          >
            Jobs added
          </div>
        </div>

        {/* Homes bar */}
        <div
          style={{
            position: "absolute",
            left: HOMES_X,
            bottom: tokens.layout.height - BAR_BOTTOM,
            width: BAR_WIDTH,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Value label */}
          <div
            style={{
              fontFamily: tokens.fonts.heading,
              fontSize: 36,
              fontWeight: tokens.fontWeights.black,
              color: tokens.colors.text,
              marginBottom: 8,
              opacity: homesProgress > 0.8 ? 1 : 0,
            }}
          >
            {Math.round(58000 * homesProgress).toLocaleString()}
          </div>
          {/* Bar */}
          <div
            style={{
              width: BAR_WIDTH,
              height: homesHeight,
              backgroundColor: "#5b7e96",
            }}
          />
          {/* Label */}
          <div
            style={{
              fontFamily: tokens.fonts.body,
              fontSize: 18,
              color: tokens.colors.textMuted,
              marginTop: 12,
              textAlign: "center",
              opacity: homesProgress > 0.3 ? 1 : 0,
            }}
          >
            Homes permitted
          </div>
        </div>

        {/* "6:1" ratio callout — appears between the bars */}
        <div
          style={{
            position: "absolute",
            left: JOBS_X + BAR_WIDTH + 30,
            top: 420,
            opacity: ratioOpacity,
            transform: `scale(${Math.min(ratioScale, 1)})`,
            transformOrigin: "center center",
          }}
        >
          <div
            style={{
              fontFamily: tokens.fonts.heading,
              fontSize: 80,
              fontWeight: tokens.fontWeights.black,
              color: tokens.colors.accent,
              lineHeight: 1,
            }}
          >
            6:1
          </div>
          <div
            style={{
              fontFamily: tokens.fonts.body,
              fontSize: 20,
              color: tokens.colors.textMuted,
              marginTop: 4,
            }}
          >
            jobs per home
          </div>
        </div>

        {/* Source */}
        <div
          style={{
            position: "absolute",
            bottom: tokens.layout.padding,
            left: tokens.layout.padding,
            fontFamily: tokens.fonts.body,
            fontSize: 14,
            color: tokens.colors.textLight,
          }}
        >
          Source: BIA Bay Area
        </div>
      </div>
    </div>
  );
};
