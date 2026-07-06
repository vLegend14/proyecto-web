import { useDashboardData } from '../../hooks/useDashboardData';
import { MAIN_INDICATORS } from '../../constants/indicators';
import { formatCurrency, formatRelativeTime } from '../../utils/format';

const INDICATOR_LABELS: Record<string, { label: string; code: string }> = {
  uf: { label: 'Unidad de Fomento', code: 'UF' },
  utm: { label: 'UTM', code: 'UTM' },
  dolar: { label: 'Dolar Observado', code: 'USD' },
  euro: { label: 'Euro', code: 'EUR' },
};

// ─── esqueleto de carga para las tarjetas kpi ─────────────────────
// ─── muestra 4 tarjetas con efecto shimmer
function KpiLoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4 mb-7">
      {[1, 2, 3, 4].map((skeletonIndex) => (
        <div key={skeletonIndex} className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-5 sm:p-7 backdrop-blur-xl shadow-sm shadow-black/20">
          <div className="flex items-start justify-between">
            <div className="skeleton-shimmer h-9 w-9 rounded-lg" />
            <div className="skeleton-shimmer h-4 w-16 rounded-full" />
          </div>
          <div className="mt-3">
            <div className="skeleton-shimmer h-3 w-24 rounded" />
            <div className="mt-2 skeleton-shimmer h-8 w-36 rounded" />
          </div>
          <div className="mt-2 skeleton-shimmer h-3 w-28 rounded" />
        </div>
      ))}
    </div>
  );
}

// ─── esqueleto de carga para la seccion de mercado ─────────────────────
// ─── muestra tabla de mercado y panel de alertas
function MarketLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 mb-7">
      <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-7 backdrop-blur-xl shadow-sm shadow-black/20 lg:col-span-2">
        <div className="skeleton-shimmer h-4 w-48 rounded mb-4" />
        {[1, 2, 3, 4].map((skeletonIndex) => (
          <div key={skeletonIndex} className="flex items-center justify-between py-3 border-b border-slate-800/50 last:border-b-0">
            <div className="skeleton-shimmer h-4 w-32 rounded" />
            <div className="skeleton-shimmer h-4 w-20 rounded" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-7 backdrop-blur-xl shadow-sm shadow-black/20">
        <div className="skeleton-shimmer h-4 w-24 rounded mb-4" />
        {[1, 2, 3].map((skeletonIndex) => (
          <div key={skeletonIndex} className="skeleton-shimmer h-12 w-full rounded-lg mb-2" />
        ))}
      </div>
    </div>
  );
}

// ─── estado de error cuando no se pueden cargar los datos ─────────────────────
// ─── muestra mensaje con boton de recarga
function ErrorStateDisplay() {
  return (
    <div className="mb-7 rounded-xl border border-red-800/60 bg-red-900/20 p-5 sm:p-7 backdrop-blur-xl shadow-sm shadow-black/20 text-center">
      <p className="text-lg font-semibold text-red-400 mb-1">Error al cargar datos</p>
      <p className="text-sm text-slate-500">
        No se pudieron obtener los indicadores.         La página se reintentará automáticamente en 5 minutos.
      </p>
    </div>
  );
}

// ─── widget principal del dashboard ─────────────────────
// ─── muestra kpi cards, resumen del mercado y alertas
export default function DashboardWidgets() {
  const { data, loading, error } = useDashboardData();

  if (loading && !data) {
    return (
      <>
        <KpiLoadingSkeleton />
        <MarketLoadingSkeleton />
      </>
    );
  }

  if (error && !data) {
    return <ErrorStateDisplay />;
  }

  if (!data) return null;

  const { indicators, indicatorVariations, marketRows, alerts } = data;
  const availableIndicatorCount = marketRows.filter((row) => row.available).length;

  return (
    <>
      <div className="mb-7 grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 xl:grid-cols-4">
        {MAIN_INDICATORS.map((code, indicatorIndex) => {
          const indicator = indicators[code];
          const config = INDICATOR_LABELS[code];

          if (!indicator) {
            return (
              <div
                key={code}
                className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-5 sm:p-7 backdrop-blur-xl shadow-sm shadow-black/20"
                style={{ animation: `slideUp 0.4s ease-out ${indicatorIndex * 0.08}s both` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-red-500/8 ring-1 ring-red-500/15">
                    <span className="text-[9px] sm:text-[10px] font-bold tracking-wide text-red-400">{config.code}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-500/8 px-1.5 py-0.5 text-[10px] font-medium text-red-400">
                    Error
                  </span>
                </div>
                <div className="mt-3">
                  <p className="text-[11px] font-medium text-slate-500">{config.label}</p>
                  <div className="mt-1">
                    <span className="text-sm font-medium text-red-400/80">No disponible</span>
                  </div>
                  <p className="mt-1 text-[10px] text-slate-600">Recarga para reintentar</p>
                </div>
              </div>
            );
          }

          const variationText = indicatorVariations[code] || '+0,00%';
          const isVariationPositive = !variationText.startsWith('-');

          return (
            <div
              key={code}
              className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-5 sm:p-7 backdrop-blur-xl shadow-sm shadow-black/20 card-hover"
              style={{ animation: `slideUp 0.4s ease-out ${indicatorIndex * 0.08}s both` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-emerald-500/8 ring-1 ring-emerald-500/10">
                  <span className="text-[9px] sm:text-[10px] font-bold tracking-wide text-emerald-400">{config.code}</span>
                </div>
                <span
                  className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium ${isVariationPositive ? 'bg-emerald-500/8 text-emerald-400' : 'bg-red-500/8 text-red-400'}`}
                >
                  <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={isVariationPositive ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7V3'}
                    />
                  </svg>
                  {variationText}
                </span>
              </div>
              <div className="mt-2 sm:mt-3">
                <p className="text-[10px] sm:text-[11px] font-medium text-slate-500">{config.label}</p>
                <div className="mt-0.5 flex items-baseline gap-1.5">
                  <span className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    {formatCurrency(indicator.valor, 2)}
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-slate-600">CLP</span>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-600">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatRelativeTime(indicator.fecha)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mb-7 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div
          className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-5 sm:p-7 backdrop-blur-xl shadow-sm shadow-black/20 lg:col-span-2"
          style={{ animation: 'slideUp 0.4s ease-out 0.3s both' }}
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-600">Resumen del Mercado</h3>
            {availableIndicatorCount === 4 ? (
              <span className="text-[10px] text-emerald-500">En vivo · mindicador.cl</span>
            ) : availableIndicatorCount > 0 ? (
              <span className="text-[10px] text-amber-400">{availableIndicatorCount}/4 indicadores disponibles</span>
            ) : (
              <span className="text-[10px] text-red-400">Sin datos</span>
            )}
          </div>
          <div className="divide-y divide-slate-800/50">
            {marketRows.map((marketItem) => (
              <div key={marketItem.label} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-slate-300">{marketItem.label}</p>
                  <p className="mt-0.5 text-xs text-slate-600">{marketItem.detail}</p>
                </div>
                <div className="flex items-center gap-2">
                  {marketItem.available ? (
                    <>
                      <span className="text-base font-semibold text-white tabular-nums">{marketItem.value}</span>
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded ${marketItem.up ? 'bg-emerald-500/8 text-emerald-400' : 'bg-red-500/8 text-red-400'}`}
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d={marketItem.up ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7V3'}
                          />
                        </svg>
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-slate-600 italic">Sin datos</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-5 sm:p-7 backdrop-blur-xl shadow-sm shadow-black/20"
          style={{ animation: 'slideUp 0.4s ease-out 0.4s both' }}
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-600">Alertas</h3>
            <span className="text-[10px] text-emerald-500">
              {alerts.length} activa{alerts.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="space-y-2.5">
            {alerts.map((alertItem) => (
              <div key={alertItem.title} className="flex items-start gap-3 rounded-lg bg-slate-800/15 p-3">
                <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md ${alertItem.bg}`}>
                  <svg className={`h-3.5 w-3.5 ${alertItem.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d={alertItem.icon} />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-200">{alertItem.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{alertItem.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
