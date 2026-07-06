import { useState, useEffect } from 'react';
import { endpoints } from '../../api/endpoints';
import { fetchWithRetry, handleResponse } from '../../api/client';
import { calculateLinearRegression } from '../../utils/forecast';
import type { ApiResponse } from '../../types/indicator';
import ErrorBoundary from '../ui/ErrorBoundary';

interface Scenario {
  title: string;
  badge: string;
  icon: string;
  accent: string;
  border: string;
  label: string;
  description: string;
  growthRate: number;
}

// ─── calcula la tasa de crecimiento anual promedio usando regresion lineal ─────────────────────
// ─── reutiliza calculateLinearRegression de forecast.ts
function calculateAnnualGrowthRate(historicalData: { fecha: string; valor: number }[], months: number = 12): number {
  if (historicalData.length < 2) return 0;

  const recentData = historicalData.slice(0, Math.min(months, historicalData.length));

  const xValues = recentData.map((_, i) => i);
  const yValues = recentData.map((item) => item.valor);

  const { slope } = calculateLinearRegression(xValues, yValues);

  const startValue = yValues[yValues.length - 1];
  const monthlyGrowth = slope / startValue;
  const annualGrowthRate = (Math.pow(1 + monthlyGrowth, 12) - 1) * 100;

  return annualGrowthRate;
}

function StressSimulatorInner() {
  const [amount, setAmount] = useState<string>('10000000');
  const [results, setResults] = useState<{ value: number; change: string }[]>([]);
  const [ufData, setUfData] = useState<{ valor: number; serie: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);

  useEffect(() => {
    const fetchUfData = async () => {
      try {
        const url = endpoints.getIndicator('uf');
        const response = await fetchWithRetry(url);
        const apiData = await handleResponse<ApiResponse>(response);

        if (apiData.serie && apiData.serie.length > 0) {
          const currentValue = apiData.serie[0].valor;

          const historicalGrowth = calculateAnnualGrowthRate(apiData.serie, 12);

          const baseRate = Math.abs(historicalGrowth);

          setScenarios([
            {
              title: 'Escenario Optimista',
              badge: 'Optimista',
              icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
              accent: 'text-emerald-400',
              border: 'border-emerald-500/15',
              label: 'bg-emerald-500/8 text-emerald-400',
              description: 'Crecimiento sostenido con inflacion controlada y estabilidad cambiaria. Proyeccion basada en tendencia historica acelerada.',
              growthRate: baseRate * 1.8,
            },
            {
              title: 'Escenario Conservador',
              badge: 'Conservador',
              icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
              accent: 'text-blue-400',
              border: 'border-blue-500/15',
              label: 'bg-blue-500/8 text-blue-400',
              description: 'Mercado con volatilidad moderada. Crecimiento estable siguiendo la tendencia historica promedio.',
              growthRate: baseRate,
            },
            {
              title: 'Escenario de Riesgo',
              badge: 'Riesgo',
              icon: 'M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z',
              accent: 'text-red-400',
              border: 'border-red-500/15',
              label: 'bg-red-500/8 text-red-400',
              description: 'Contraccion economica con alta inflacion. Proyeccion pesimista con reversion de tendencia.',
              growthRate: -baseRate * 1.5,
            },
          ]);

          setUfData({
            valor: currentValue,
            serie: apiData.serie,
          });
        }
      } catch (error) {
        console.error('[StressSimulator] Error fetching UF data:', error);

        setScenarios([
          {
            title: 'Escenario Optimista',
            badge: 'Optimista',
            icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
            accent: 'text-emerald-400',
            border: 'border-emerald-500/15',
            label: 'bg-emerald-500/8 text-emerald-400',
            description: 'Crecimiento sostenido con inflacion controlada y estabilidad cambiaria.',
            growthRate: 8.5,
          },
          {
            title: 'Escenario Conservador',
            badge: 'Conservador',
            icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
            accent: 'text-blue-400',
            border: 'border-blue-500/15',
            label: 'bg-blue-500/8 text-blue-400',
            description: 'Mercado con volatilidad moderada. Crecimiento estable.',
            growthRate: 4.5,
          },
          {
            title: 'Escenario de Riesgo',
            badge: 'Riesgo',
            icon: 'M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z',
            accent: 'text-red-400',
            border: 'border-red-500/15',
            label: 'bg-red-500/8 text-red-400',
            description: 'Contraccion economica con alta inflacion.',
            growthRate: -8.0,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchUfData();
  }, []);

  const formatAmount = (value: string): string => {
    const numericValue = value.replace(/\D/g, '');
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const parseAmount = (value: string): number => {
    return parseInt(value.replace(/\D/g, '') || '0', 10);
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value.replace(/\D/g, '');
    setAmount(rawValue);
  };

  const handleSimulate = () => {
    const principalAmount = parseAmount(amount);
    if (principalAmount === 0 || scenarios.length === 0) return;

    const calculatedResults = scenarios.map((scenario) => {
      const finalValue = principalAmount * (1 + scenario.growthRate / 100);
      const changePercent = scenario.growthRate >= 0
        ? `+${scenario.growthRate.toFixed(1)}%`
        : `${scenario.growthRate.toFixed(1)}%`;
      return {
        value: Math.round(finalValue),
        change: `${changePercent} en 12 meses`,
      };
    });

    setResults(calculatedResults);
  };

  const hasSimulated = results.length > 0;

  // ─── calcular valores para el bar chart ────────────────────────
  const barChartValues = hasSimulated ? results.map((result) => result.value) : [];
  const barChartMin = hasSimulated ? Math.min(...barChartValues) : 0;
  const barChartMax = hasSimulated ? Math.max(...barChartValues) : 1;
  const barChartRange = barChartMax - barChartMin || barChartMax * 0.01;

  const barColors = ['bg-emerald-500', 'bg-blue-500', 'bg-red-500'];
  const barAccents = ['text-emerald-400', 'text-blue-400', 'text-red-400'];

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="flex items-center gap-2 text-slate-500">
          <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm">Calculando escenarios desde datos historicos...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 overflow-hidden rounded-xl border border-slate-800/60 bg-slate-900/40 p-4 sm:p-6 shadow-sm shadow-black/20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="amountInput" className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              Monto en CLP
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">$</span>
              <input
                type="text"
                id="amountInput"
                value={formatAmount(amount)}
                onChange={handleAmountChange}
                className="w-full rounded-lg border border-slate-700/60 bg-slate-800/50 py-2.5 pl-7 pr-3 text-sm font-medium text-slate-200 outline-none transition-colors focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 tabular-nums"
                placeholder="10.000.000"
              />
            </div>
            {ufData && (
              <p className="mt-1.5 text-[10px] text-slate-600">
                Equivalente a ~<span className="font-medium text-slate-500">{(parseAmount(amount) / ufData.valor).toFixed(2)} UF</span> · UF hoy: ${ufData.valor.toLocaleString('es-CL')}
              </p>
            )}
          </div>
          <button
            onClick={handleSimulate}
            disabled={parseAmount(amount) === 0 || scenarios.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-emerald-500 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
            </svg>
            Simular
          </button>
        </div>
      </div>

      {hasSimulated ? (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {scenarios.map((scenario, i) => {
              const result = results[i];
              return (
                <div
                  key={i}
                  className={`rounded-xl border ${scenario.border} bg-slate-900/40 p-4 sm:p-6 backdrop-blur-xl transition-all duration-300 hover:shadow-lg hover:shadow-black/30`}
                >
                  <div className="flex items-start justify-between">
                    <span className={`inline-flex items-center gap-1 rounded-full ${scenario.label} px-2 py-0.5 text-[11px] font-medium`}>
                      {scenario.badge}
                    </span>
                    <svg className={`h-5 w-5 ${scenario.accent}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d={scenario.icon} />
                    </svg>
                  </div>
                  <p className="mt-4 text-xs text-slate-500">Valor Proyectado</p>
                  <p className="mt-0.5 text-2xl font-bold tracking-tight text-white tabular-nums">
                    ${result.value.toLocaleString('es-CL')}
                  </p>
                  <p className={`mt-0.5 text-sm font-medium ${scenario.accent}`}>{result.change}</p>
                  <div className="mb-3 mt-4 h-px bg-gradient-to-r from-slate-800 to-transparent" />
                  <p className="text-xs leading-relaxed text-slate-600">{scenario.description}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-slate-800/60 bg-slate-900/40 p-4 sm:p-6 shadow-sm shadow-black/20">
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-600">Comparacion de Escenarios</h4>
            <div className="space-y-4">
              {scenarios.map((scenario, i) => {
                const result = results[i];
                const barWidth = barChartRange > 0
                  ? ((result.value - barChartMin) / barChartRange) * 100
                  : 50;
                return (
                  <div key={i}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-300">{scenario.badge}</span>
                      <span className={`text-sm font-bold tabular-nums ${barAccents[i]}`}>
                        ${result.value.toLocaleString('es-CL')}
                      </span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-800/50">
                      <div
                        className={`h-full rounded-full ${barColors[i]} transition-all duration-500`}
                        style={{ width: `${Math.max(barWidth, 5)}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[10px] text-slate-600">{result.change}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800/60 bg-slate-900/20 py-12 text-center">
          <svg className="h-12 w-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008V18H8.25v-.008zM12 13.5h.008v.008H12V13.5zm0 2.25h.008v.008H12v-.008zm0 2.25h.008v.008H12v-.008zm0 2.25h.008V18H12v-.008zm2.25-6h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm0 2.25h.008v.008h-.008V18zM7.5 15.75v-3a3 3 0 013-3h3a3 3 0 013 3v3" />
          </svg>
          <p className="mt-3 text-sm font-medium text-slate-400">Ingresa un monto y presiona "Simular"</p>
          <p className="mt-1 text-xs text-slate-600">
            Proyeccion basada en tendencia historica UF · {scenarios.length > 0 && `Tasa base: ${scenarios[1].growthRate.toFixed(1)}% anual`}
          </p>
        </div>
      )}
    </div>
  );
}

export default function StressSimulator() {
  return (
    <ErrorBoundary>
      <StressSimulatorInner />
    </ErrorBoundary>
  );
}
