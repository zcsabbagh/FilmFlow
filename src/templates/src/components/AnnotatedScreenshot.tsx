import { useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from "remotion";
import { tokens } from "../tokens";

type AnnotationType = "arrow" | "circle" | "underline";

type Annotation = {
  x: number;
  y: number;
  label: string;
  type: AnnotationType;
  startFrame: number;
};

type Props = {
  imageSrc: string;
  annotations: Annotation[];
  title?: string;
  source?: string;
};

const ARROW_OFFSET = 80;
const CIRCLE_RADIUS = 40;
const UNDERLINE_WIDTH = 120;

const ArrowAnnotation: React.FC<{
  x: number;
  y: number;
  label: string;
  progress: number;
}> = ({ x, y, label, progress }) => {
  // Arrow draws from an offset position toward the target
  const tailX = x - ARROW_OFFSET - 40;
  const tailY = y - ARROW_OFFSET - 20;

  const drawLen = progress;
  const currentX = tailX + (x - tailX) * drawLen;
  const currentY = tailY + (y - tailY) * drawLen;

  const labelOpacity = interpolate(progress, [0.7, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <g>
      {/* Arrow line */}
      <line
        x1={tailX}
        y1={tailY}
        x2={currentX}
        y2={currentY}
        stroke={tokens.colors.accent}
        strokeWidth={3}
        strokeLinecap="round"
      />
      {/* Arrowhead */}
      {progress > 0.85 && (
        <circle
          cx={x}
          cy={y}
          r={6}
          fill={tokens.colors.accent}
          opacity={interpolate(progress, [0.85, 1], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}
        />
      )}
      {/* Label at tail */}
      <foreignObject
        x={tailX - 160}
        y={tailY - 16}
        width={150}
        height={60}
        opacity={labelOpacity}
      >
        <div
          style={{
            fontSize: 20,
            fontWeight: tokens.fontWeights.semibold,
            fontFamily: tokens.fonts.body,
            color: tokens.colors.primary,
            textAlign: "right",
            lineHeight: 1.3,
            backgroundColor: "rgba(245, 243, 239, 0.85)",
            padding: "4px 8px",
            borderRadius: 4,
          }}
        >
          {label}
        </div>
      </foreignObject>
    </g>
  );
};

const CircleAnnotation: React.FC<{
  x: number;
  y: number;
  label: string;
  progress: number;
}> = ({ x, y, label, progress }) => {
  const circumference = 2 * Math.PI * CIRCLE_RADIUS;
  const dashOffset = circumference * (1 - progress);

  const labelOpacity = interpolate(progress, [0.8, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <g>
      {/* Drawing circle */}
      <circle
        cx={x}
        cy={y}
        r={CIRCLE_RADIUS}
        fill="none"
        stroke={tokens.colors.accent}
        strokeWidth={3}
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        transform={`rotate(-90, ${x}, ${y})`}
      />
      {/* Label below circle */}
      <foreignObject
        x={x - 80}
        y={y + CIRCLE_RADIUS + 10}
        width={160}
        height={50}
        opacity={labelOpacity}
      >
        <div
          style={{
            fontSize: 20,
            fontWeight: tokens.fontWeights.semibold,
            fontFamily: tokens.fonts.body,
            color: tokens.colors.primary,
            textAlign: "center",
            backgroundColor: "rgba(245, 243, 239, 0.85)",
            padding: "4px 8px",
            borderRadius: 4,
          }}
        >
          {label}
        </div>
      </foreignObject>
    </g>
  );
};

const UnderlineAnnotation: React.FC<{
  x: number;
  y: number;
  label: string;
  progress: number;
}> = ({ x, y, label, progress }) => {
  const drawWidth = UNDERLINE_WIDTH * progress;

  const labelOpacity = interpolate(progress, [0.6, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <g>
      {/* Yellow highlight underline */}
      <rect
        x={x - UNDERLINE_WIDTH / 2}
        y={y}
        width={drawWidth}
        height={6}
        rx={3}
        fill="#f0c75e"
        opacity={0.9}
      />
      {/* Label below underline */}
      <foreignObject
        x={x - 80}
        y={y + 14}
        width={160}
        height={50}
        opacity={labelOpacity}
      >
        <div
          style={{
            fontSize: 20,
            fontWeight: tokens.fontWeights.semibold,
            fontFamily: tokens.fonts.body,
            color: tokens.colors.primary,
            textAlign: "center",
            backgroundColor: "rgba(245, 243, 239, 0.85)",
            padding: "4px 8px",
            borderRadius: 4,
          }}
        >
          {label}
        </div>
      </foreignObject>
    </g>
  );
};

export const AnnotatedScreenshot: React.FC<Props> = ({
  imageSrc,
  annotations,
  title,
  source,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { width, height } = tokens.layout;
  const padding = tokens.layout.padding;

  // Image fade in
  const imageOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });
  const imageScale = interpolate(frame, [0, 20], [1.02, 1], {
    extrapolateRight: "clamp",
  });

  // Title animation
  const titleOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleSlide = interpolate(frame, [0, 18], [25, 0], {
    extrapolateRight: "clamp",
  });

  // Image area (inset slightly for title/source)
  const imgTop = title ? 100 : 40;
  const imgBottom = source ? height - 60 : height - 20;
  const imgLeft = 80;
  const imgRight = width - 80;
  const imgWidth = imgRight - imgLeft;
  const imgHeight = imgBottom - imgTop;

  return (
    <div
      style={{
        width,
        height,
        backgroundColor: tokens.colors.background,
        position: "relative",
        fontFamily: tokens.fonts.body,
        color: tokens.colors.text,
        overflow: "hidden",
      }}
    >
      {/* Title */}
      {title && (
        <div
          style={{
            position: "absolute",
            top: 24,
            left: padding,
            right: padding,
            fontSize: 40,
            fontWeight: tokens.fontWeights.bold,
            fontFamily: tokens.fonts.heading,
            color: tokens.colors.primary,
            opacity: titleOpacity,
            transform: `translateY(${titleSlide}px)`,
            lineHeight: 1.2,
            zIndex: 10,
          }}
        >
          {title}
        </div>
      )}

      {/* Screenshot image with subtle scale + fade */}
      <div
        style={{
          position: "absolute",
          top: imgTop,
          left: imgLeft,
          width: imgWidth,
          height: imgHeight,
          opacity: imageOpacity,
          transform: `scale(${imageScale})`,
          transformOrigin: "center center",
          borderRadius: 8,
          overflow: "hidden",
          boxShadow: "0 4px 30px rgba(0,0,0,0.12)",
        }}
      >
        <Img
          src={staticFile(imageSrc)}
          style={{
            width: imgWidth,
            height: imgHeight,
            objectFit: "contain",
            display: "block",
          }}
        />
      </div>

      {/* Annotation SVG overlay */}
      <svg
        style={{
          position: "absolute",
          top: imgTop,
          left: imgLeft,
          width: imgWidth,
          height: imgHeight,
          pointerEvents: "none",
        }}
      >
        {annotations.map((ann, i) => {
          const progress = spring({
            frame: frame - ann.startFrame,
            fps,
            config: { damping: 20, stiffness: 80 },
          });

          const clampedProgress = Math.max(0, Math.min(1, progress));

          if (ann.type === "arrow") {
            return (
              <ArrowAnnotation
                key={i}
                x={ann.x}
                y={ann.y}
                label={ann.label}
                progress={clampedProgress}
              />
            );
          }
          if (ann.type === "circle") {
            return (
              <CircleAnnotation
                key={i}
                x={ann.x}
                y={ann.y}
                label={ann.label}
                progress={clampedProgress}
              />
            );
          }
          return (
            <UnderlineAnnotation
              key={i}
              x={ann.x}
              y={ann.y}
              label={ann.label}
              progress={clampedProgress}
            />
          );
        })}
      </svg>

      {/* Source */}
      {source && (
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: padding,
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
