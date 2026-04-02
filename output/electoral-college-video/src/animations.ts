import { interpolate, spring, Easing } from "remotion";

/**
 * Reusable animation primitives for Vox-style motion design.
 * These go beyond simple fades — they create physically-motivated,
 * multi-property animations that feel intentional and crafted.
 */

type AnimConfig = {
  frame: number;
  fps: number;
  startFrame: number;
  duration?: number; // frames, default 20
};

/**
 * Reveal: element scales from 0.85→1, fades in, and slides up.
 * Use for any element appearing on screen.
 */
export function reveal({ frame, fps, startFrame, duration = 20 }: AnimConfig) {
  const progress = interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return {
    opacity: progress,
    transform: `translateY(${(1 - progress) * 15}px) scale(${0.85 + 0.15 * progress})`,
  };
}

/**
 * Spotlight: dim an element to create focus elsewhere.
 * Returns opacity value (1 → dimTo).
 */
export function spotlight(frame: number, triggerFrame: number, dimTo = 0.2, duration = 20) {
  return interpolate(frame, [triggerFrame, triggerFrame + duration], [1, dimTo], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

/**
 * DrawLine: animate a horizontal accent line drawing from left to right.
 * Returns a width percentage (0-100).
 */
export function drawLine({ frame, fps, startFrame }: AnimConfig) {
  const progress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 25, stiffness: 60 },
  });
  return Math.min(progress, 1) * 100;
}

/**
 * CountUp: smoothly count from 0 to target value with spring physics.
 */
export function countUp(frame: number, fps: number, startFrame: number, targetValue: number) {
  const progress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 25, stiffness: 40 },
  });
  return targetValue * Math.min(progress, 1);
}

/**
 * CrossFade: transition between two visual states.
 * Returns { outOpacity, inOpacity } for the old and new content.
 */
export function crossFade(frame: number, triggerFrame: number, duration = 15) {
  const outOpacity = interpolate(frame, [triggerFrame, triggerFrame + duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const inOpacity = interpolate(frame, [triggerFrame, triggerFrame + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return { outOpacity, inOpacity };
}

/**
 * BarGrow: animate a bar chart bar from 0 to target height/width.
 * Returns a multiplier (0-1) with spring physics.
 */
export function barGrow(frame: number, fps: number, startFrame: number) {
  return Math.min(
    spring({
      frame: frame - startFrame,
      fps,
      config: { damping: 20, stiffness: 60 },
    }),
    1
  );
}

/**
 * Pulse: subtle scale pulse for emphasis (1 → 1.05 → 1).
 * Use when the narrator emphasizes a word.
 */
export function pulse(frame: number, fps: number, triggerFrame: number) {
  const p = spring({
    frame: frame - triggerFrame,
    fps,
    config: { damping: 8, stiffness: 200 },
  });
  return 1 + 0.05 * Math.max(0, 1 - p);
}
