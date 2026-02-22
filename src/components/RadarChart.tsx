"use client";

import { motion } from "framer-motion";

interface Skill {
  name: string;
  value: number;
}

interface RadarChartProps {
  skills: Skill[];
}

export default function RadarChart({ skills }: RadarChartProps) {
  const size = 300;
  const center = size / 2;
  const maxRadius = size / 2 - 40;
  const levels = 5;
  const count = skills.length;

  if (count < 3) return null;

  const angleStep = (2 * Math.PI) / count;

  const getPoint = (index: number, value: number): [number, number] => {
    const angle = angleStep * index - Math.PI / 2;
    const radius = (value / 100) * maxRadius;
    return [center + radius * Math.cos(angle), center + radius * Math.sin(angle)];
  };

  const gridPolygons = Array.from({ length: levels }, (_, level) => {
    const ratio = (level + 1) / levels;
    const points = Array.from({ length: count }, (_, i) => {
      const angle = angleStep * i - Math.PI / 2;
      const r = maxRadius * ratio;
      return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
    }).join(" ");
    return points;
  });

  const dataPoints = skills.map((skill, i) => getPoint(i, skill.value));
  const dataPolygon = dataPoints.map(([x, y]) => `${x},${y}`).join(" ");

  const axisLines = skills.map((_, i) => {
    const angle = angleStep * i - Math.PI / 2;
    return {
      x2: center + maxRadius * Math.cos(angle),
      y2: center + maxRadius * Math.sin(angle),
    };
  });

  const labels = skills.map((skill, i) => {
    const angle = angleStep * i - Math.PI / 2;
    const labelRadius = maxRadius + 25;
    const x = center + labelRadius * Math.cos(angle);
    const y = center + labelRadius * Math.sin(angle);
    return { x, y, name: skill.name, value: skill.value };
  });

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex justify-center"
    >
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[320px] sm:max-w-[400px]">
        <defs>
          <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="radarStroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
        </defs>

        {gridPolygons.map((points, i) => (
          <polygon
            key={i}
            points={points}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
          />
        ))}

        {axisLines.map((line, i) => (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={line.x2}
            y2={line.y2}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />
        ))}

        <motion.polygon
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          points={dataPolygon}
          fill="url(#radarGradient)"
          stroke="url(#radarStroke)"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {dataPoints.map(([x, y], i) => (
          <motion.circle
            key={i}
            initial={{ r: 0 }}
            animate={{ r: 4 }}
            transition={{ duration: 0.3, delay: 0.5 + i * 0.05 }}
            cx={x}
            cy={y}
            fill="#22d3ee"
            stroke="white"
            strokeWidth="1.5"
          />
        ))}

        {labels.map((label, i) => (
          <text
            key={i}
            x={label.x}
            y={label.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-gray-400 text-[8px] sm:text-[9px]"
          >
            <tspan x={label.x} dy="-0.3em">
              {label.name}
            </tspan>
            <tspan x={label.x} dy="1.2em" className="fill-cyan-400 font-bold">
              {label.value}%
            </tspan>
          </text>
        ))}
      </svg>
    </motion.div>
  );
}
