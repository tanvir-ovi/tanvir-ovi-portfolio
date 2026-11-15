"use client";

import { useEffect, useRef } from "react";

/* One live EEG-style channel drawn across the footer. It idles as a quiet
 * alpha rhythm, swells where the pointer is, and fires a spike on click or
 * tap, the way a trace reacts to a stimulus. The canvas only runs while it is
 * on screen and holds a still frame for visitors who prefer reduced motion. */
export function LiveTrace({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = false;
    let pointerX = -9999;
    let gain = 0; // eased 0..1 presence of the pointer
    let gainTarget = 0;
    const spikes: { x: number; born: number }[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (now: number) => {
      const t = now / 1000;
      gain += (gainTarget - gain) * 0.08;
      ctx.clearRect(0, 0, width, height);

      const mid = height / 2;
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, "rgba(125,211,252,0)");
      gradient.addColorStop(0.12, "rgba(125,211,252,0.75)");
      gradient.addColorStop(0.6, "rgba(56,189,248,0.8)");
      gradient.addColorStop(0.9, "rgba(139,125,255,0.75)");
      gradient.addColorStop(1, "rgba(139,125,255,0)");

      ctx.beginPath();
      for (let x = 0; x <= width; x += 3) {
        // Resting rhythm: a slow wave carrying two faster, smaller ones.
        let y =
          Math.sin(x * 0.012 + t * 1.1) * 3.2 +
          Math.sin(x * 0.045 - t * 2.3) * 1.6 +
          Math.sin(x * 0.11 + t * 4.1) * 0.7;
        // The trace swells around the pointer.
        const near = Math.exp(-(((x - pointerX) / 110) ** 2)) * gain;
        y += near * Math.sin(x * 0.085 - t * 9) * (height * 0.3);
        // Click or tap: a sharp spike that rings out as it travels right.
        for (const s of spikes) {
          const age = (now - s.born) / 1000;
          const centre = s.x + age * 160;
          const envelope = Math.exp(-age * 2.2);
          y -= Math.exp(-(((x - centre) / 14) ** 2)) * height * 0.42 * envelope;
          y += Math.exp(-(((x - centre - 26) / 20) ** 2)) * height * 0.16 * envelope;
        }
        if (x === 0) ctx.moveTo(x, mid + y);
        else ctx.lineTo(x, mid + y);
      }
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1.4;
      ctx.lineJoin = "round";
      ctx.shadowColor = "rgba(56,189,248,0.55)";
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;

      while (spikes.length && now - spikes[0].born > 2600) spikes.shift();
    };

    const loop = (now: number) => {
      draw(now);
      if (visible && !reduce) frame = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      pointerX = e.clientX - canvas.getBoundingClientRect().left;
      gainTarget = 1;
    };
    const onLeave = () => {
      gainTarget = 0;
    };
    const onDown = (e: PointerEvent) => {
      spikes.push({ x: e.clientX - canvas.getBoundingClientRect().left, born: performance.now() });
      if (spikes.length > 4) spikes.shift();
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(frame);
      if (visible) frame = requestAnimationFrame(loop);
    });
    const ro = new ResizeObserver(() => {
      resize();
      if (reduce) draw(0);
    });

    resize();
    io.observe(canvas);
    ro.observe(canvas);
    if (!reduce) {
      canvas.addEventListener("pointermove", onMove);
      canvas.addEventListener("pointerleave", onLeave);
      canvas.addEventListener("pointerdown", onDown);
    }
    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
      ro.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointerdown", onDown);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
