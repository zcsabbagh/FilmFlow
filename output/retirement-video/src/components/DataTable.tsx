import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { tokens } from "../tokens";

type Props = {
  headers: string[];
  rows: Array<Array<string | number>>;
  title?: string;
  source?: string;
  highlightRows?: number[];
  headerColor?: string;
};

export const DataTable: React.FC<Props> = ({
  headers,
  rows,
  title,
  source,
  highlightRows = [],
  headerColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pad = tokens.layout.padding;
  const tableLeft = pad;
  const tableRight = tokens.layout.width - pad;
  const tableWidth = tableRight - tableLeft;
  const colWidth = tableWidth / headers.length;

  const headerBg = headerColor ?? tokens.colors.primary;
  const rowHeight = 56;
  const headerHeight = 62;

  // Title
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleSlide = interpolate(frame, [0, 15], [20, 0], {
    extrapolateRight: "clamp",
  });

  // Header slides down from top
  const headerProgress = spring({
    frame: frame - 8,
    fps,
    config: { damping: 20, stiffness: 100 },
  });

  // Table top position (below title)
  const tableTop = title ? pad + 80 : pad + 20;

  // Check if a value looks numeric
  const isNumeric = (val: string | number): boolean => {
    if (typeof val === "number") return true;
    return !isNaN(Number(val)) && val.toString().trim() !== "";
  };

  return (
    <div
      style={{
        width: tokens.layout.width,
        height: tokens.layout.height,
        backgroundColor: tokens.colors.background,
        position: "relative",
        fontFamily: tokens.fonts.body,
        color: tokens.colors.text,
      }}
    >
      {/* Title */}
      {title && (
        <div
          style={{
            position: "absolute",
            top: pad,
            left: pad,
            right: pad,
            fontSize: 46,
            fontWeight: tokens.fontWeights.bold,
            fontFamily: tokens.fonts.heading,
            color: tokens.colors.primary,
            opacity: titleOpacity,
            transform: `translateY(${titleSlide}px)`,
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>
      )}

      {/* Header row */}
      <div
        style={{
          position: "absolute",
          left: tableLeft,
          top: tableTop,
          width: tableWidth,
          height: headerHeight,
          backgroundColor: headerBg,
          display: "flex",
          alignItems: "center",
          opacity: headerProgress,
          transform: `translateY(${(1 - headerProgress) * -20}px)`,
          borderRadius: 2,
        }}
      >
        {headers.map((header, i) => (
          <div
            key={i}
            style={{
              width: colWidth,
              paddingLeft: i === 0 ? 24 : 16,
              paddingRight: 16,
              fontSize: 18,
              fontWeight: tokens.fontWeights.bold,
              fontFamily: tokens.fonts.body,
              color: "#ffffff",
              textTransform: "uppercase" as const,
              letterSpacing: 1,
            }}
          >
            {header}
          </div>
        ))}
      </div>

      {/* Data rows */}
      {rows.map((row, rowIndex) => {
        const staggerDelay = 16 + rowIndex * 8;
        const rowProgress = spring({
          frame: frame - staggerDelay,
          fps,
          config: { damping: 22, stiffness: 100 },
        });

        const isHighlighted = highlightRows.includes(rowIndex);
        const isEvenRow = rowIndex % 2 === 0;
        const rowBg = isEvenRow
          ? tokens.colors.background
          : tokens.colors.backgroundAlt;

        const rowTop = tableTop + headerHeight + rowIndex * rowHeight;

        return (
          <div
            key={rowIndex}
            style={{
              position: "absolute",
              left: tableLeft,
              top: rowTop,
              width: tableWidth,
              height: rowHeight,
              backgroundColor: rowBg,
              display: "flex",
              alignItems: "center",
              opacity: rowProgress,
              transform: `translateX(${(1 - rowProgress) * -30}px)`,
              borderLeft: isHighlighted
                ? `4px solid ${tokens.colors.accent}`
                : "4px solid transparent",
            }}
          >
            {row.map((cell, colIndex) => {
              const cellIsNumeric = isNumeric(cell);
              return (
                <div
                  key={colIndex}
                  style={{
                    width: colWidth,
                    paddingLeft: colIndex === 0 ? 24 : 16,
                    paddingRight: 16,
                    fontSize: 20,
                    fontWeight: isHighlighted
                      ? tokens.fontWeights.semibold
                      : tokens.fontWeights.regular,
                    fontFamily: cellIsNumeric
                      ? tokens.fonts.heading
                      : tokens.fonts.body,
                    color: isHighlighted
                      ? tokens.colors.primary
                      : tokens.colors.text,
                  }}
                >
                  {typeof cell === "number" ? cell.toLocaleString() : cell}
                </div>
              );
            })}
          </div>
        );
      })}

      {/* Subtle separator lines between rows */}
      {rows.map((_, rowIndex) => {
        if (rowIndex === 0) return null;
        const staggerDelay = 16 + rowIndex * 8;
        const lineOpacity = interpolate(
          frame,
          [staggerDelay, staggerDelay + 10],
          [0, 0.08],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );
        const separatorTop = tableTop + headerHeight + rowIndex * rowHeight;
        return (
          <div
            key={`sep-${rowIndex}`}
            style={{
              position: "absolute",
              left: tableLeft + 20,
              top: separatorTop,
              width: tableWidth - 40,
              height: 1,
              backgroundColor: tokens.colors.textMuted,
              opacity: lineOpacity,
            }}
          />
        );
      })}

      {/* Source */}
      {source && (
        <div
          style={{
            position: "absolute",
            bottom: pad - 20,
            left: pad,
            fontSize: 14,
            color: tokens.colors.textLight,
            fontFamily: tokens.fonts.body,
            opacity: interpolate(frame, [30, 45], [0, 1], {
              extrapolateRight: "clamp",
            }),
          }}
        >
          Source: {source}
        </div>
      )}
    </div>
  );
};
