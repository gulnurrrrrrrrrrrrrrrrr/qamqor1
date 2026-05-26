"use client";

import { memo } from "react";

interface Skill { name: string; value: number }

export const SkillRadar = memo(function SkillRadar({ skills }: { skills: Skill[] }) {
  const n = skills.length;
  const cx = 100, cy = 100, maxR = 70;
  const points = skills.map((s, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const r = (s.value / 100) * maxR;
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(" ");
  const grid = [0.25, 0.5, 0.75, 1].map((scale) =>
    skills.map((_, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const r = maxR * scale;
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    }).join(" ")
  );
  return (
    <div className="relative">
      <svg viewBox="0 0 200 200" className="w-full max-w-[220px] mx-auto">
        {grid.map((pts, i) => (
          <polygon key={i} points={pts} fill="none" stroke="rgba(255,255,255,0.06)" />
        ))}
        {skills.map((s, i) => {
          const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
          const x = cx + maxR * Math.cos(angle);
          const y = cy + maxR * Math.sin(angle);
          return (
            <g key={s.name}>
              <line x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.06)" />
              <text x={cx + (maxR + 14) * Math.cos(angle)} y={cy + (maxR + 14) * Math.sin(angle)} textAnchor="middle" dominantBaseline="middle" className="fill-ink-300 text-[8px]">{s.name}</text>
            </g>
          );
        })}
        <polygon points={points} fill="rgba(99,102,241,0.2)" stroke="#818cf8" strokeWidth="1.5" />
      </svg>
    </div>
  );
});
