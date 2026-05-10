"use client";

import { useEffect, useRef } from "react";

const COLOURS = [
  "#fb7185", "#b87aaa", "#e8956a", "#f0d890",
  "#fecdd3", "#dfc0d8", "#f6cdb5", "#e11d48",
];

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function createParticle(canvasW, canvasH) {
  return {
    x:       randomBetween(0, canvasW),
    y:       randomBetween(-canvasH * 0.2, -10),
    w:       randomBetween(6, 14),
    h:       randomBetween(4, 9),
    colour:  COLOURS[Math.floor(Math.random() * COLOURS.length)],
    vx:      randomBetween(-2.5, 2.5),
    vy:      randomBetween(2, 6),
    angle:   randomBetween(0, Math.PI * 2),
    spin:    randomBetween(-0.15, 0.15),
    opacity: 1,
  };
}

/**
 * Launches a confetti celebration.
 * @param {boolean} active — set to true to trigger
 * @param {Function} onDone — called when animation finishes
 */
export default function Confetti({ active, onDone }) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d");

    // Create 120 particles
    let particles = Array.from({ length: 120 }, () =>
      createParticle(canvas.width, canvas.height)
    );

    let frame = 0;
    const MAX_FRAMES = 180; // ~3 seconds at 60fps

    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles = particles.filter(p => p.opacity > 0.05);

      particles.forEach(p => {
        p.x      += p.vx;
        p.y      += p.vy;
        p.angle  += p.spin;
        p.vy     += 0.12; // gravity
        // Fade out in last third
        if (frame > MAX_FRAMES * 0.6) {
          p.opacity -= 0.025;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.colour;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      frame++;

      if (frame < MAX_FRAMES && particles.length > 0) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onDone?.();
      }
    }

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [active, onDone]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="confetti-canvas"
      aria-hidden="true"
    />
  );
}
