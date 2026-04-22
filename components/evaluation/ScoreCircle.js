"use client";

import { useEffect, useState } from "react";
import { scoreToGrade } from "@/lib/makeupAnalysis";

export default function ScoreCircle({ score, size = 160 }) {
  const [displayed, setDisplayed] = useState(0);
  const { grade, label, color } = scoreToGrade(score);

  const radius     = (size / 2) - 12;
  const circumference = 2 * Math.PI * radius;
  const progress   = (displayed / 100) * circumference;
  const strokeDash = `${progress} ${circumference}`;

  // Animate count-up
  useEffect(() => {
    let frame;
    let current = 0;
    const duration = 900; // ms
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      current = Math.round(eased * score);
      setDisplayed(current);
      if (t < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="drop-shadow-sm"
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f2ece5"
          strokeWidth={10}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={strokeDash}
          strokeDashoffset={0}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dasharray 0.05s linear" }}
        />
        {/* Score number */}
        <text
          x="50%"
          y="46%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={size * 0.22}
          fontWeight="700"
          fontFamily="Georgia, serif"
          fill={color}
        >
          {displayed}
        </text>
        {/* /100 */}
        <text
          x="50%"
          y="68%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={size * 0.1}
          fill="#a88c65"
          fontFamily="Georgia, serif"
        >
          / 100
        </text>
      </svg>

      <div className="text-center">
        <span
          className="text-sm font-bold px-3 py-1 rounded-full"
          style={{ background: color + "20", color }}
        >
          {grade} — {label}
        </span>
      </div>
    </div>
  );
}
