"use client";

import { useReducedMotion, motion } from "framer-motion";

/*
 * A living multi-channel EEG readout. Each channel is generated from a sum of
 * sine components (alpha / theta / beta-like rhythms) plus the occasional soft
 * spike burst, so the lines feel organic rather than mechanical. Amplitude and
 * spikes gather toward the centre-right to keep a calm, weighted composition.
 */

type Comp = { amp: number; freq: number; phase: number };
type Spike = { center: number; width: number; height: number };

function channelPath(baseline: number, comps: Comp[], spike?: Spike): string {
  const W = 560;
  const step = 4;
  let d = "";
  for (let x = 0; x <= W; x += step) {
    let y = baseline;
    for (const c of comps) y -= c.amp * Math.sin(c.freq * x + c.phase);
    if (spike) y -= spike.height * Math.exp(-(((x - spike.center) / spike.width) ** 2));
    d += (x === 0 ? "M" : "L") + x + " " + y.toFixed(1) + " ";
  }
  return d.trim();
}

type Channel = { d: string; stroke: string; width: number; delay: number; dur: number; glow?: boolean };

const channels: Channel[] = [
  {
    // Fast, low-amplitude alpha rhythm near the top
    d: channelPath(64, [ { amp: 5, freq: 0.16, phase: 0 }, { amp: 3, freq: 0.34, phase: 1.2 } ]),
    stroke: "rgba(56,189,248,0.20)", width: 0.9, delay: 0.10, dur: 1.7,
  },
  {
    // Channel with a characteristic spike burst just past centre
    d: channelPath(132, [ { amp: 6, freq: 0.09, phase: 0.5 }, { amp: 3, freq: 0.22, phase: 2.0 } ], { center: 302, width: 20, height: 34 }),
    stroke: "rgba(56,189,248,0.40)", width: 1.1, delay: 0.24, dur: 1.9,
  },
  {
    // The visual anchor: a slow, prominent theta wave
    d: channelPath(212, [ { amp: 16, freq: 0.05, phase: 0.2 }, { amp: 6, freq: 0.13, phase: 1.5 }, { amp: 3, freq: 0.29, phase: 0.8 } ]),
    stroke: "rgba(56,189,248,0.62)", width: 1.45, delay: 0.38, dur: 2.1, glow: true,
  },
  {
    // Quiet mid channel with gentle undulation
    d: channelPath(286, [ { amp: 9, freq: 0.07, phase: 2.4 }, { amp: 4, freq: 0.19, phase: 0.3 } ]),
    stroke: "rgba(56,189,248,0.30)", width: 1.0, delay: 0.52, dur: 1.8,
  },
  {
    // Lower channel with a small right-side spike
    d: channelPath(352, [ { amp: 5, freq: 0.11, phase: 1.0 }, { amp: 3, freq: 0.26, phase: 2.7 } ], { center: 432, width: 16, height: 22 }),
    stroke: "rgba(56,189,248,0.26)", width: 0.9, delay: 0.64, dur: 1.7,
  },
  {
    // Fast beta shimmer at the base
    d: channelPath(420, [ { amp: 3, freq: 0.30, phase: 0.4 }, { amp: 2, freq: 0.50, phase: 1.1 } ]),
    stroke: "rgba(56,189,248,0.16)", width: 0.75, delay: 0.76, dur: 1.6,
  },
];

// Nodes sit on the notable peaks, weighted to the centre-right
const nodes = [
  { cx: 302, cy: 96,  r: 2.2, op: 0.75, pDelay: 0.0 },
  { cx: 208, cy: 196, r: 1.9, op: 0.58, pDelay: 0.9 },
  { cx: 432, cy: 330, r: 1.8, op: 0.50, pDelay: 1.7 },
  { cx: 150, cy: 206, r: 1.6, op: 0.44, pDelay: 2.4 },
  { cx: 372, cy: 214, r: 1.7, op: 0.52, pDelay: 0.5 },
];

const horizonPath = "M 0 452 C 140 449 280 455 420 452 C 482 450 522 454 560 452";

export function EEGSignalField() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <svg
      viewBox="0 0 560 480"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="eeg-atmosphere" cx="360" cy="205" r="300" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="eeg-horizon-fill" x1="0" y1="446" x2="0" y2="480" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </linearGradient>
        {/* Soft luminous blur used behind the anchor channel */}
        <filter id="eeg-glow" x="-20%" y="-40%" width="140%" height="180%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
      </defs>

      <rect width="560" height="480" fill="url(#eeg-atmosphere)" />

      {/* Channels */}
      {channels.map((c, i) => (
        <g key={i}>
          {c.glow ? (
            <motion.path
              d={c.d}
              stroke="rgba(56,189,248,0.34)"
              strokeWidth={c.width + 1.6}
              strokeLinecap="round"
              fill="none"
              filter="url(#eeg-glow)"
              initial={prefersReducedMotion ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { pathLength: { duration: c.dur, delay: c.delay, ease: "easeInOut" }, opacity: { duration: 0.5, delay: c.delay } }
              }
            />
          ) : null}
          <motion.path
            d={c.d}
            stroke={c.stroke}
            strokeWidth={c.width}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            initial={prefersReducedMotion ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { pathLength: { duration: c.dur, delay: c.delay, ease: "easeInOut" }, opacity: { duration: 0.4, delay: c.delay } }
            }
          />
        </g>
      ))}

      {/* Faint horizon */}
      <motion.path
        d={`${horizonPath} L 560 480 L 0 480 Z`}
        fill="url(#eeg-horizon-fill)"
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.9, delay: 1.0 }}
      />

      {/* Nodes: soft core dot + expanding pulse ring */}
      {nodes.map((n, i) => (
        <g key={`n${i}`}>
          {!prefersReducedMotion && (
            <motion.circle
              cx={n.cx} cy={n.cy} r={n.r}
              fill="none"
              stroke={`rgba(56,189,248,${n.op * 0.5})`}
              strokeWidth={0.8}
              animate={{ r: [n.r, n.r * 4.5], opacity: [n.op * 0.5, 0] }}
              transition={{ duration: 3, delay: n.pDelay + 1.4, repeat: Infinity, repeatDelay: 3.4 + i * 0.5, ease: "easeOut" }}
            />
          )}
          <motion.circle
            cx={n.cx} cy={n.cy} r={n.r}
            fill={`rgba(56,189,248,${n.op})`}
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.4, delay: 1.0 + i * 0.12 }}
          />
        </g>
      ))}
    </svg>
  );
}
