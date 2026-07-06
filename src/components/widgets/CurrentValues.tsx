import { useCurrentValues } from '../../hooks/useCurrentValues';
import { formatCurrency, formatRelativeTime } from '../../utils/format';

const INDICATOR_LABELS: Record<string, { label: string; code: string }> = {
  uf: { label: 'Unidad de Fomento', code: 'UF' },
  utm: { label: 'UTM', code: 'UTM' },
  dolar: { label: 'Dolar Observado', code: 'USD' },
  euro: { label: 'Euro', code: 'EUR' },
};

// ─── componente de esqueleto mientras carga ─────────────────────
// ─── muestra 4 tarjetas con efecto shimmer
function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-7">
      {[1, 2, 3, 4].map((skeletonIndex) => (
        <div key={skeletonIndex} className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-5 backdrop-blur-xl">
          <div className="skeleton-shimmer h-3 w-16 rounded mb-2" />
          <div className="skeleton-shimmer h-7 w-28 rounded mb-1" />
          <div className="skeleton-shimmer h-2.5 w-20 rounded" />
        </div>
      ))}
    </div>
  );
}

// ─── muestra los valores actuales de los indicadores principales ─────────────────────
// ─── tarjetas compactas con valor, codigo y tiempo relativo
export default function CurrentValues() {
  const { values, loading } = useCurrentValues();

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {Object.entries(INDICATOR_LABELS).map(([key, config]) => {
        const indicator = values[key];
        return (
          <div
            key={key}
            className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-5 backdrop-blur-xl shadow-sm shadow-black/20"
          >
            <p className="text-[11px] font-medium text-slate-500">{config.code}</p>
            {indicator ? (
              <>
                <p className="mt-0.5 text-xl font-bold tracking-tight text-white tabular-nums">
                  {formatCurrency(indicator.valor, 2)}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-600">
                  {formatRelativeTime(indicator.fecha)}
                </p>
              </>
            ) : (
              <>
                <p className="mt-0.5 text-xl font-bold tracking-tight text-red-400">N/D</p>
                <p className="mt-0.5 text-[10px] text-slate-600">Sin datos</p>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
