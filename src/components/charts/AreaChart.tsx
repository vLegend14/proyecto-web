import { useState, useRef } from "react";
import { useForecast } from "../../hooks/useForecast";
import ErrorBoundary from "../ui/ErrorBoundary";

interface DataPoint {
  date: string;
  value: number;
  projected?: boolean;
}

function AreaChartInner() {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: DataPoint } | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ─── obtener datos reales del indicador uf con pronostico ────────────────────────
  const { chartData, loading, error, fetchedAt, sourceUrl } = useForecast('uf', 3);

  const chartWidth = 800;
  const chartHeight = 280;
  const padding = { top: 16, right: 16, bottom: 28, left: 48 };

  if (loading) {
    return (
      <div className="flex h-[280px] items-center justify-center">
        <div className="flex items-center gap-2 text-slate-500">
          <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm">Cargando datos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[280px] items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto h-10 w-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <p className="mt-2 text-sm text-red-400">Error al cargar datos</p>
          <p className="mt-1 text-xs text-red-400/70">{error}</p>
        </div>
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center">
        <p className="text-sm text-slate-500">No hay datos disponibles</p>
      </div>
    );
  }

  if (chartData.length < 2) {
    return (
      <div className="flex h-[280px] items-center justify-center">
        <p className="text-sm text-slate-500">Datos insuficientes para generar el grafico</p>
      </div>
    );
  }

  // ─── calcular escalas del grafico ────────────────────────
  const dataValues = chartData.map((dataPoint) => dataPoint.value);
  const dataMin = Math.min(...dataValues);
  const dataMax = Math.max(...dataValues);
  const dataRange = dataMax - dataMin || dataMax * 0.01;
  const min = dataMin - dataRange * 0.15;
  const max = dataMax + dataRange * 0.15;

  // ─── proteger contra division por cero ────────────────────────
  const calculateX = (index: number) => {
    if (chartData.length === 1) {
      return padding.left + (chartWidth - padding.left - padding.right) / 2;
    }
    return padding.left + (index / (chartData.length - 1)) * (chartWidth - padding.left - padding.right);
  };

  const calculateY = (value: number) => chartHeight - padding.bottom - ((value - min) / (max - min)) * (chartHeight - padding.top - padding.bottom);

  // ─── generar puntos del polilinea y area ────────────────────────
  const polylinePoints = chartData.map((dataPoint, i) => `${calculateX(i)},${calculateY(dataPoint.value)}`).join(" ");
  const areaPath = `${padding.left},${chartHeight - padding.bottom} ${polylinePoints} ${calculateX(chartData.length - 1)},${chartHeight - padding.bottom}`;

  const formatCurrencyValue = (value: number) => `$${value.toLocaleString("es-CL")}`;

  return (
    <div ref={containerRef} className="relative w-full">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet"
        onMouseLeave={() => { setTooltip(null); setHovered(null); }}
      >
        <defs>
          <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(16, 185, 129)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="rgb(16, 185, 129)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* ─── lineas de guia horizontales ────── */}
        {[0, 0.25, 0.5, 0.75, 1].map((percentage) => {
          const gridLineY = calculateY(min + (max - min) * percentage);
          const gridLineValue = Math.round(min + (max - min) * percentage);
          return (
            <g key={percentage}>
              <line x1={padding.left} y1={gridLineY} x2={chartWidth - padding.right} y2={gridLineY} stroke="rgb(51, 65, 85)" strokeWidth="1" />
              <text x={padding.left - 10} y={gridLineY + 4} textAnchor="end" fill="rgb(100, 116, 139)" fontSize="11">{formatCurrencyValue(gridLineValue)}</text>
            </g>
          );
        })}

        {/* ─── area y polilinea ────── */}
        <polygon points={areaPath} fill="url(#ag)" />
        <polyline points={polylinePoints} fill="none" stroke="rgb(16, 185, 129)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* ─── puntos interactivos ────── */}
        {chartData.map((dataPoint, i) => {
          const isHovered = hovered === i;
          const circleCenterX = calculateX(i);
          const circleCenterY = calculateY(dataPoint.value);
          return (
            <circle key={i}
              cx={circleCenterX} cy={circleCenterY}
              r={isHovered ? 7 : dataPoint.projected ? 3 : 4}
              fill={dataPoint.projected ? "rgb(251, 191, 36)" : "rgb(16, 185, 129)"}
              stroke={isHovered ? "rgb(2, 6, 23)" : "none"}
              strokeWidth={isHovered ? 2.5 : 0}
              style={{ opacity: hovered !== null && !isHovered ? 0.25 : 1 }}
              className="cursor-pointer transition-all duration-200"
              onMouseEnter={(event) => {
                setHovered(i);
                const svgElement = (event.target as SVGCircleElement).closest("svg")!;
                const boundingRect = svgElement.getBoundingClientRect();
                setTooltip({ x: circleCenterX * (boundingRect.width / chartWidth), y: circleCenterY * (boundingRect.height / chartHeight), data: dataPoint });
              }}
              onTouchStart={(event) => {
                event.preventDefault();
                setHovered(i);
                const svgElement = (event.target as SVGCircleElement).closest("svg")!;
                const boundingRect = svgElement.getBoundingClientRect();
                setTooltip({ x: circleCenterX * (boundingRect.width / chartWidth), y: circleCenterY * (boundingRect.height / chartHeight), data: dataPoint });
              }}
            />
          );
        })}

        {/* ─── linea vertical de tooltip ────── */}
        {tooltip && (
          <line x1={tooltip.x * (chartWidth / 800)} y1={padding.top} x2={tooltip.x * (chartWidth / 800)} y2={chartHeight - padding.bottom}
            stroke="rgb(100, 116, 139)" strokeWidth="1" strokeDasharray="4 4" />
        )}

        {/* ─── etiquetas de eje x ────── */}
        {chartData.map((dataPoint, i) => (
          <text key={i} x={calculateX(i)} y={chartHeight - 8} textAnchor="middle" fill="rgb(100, 116, 139)" fontSize="10">{dataPoint.date}</text>
        ))}

        {/* ─── lineas punteadas para proyecciones ────── */}
        {chartData.map((dataPoint, i) =>
          dataPoint.projected && i < chartData.length - 1 ? (
            <line key={`p-${i}`} x1={calculateX(i)} y1={calculateY(dataPoint.value)} x2={calculateX(i + 1)} y2={calculateY(chartData[i + 1].value)}
              stroke="rgb(251, 191, 36)" strokeWidth="2" strokeDasharray="6 4" strokeLinecap="round" />
          ) : null
        )}
      </svg>

      {/* ─── tooltip flotante ────── */}
      {tooltip && (() => {
        const tooltipWidth = 140;
        const containerElement = containerRef.current;
        const containerWidth = containerElement?.clientWidth ?? 800;
        const scaleRatio = containerWidth / chartWidth;
        const tooltipX = tooltip.x;
        const clampedOffset = tooltipX < tooltipWidth * 0.4 ? tooltipWidth * 0.4 - tooltipX : (tooltipX > containerWidth - tooltipWidth * 0.6 ? containerWidth - tooltipWidth * 0.6 - tooltipX : 0);
        return (
          <div className="pointer-events-none absolute z-10"
            style={{ left: Math.max(4, Math.min(tooltipX + 12 + clampedOffset, containerWidth - tooltipWidth - 4)), top: Math.max(8, tooltip.y - 52) }}>
            <div className="rounded-lg border border-slate-700/60 bg-slate-900/95 px-3 py-2 shadow-xl backdrop-blur-sm">
              <div className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${tooltip.data.projected ? "bg-amber-400" : "bg-emerald-500"}`} />
                <span className="text-xs text-slate-500">{tooltip.data.date}</span>
              </div>
              <p className="mt-0.5 text-sm font-bold text-white tabular-nums">{formatCurrencyValue(tooltip.data.value)}</p>
              {tooltip.data.projected && <p className="text-[10px] text-amber-400/70">Proyectado</p>}
            </div>
          </div>
        );
      })()}

      {/* ─── barra de fuente de datos ────── */}
      <div className="mt-3 flex items-center justify-between text-[10px] text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/8 px-1.5 py-0.5 text-emerald-400">
            <span className="h-1 w-1 rounded-full bg-emerald-500"></span>
            mindicador.cl
          </span>
          {fetchedAt && (
            <span>· Obtenido {fetchedAt.toLocaleTimeString('es-CL')}</span>
          )}
        </div>
        {sourceUrl && (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
          >
            Verificar en mindicador.cl
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}

export default function AreaChart() {
  return (
    <ErrorBoundary>
      <AreaChartInner />
    </ErrorBoundary>
  );
}
