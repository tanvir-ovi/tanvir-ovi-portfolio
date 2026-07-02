"use client";

import { useReducedMotion, motion } from "framer-motion";

/*
 * A living multi-channel EEG readout. Each channel is generated from a sum of
 * sine components (alpha / theta / beta-like rhythms) plus the occasional soft
 * spike burst, so the lines feel organic rather than mechanical.
 *
 * Premium motion layers (all disabled under reduced motion):
 *  1. Draw-in: each channel strokes itself in on mount.
 *  2. Traveling pulse: a bright segment glides along the anchor and spike
 *     channels forever, like signal moving through the wire.
 *  3. Breathing: each channel drifts vertically a few pixels on its own
 *     slow phase, so the field never sits perfectly still.
 *  4. Glow oscillation: the anchor's halo slowly brightens and dims.
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

type Channel = {
  d: string;
  stroke: string;
  width: number;
  delay: number;
  dur: number;
  glow?: boolean;
  pulse?: boolean;
  breathe: number; // amplitude of the vertical drift in px
};

const channels: Channel[] = [
  {
    // Fast, low-amplitude alpha rhythm near the top
    d: channelPath(64, [ { amp: 5, freq: 0.16, phase: 0 }, { amp: 3, freq: 0.34, phase: 1.2 } ]),
    stroke: "rgba(56,189,248,0.20)", width: 0.9, delay: 0.10, dur: 1.7, breathe: 2.2,
  },
  {
    // Channel with a characteristic spike burst just past centre
    d: channelPath(132, [ { amp: 6, freq: 0.09, phase: 0.5 }, { amp: 3, freq: 0.22, phase: 2.0 } ], { center: 302, width: 20, height: 34 }),
    stroke: "rgba(56,189,248,0.40)", width: 1.1, delay: 0.24, dur: 1.9, pulse: true, breathe: 2.8,
  },
  {
    // The visual anchor: a slow, prominent theta wave
    d: channelPath(212, [ { amp: 16, freq: 0.05, phase: 0.2 }, { amp: 6, freq: 0.13, phase: 1.5 }, { amp: 3, freq: 0.29, phase: 0.8 } ]),
    stroke: "rgba(56,189,248,0.62)", width: 1.45, delay: 0.38, dur: 2.1, glow: true, pulse: true, breathe: 3.4,
  },
  {
    // Quiet mid channel with gentle undulation
    d: channelPath(286, [ { amp: 9, freq: 0.07, phase: 2.4 }, { amp: 4, freq: 0.19, phase: 0.3 } ]),
    stroke: "rgba(56,189,248,0.30)", width: 1.0, delay: 0.52, dur: 1.8, breathe: 2.5,
  },
  {
    // Lower channel with a small right-side spike
    d: channelPath(352, [ { amp: 5, freq: 0.11, phase: 1.0 }, { amp: 3, freq: 0.26, phase: 2.7 } ], { center: 432, width: 16, height: 22 }),
    stroke: "rgba(56,189,248,0.26)", width: 0.9, delay: 0.64, dur: 1.7, breathe: 2.0,
  },
  {
    // Fast beta shimmer at the base
    d: channelPath(420, [ { amp: 3, freq: 0.30, phase: 0.4 }, { amp: 2, freq: 0.50, phase: 1.1 } ]),
    stroke: "rgba(56,189,248,0.16)", width: 0.75, delay: 0.76, dur: 1.6, breathe: 1.6,
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

/* A bright segment that travels the channel forever. pathLength={100}
 * normalises the dash units, so "7 93" is a 7%-long pulse and shifting the
 * offset by exactly 100 per cycle loops seamlessly. */
function TravelingPulse({ d, duration, delay }: { d: string; duration: number; delay: number }) {
  return (
    <>
      {/* Soft halo underneath the pulse */}
      <motion.path
        d={d}
        pathLength={100}
        stroke="rgba(125,211,252,0.5)"
        strokeWidth={3.2}
        strokeLinecap="round"
        fill="none"
        filter="url(#eeg-glow)"
        strokeDasharray="7 93"
        initial={{ strokeDashoffset: 100, opacity: 0 }}
        animate={{ strokeDashoffset: [100, 0], opacity: 1 }}
        transition={{
          strokeDashoffset: { duration, delay, repeat: Infinity, ease: "linear" },
          opacity: { duration: 1.2, delay },
        }}
      />
      {/* Sharp bright core */}
      <motion.path
        d={d}
        pathLength={100}
        stroke="rgba(186,230,253,0.9)"
        strokeWidth={1.4}
        strokeLinecap="round"
        fill="none"
        strokeDasharray="7 93"
        initial={{ strokeDashoffset: 100, opacity: 0 }}
        animate={{ strokeDashoffset: [100, 0], opacity: 1 }}
        transition={{
          strokeDashoffset: { duration, delay, repeat: Infinity, ease: "linear" },
          opacity: { duration: 1.2, delay },
        }}
      />
    </>
  );
}

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
        {/* Soft luminous blur used behind the anchor channel and pulses */}
        <filter id="eeg-glow" x="-20%" y="-40%" width="140%" height="180%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
      </defs>

      {/* Slowly breathing atmosphere */}
      <motion.rect
        width="560"
        height="480"
        fill="url(#eeg-atmosphere)"
        animate={prefersReducedMotion ? undefined : { opacity: [0.85, 1.15, 0.85] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Channels */}
      {channels.map((c, i) => (
        <motion.g
          key={i}
          animate={
            prefersReducedMotion
              ? undefined
              : { y: [0, -c.breathe, 0, c.breathe, 0] }
          }
          transition={{
            duration: 8.5 + i * 1.9,
            delay: i * 0.7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {c.glow ? (
            <motion.path
              d={c.d}
              stroke="rgba(56,189,248,0.34)"
              strokeWidth={c.width + 1.6}
              strokeLinecap="round"
              fill="none"
              filter="url(#eeg-glow)"
              initial={prefersReducedMotion ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
              animate={
                prefersReducedMotion
                  ? { pathLength: 1, opacity: 1 }
                  : { pathLength: 1, opacity: [0.7, 1, 0.7] }
              }
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : {
                      pathLength: { duration: c.dur, delay: c.delay, ease: "easeInOut" },
                      opacity: { duration: 6, delay: c.delay + c.dur, repeat: Infinity, ease: "easeInOut" },
                    }
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
          {/* Signal traveling through the wire, forever */}
          {c.pulse && !prefersReducedMotion ? (
            <TravelingPulse d={c.d} duration={c.glow ? 7.5 : 10} delay={c.delay + c.dur + 0.4} />
          ) : null}
        </motion.g>
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
            animate={
              prefersReducedMotion
                ? { opacity: 1 }
                : { opacity: [0, n.op + 0.25, n.op] }
            }
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { duration: 1.2, delay: 1.0 + i * 0.12, times: [0, 0.6, 1] }
            }
          />
        </g>
      ))}
    </svg>
  );
}
