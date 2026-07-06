import { useState, useEffect } from 'react';
import { useHistoricalSearch } from '../../hooks/useHistoricalSearch';
import { INDICATOR_NAMES } from '../../constants/indicators';
import type { IndicatorCode } from '../../types/indicator';
import { formatDate, formatCurrency, getVariation } from '../../utils/format';
import ErrorBoundary from '../ui/ErrorBoundary';

const AVAILABLE_INDICATORS = Object.entries(INDICATOR_NAMES).map(([code, name]) => ({
  code: code as IndicatorCode,
  label: name,
}));

const CURRENT_YEAR = new Date().getFullYear();
const AVAILABLE_YEARS = Array.from({ length: 7 }, (_, index) => CURRENT_YEAR - index);

// ─── componente interno de busqueda historica ─────────────────────
// ─── maneja el formulario de busqueda y la tabla de resultados
function HistoricalSearchInner() {
  const [selectedIndicator, setSelectedIndicator] = useState<IndicatorCode>('uf');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const { data, loading, error, search } = useHistoricalSearch();

  // ─── leer parametros de url al montar y ejecutar busqueda automatica ────────────
  useEffect(() => {
    const urlParameters = new URLSearchParams(window.location.search);
    const indicatorParameter = urlParameters.get('indicator');
    const yearParameter = urlParameters.get('year');
    const currentYear = new Date().getFullYear();

    if (indicatorParameter && AVAILABLE_INDICATORS.some((indicator) => indicator.code === indicatorParameter)) {
      setSelectedIndicator(indicatorParameter as IndicatorCode);
    }
    if (yearParameter && !isNaN(Number(yearParameter))) {
      setSelectedYear(Number(yearParameter));
    }

    if (indicatorParameter) {
      const searchYear = yearParameter && !isNaN(Number(yearParameter)) ? Number(yearParameter) : currentYear;
      search(indicatorParameter as IndicatorCode, searchYear);
    }
  }, []);

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await search(selectedIndicator, selectedYear);
  };

  const selectedIndicatorName = AVAILABLE_INDICATORS.find((indicator) => indicator.code === selectedIndicator)?.label || selectedIndicator.toUpperCase();

  return (
    <div>
      <form onSubmit={handleFormSubmit} className="mb-7 overflow-hidden rounded-xl border border-slate-800/60 bg-slate-900/40 p-6 shadow-sm shadow-black/20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="indicatorSelect" className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              Indicador
            </label>
            <div className="relative">
              <svg className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <select
                id="indicatorSelect"
                value={selectedIndicator}
                onChange={(event) => setSelectedIndicator(event.target.value as IndicatorCode)}
                className="w-full appearance-none rounded-lg border border-slate-700/60 bg-slate-800/50 py-2.5 pl-9 pr-8 text-sm text-slate-200 outline-none transition-colors focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
              >
                {AVAILABLE_INDICATORS.map((indicator) => (
                  <option key={indicator.code} value={indicator.code}>
                    {indicator.label}
                  </option>
                ))}
              </select>
              <svg className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <label htmlFor="yearSelect" className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              Año
            </label>
            <div className="relative">
              <svg className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              <select
                id="yearSelect"
                value={selectedYear}
                onChange={(event) => setSelectedYear(Number(event.target.value))}
                className="w-full appearance-none rounded-lg border border-slate-700/60 bg-slate-800/50 py-2.5 pl-9 pr-8 text-sm text-slate-200 outline-none transition-colors focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
              >
                {AVAILABLE_YEARS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <svg className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-emerald-500 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Buscando...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Buscar
              </>
            )}
          </button>
        </div>
      </form>

      {data && (
        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-600">
              Resultados — {selectedIndicatorName} {selectedYear}
            </h3>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/8 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
              {data.serie?.length || 0} registros
            </span>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-800/60 shadow-sm shadow-black/20">
            {(!data.serie || data.serie.length === 0) ? (
              <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
                <svg className="h-8 w-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
                <p className="text-sm text-slate-500">No hay datos disponibles para {selectedIndicatorName} en {selectedYear}</p>
                <p className="text-xs text-slate-600">Intenta con otro año o indicador</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800/60 bg-slate-900/60">
                      <th className="whitespace-nowrap px-3 sm:px-4 py-3 pl-4 sm:pl-5 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-500">Fecha</th>
                      <th className="whitespace-nowrap px-3 sm:px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-500">Valor</th>
                      <th className="whitespace-nowrap px-3 sm:px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-500">Variacion</th>
                      <th className="hidden sm:table-cell whitespace-nowrap px-3 sm:px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-500">Fuente</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/30">
                    {data.serie.slice(0, 20).map((seriesItem, itemIndex) => {
                      const previousValue = data.serie[itemIndex + 1]?.valor;
                      const variationText = getVariation(seriesItem.valor, previousValue);
                      const isVariationPositive = !variationText.startsWith('-');

                      return (
                        <tr key={itemIndex} className={`transition-colors hover:bg-slate-800/20 ${itemIndex % 2 === 1 ? 'bg-slate-800/10' : ''}`}>
                          <td className="whitespace-nowrap px-3 sm:px-4 py-3 pl-4 sm:pl-5 font-medium text-slate-200">{formatDate(seriesItem.fecha)}</td>
                          <td className="whitespace-nowrap px-3 sm:px-4 py-3 text-slate-300">{formatCurrency(seriesItem.valor, 2)}</td>
                          <td className="whitespace-nowrap px-3 sm:px-4 py-3 text-slate-300">
                            <span className={isVariationPositive ? 'text-emerald-400' : 'text-red-400'}>{variationText}</span>
                          </td>
                          <td className="hidden sm:table-cell whitespace-nowrap px-3 sm:px-4 py-3 text-slate-300">mindicador.cl</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/5 p-6">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <p className="text-sm font-medium text-red-400">Error al cargar los datos</p>
          </div>
          <p className="mt-1 text-xs text-red-400/70">{error}</p>
        </div>
      )}
    </div>
  );
}

// ─── componente de busqueda historica con error boundary ─────────────────────
// ─── envuelve el componente interno para manejar errores de renderizado
export default function HistoricalSearch() {
  return (
    <ErrorBoundary>
      <HistoricalSearchInner />
    </ErrorBoundary>
  );
}
