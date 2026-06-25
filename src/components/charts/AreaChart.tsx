import { useState } from "react";

interface DataPoint {
  date: string;
  value: number;
  projected?: boolean;
}

const mockData: DataPoint[] = [
  { date: "Ene", value: 38000 },
  { date: "Feb", value: 39500 },
  { date: "Mar", value: 38700 },
  { date: "Abr", value: 41000 },
  { date: "May", value: 42500 },
  { date: "Jun", value: 41800 },
  { date: "Jul", value: 43900 },
  { date: "Ago", value: 45100 },
  { date: "Sep", value: 44700 },
  { date: "Oct", value: 46200 },
  { date: "Nov", value: 47800 },
  { date: "Dic", value: 49500 },
  { date: "Ene", value: 51000, projected: true },
  { date: "Feb", value: 52300, projected: true },
  { date: "Mar", value: 53800, projected: true },
];

export default function AreaChart() {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: DataPoint } | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const width = 800;
  const height = 320;
  const padding = { top: 20, right: 20, bottom: 30, left: 55 };

  const values = mockData.map((d) => d.value);
  const minVal = Math.min(...values) * 0.95;
  const maxVal = Math.max(...values) * 1.05;

  const xScale = (i: number) => padding.left + (i / (mockData.length - 1)) * (width - padding.left - padding.right);
  const yScale = (v: number) => height - padding.bottom - ((v - minVal) / (maxVal - minVal)) * (height - padding.top - padding.bottom);

  const points = mockData.map((d, i) => `${xScale(i)},${yScale(d.value)}`).join(" ");
  const areaPoints = `${padding.left},${height - padding.bottom} ${points} ${xScale(mockData.length - 1)},${height - padding.bottom}`;

  const gradientId = "areaGradient";

  const formatValue = (v: number) => `$${v.toLocaleString()}`;

  return (
    <div class="relative w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        class="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
        onMouseLeave={() => {
          setTooltip(null);
          setHoveredIndex(null);
        }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="rgb(16, 185, 129)" stop-opacity="0.3" />
            <stop offset="100%" stop-color="rgb(16, 185, 129)" stop-opacity="0" />
          </linearGradient>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
          const y = yScale(minVal + (maxVal - minVal) * pct);
          const val = Math.round(minVal + (maxVal - minVal) * pct);
          return (
            <g key={pct}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="rgb(38, 38, 38)" stroke-width="1" />
              <text x={padding.left - 10} y={y + 4} text-anchor="end" fill="rgb(115, 115, 115)" font-size="11">
                {formatValue(val)}
              </text>
            </g>
          );
        })}

        <polygon points={areaPoints} fill={`url(#${gradientId})`} />

        <polyline points={points} fill="none" stroke="rgb(16, 185, 129)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />

        {mockData.map((d, i) => {
          const isHovered = hoveredIndex === i;
          const cx = xScale(i);
          const cy = yScale(d.value);
          return (
            <g key={i}>
              <circle
                cx={cx}
                cy={cy}
                r={isHovered ? 8 : d.projected ? 3 : 4}
                fill={d.projected ? "rgb(251, 191, 36)" : "rgb(16, 185, 129)"}
                stroke={isHovered ? (d.projected ? "rgb(251, 191, 36)" : "rgb(16, 185, 129)") : "rgb(2, 6, 23)"}
                stroke-width={isHovered ? 3 : 2}
                class="cursor-pointer transition-all duration-200"
                style={{ opacity: hoveredIndex !== null && !isHovered ? 0.3 : 1 }}
                onMouseEnter={(e) => {
                  setHoveredIndex(i);
                  const rect = (e.target as SVGCircleElement).closest("svg")!.getBoundingClientRect();
                  setTooltip({
                    x: cx * (rect.width / width),
                    y: cy * (rect.height / height),
                    data: d,
                  });
                }}
              />
            </g>
          );
        })}

        {tooltip && (
          <line
            x1={tooltip.x * (width / 800)}
            y1={padding.top}
            x2={tooltip.x * (width / 800)}
            y2={height - padding.bottom}
            stroke="rgb(115, 115, 115)"
            stroke-width="1"
            stroke-dasharray="4 4"
          />
        )}

        {mockData.map((d, i) => (
          <text
            key={i}
            x={xScale(i)}
            y={height - 8}
            text-anchor="middle"
            fill="rgb(115, 115, 115)"
            font-size="10"
          >
            {d.date}
          </text>
        ))}

        {mockData.map((d, i) => {
          if (d.projected && i < mockData.length - 1) {
            return (
              <line
                key={`proj-${i}`}
                x1={xScale(i)}
                y1={yScale(d.value)}
                x2={xScale(i + 1)}
                y2={yScale(mockData[i + 1].value)}
                stroke="rgb(251, 191, 36)"
                stroke-width="2"
                stroke-dasharray="6 4"
                stroke-linecap="round"
              />
            );
          }
          return null;
        })}
      </svg>

      {tooltip && (
        <div
          class="pointer-events-none absolute z-10 animate-fade-in"
          style={{ left: Math.min(tooltip.x + 12, 300), top: Math.max(tooltip.y - 55, 10) }}
        >
          <div class="rounded-lg border border-neutral-700 bg-neutral-900/95 px-3 py-2.5 shadow-xl backdrop-blur-sm">
            <div class="flex items-center gap-2">
              <span class={`h-2 w-2 rounded-full ${tooltip.data.projected ? "bg-amber-400" : "bg-emerald-500"}`} />
              <span class="text-xs text-neutral-400">{tooltip.data.date}</span>
            </div>
            <p class="mt-1 text-sm font-bold text-white tabular-nums">{formatValue(tooltip.data.value)}</p>
            {tooltip.data.projected && <p class="mt-0.5 text-[10px] font-medium text-amber-400/80">Proyectado</p>}
          </div>
        </div>
      )}
    </div>
  );
}
