import { useState, useRef } from "react";

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
  const [hovered, setHovered] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const w = 800;
  const h = 280;
  const pad = { top: 16, right: 16, bottom: 28, left: 48 };

  const vals = mockData.map((d) => d.value);
  const min = Math.min(...vals) * 0.95;
  const max = Math.max(...vals) * 1.05;

  const x = (i: number) => pad.left + (i / (mockData.length - 1)) * (w - pad.left - pad.right);
  const y = (v: number) => h - pad.bottom - ((v - min) / (max - min)) * (h - pad.top - pad.bottom);

  const pts = mockData.map((d, i) => `${x(i)},${y(d.value)}`).join(" ");
  const area = `${pad.left},${h - pad.bottom} ${pts} ${x(mockData.length - 1)},${h - pad.bottom}`;

  const fmt = (v: number) => `$${v.toLocaleString("es-CL")}`;

  return (
    <div ref={containerRef} class="relative w-full">
      <svg viewBox={`0 0 ${w} ${h}`} class="w-full h-auto" preserveAspectRatio="xMidYMid meet"
        onMouseLeave={() => { setTooltip(null); setHovered(null); }}
      >
        <defs>
          <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="rgb(16, 185, 129)" stop-opacity="0.25" />
            <stop offset="100%" stop-color="rgb(16, 185, 129)" stop-opacity="0" />
          </linearGradient>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
          const yy = y(min + (max - min) * pct);
          const v = Math.round(min + (max - min) * pct);
          return (
            <g key={pct}>
              <line x1={pad.left} y1={yy} x2={w - pad.right} y2={yy} stroke="rgb(51, 65, 85)" stroke-width="1" />
              <text x={pad.left - 10} y={yy + 4} text-anchor="end" fill="rgb(100, 116, 139)" font-size="11">{fmt(v)}</text>
            </g>
          );
        })}

        <polygon points={area} fill="url(#ag)" />
        <polyline points={pts} fill="none" stroke="rgb(16, 185, 129)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />

        {mockData.map((d, i) => {
          const isHover = hovered === i;
          const cx = x(i);
          const cy = y(d.value);
          return (
            <circle key={i}
              cx={cx} cy={cy}
              r={isHover ? 7 : d.projected ? 3 : 4}
              fill={d.projected ? "rgb(251, 191, 36)" : "rgb(16, 185, 129)"}
              stroke={isHover ? "rgb(2, 6, 23)" : "none"}
              stroke-width={isHover ? 2.5 : 0}
              style={{ opacity: hovered !== null && !isHover ? 0.25 : 1 }}
              class="cursor-pointer transition-all duration-200"
              onMouseEnter={(e) => {
                setHovered(i);
                const rect = (e.target as SVGCircleElement).closest("svg")!.getBoundingClientRect();
                setTooltip({ x: cx * (rect.width / w), y: cy * (rect.height / h), data: d });
              }}
            />
          );
        })}

        {tooltip && (
          <line x1={tooltip.x * (w / 800)} y1={pad.top} x2={tooltip.x * (w / 800)} y2={h - pad.bottom}
            stroke="rgb(100, 116, 139)" stroke-width="1" stroke-dasharray="4 4" />
        )}

        {mockData.map((d, i) => (
          <text key={i} x={x(i)} y={h - 8} text-anchor="middle" fill="rgb(100, 116, 139)" font-size="10">{d.date}</text>
        ))}

        {mockData.map((d, i) =>
          d.projected && i < mockData.length - 1 ? (
            <line key={`p-${i}`} x1={x(i)} y1={y(d.value)} x2={x(i + 1)} y2={y(mockData[i + 1].value)}
              stroke="rgb(251, 191, 36)" stroke-width="2" stroke-dasharray="6 4" stroke-linecap="round" />
          ) : null
        )}
      </svg>

      {tooltip && (() => {
        const tipW = 140;
        const container = containerRef.current;
        const cw = container?.clientWidth ?? 800;
        const ratio = cw / w;
        const sx = tooltip.x;
        const clampedX = sx < tipW * 0.4 ? tipW * 0.4 - sx : (sx > cw - tipW * 0.6 ? cw - tipW * 0.6 - sx : 0);
        return (
          <div class="pointer-events-none absolute z-10"
            style={{ left: Math.max(4, Math.min(sx + 12 + clampedX, cw - tipW - 4)), top: Math.max(8, tooltip.y - 52) }}>
            <div class="rounded-lg border border-slate-700/60 bg-slate-900/95 px-3 py-2 shadow-xl backdrop-blur-sm">
              <div class="flex items-center gap-1.5">
                <span class={`h-1.5 w-1.5 rounded-full ${tooltip.data.projected ? "bg-amber-400" : "bg-emerald-500"}`} />
                <span class="text-xs text-slate-500">{tooltip.data.date}</span>
              </div>
              <p class="mt-0.5 text-sm font-bold text-white tabular-nums">{fmt(tooltip.data.value)}</p>
              {tooltip.data.projected && <p class="text-[10px] text-amber-400/70">Proyectado</p>}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
