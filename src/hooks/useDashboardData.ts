import { useState, useEffect, useCallback, useRef } from 'react';
import { mindicadorService } from '../services/mindicador.service';
import { MAIN_INDICATORS } from '../constants/indicators';
import { getVariation, formatCurrency } from '../utils/format';
import type { IndicatorCode, IndicatorValue, ApiResponse } from '../types/indicator';

const REFRESH_INTERVAL_MILLISECONDS = 5 * 60 * 1000;

export interface MarketRow {
  label: string;
  value: string;
  detail: string;
  up: boolean;
  available: boolean;
}

export interface AlertItem {
  icon: string;
  color: string;
  bg: string;
  title: string;
  desc: string;
}

export interface DashboardData {
  indicators: Record<string, IndicatorValue | null>;
  indicatorVariations: Record<string, string>;
  marketRows: MarketRow[];
  alerts: AlertItem[];
}

// ─── extrae los dos valores mas recientes de un resultado de promise ─────────────────────
// ─── retorna current y previous o ambos null si falla
function extractLatestTwoDataPoints(result: PromiseSettledResult<ApiResponse>) {
  if (result.status !== 'fulfilled') return { current: null, previous: null };
  const seriesData = result.value.serie;
  if (!seriesData || seriesData.length === 0) return { current: null, previous: null };
  return { current: seriesData[0], previous: seriesData[1] ?? null };
}

// ─── obtiene todos los datos necesarios para el dashboard ─────────────────────
// ─── incluye indicadores principales, mercado y alertas
async function fetchDashboardData(): Promise<DashboardData> {
  const indicatorsRawResults = await Promise.allSettled(
    MAIN_INDICATORS.map(async (code) => ({
      code,
      data: await mindicadorService.getIndicator(code),
    }))
  );

  const indicators: Record<string, IndicatorValue | null> = {};
  const indicatorVariations: Record<string, string> = {};

  for (let i = 0; i < indicatorsRawResults.length; i++) {
    const result = indicatorsRawResults[i];
    if (result.status === 'fulfilled') {
      const { code, data } = result.value;
      if (data.serie && data.serie.length > 0) {
        const latestDataPoint = data.serie[0];
        indicators[code] = {
          codigo: data.codigo,
          nombre: data.nombre,
          unidad_medida: data.unidad_medida,
          fecha: latestDataPoint.fecha,
          valor: latestDataPoint.valor,
        };
        indicatorVariations[code] = getVariation(latestDataPoint.valor, data.serie[1]?.valor);
      } else {
        indicators[code] = null;
        indicatorVariations[code] = '+0,00%';
      }
    } else {
      const currentCode = MAIN_INDICATORS[i];
      indicators[currentCode as IndicatorCode] = null;
      indicatorVariations[currentCode as IndicatorCode] = '+0,00%';
    }
  }

  const marketRawResults = await Promise.allSettled([
    mindicadorService.getIndicator('ipc'),
    mindicadorService.getIndicator('tasa_desempleo'),
    mindicadorService.getIndicator('imacec'),
    mindicadorService.getIndicator('libra_cobre'),
  ]);

  const ipcDataPoints = extractLatestTwoDataPoints(marketRawResults[0]);
  const unemploymentDataPoints = extractLatestTwoDataPoints(marketRawResults[1]);
  const imacecDataPoints = extractLatestTwoDataPoints(marketRawResults[2]);
  const copperDataPoints = extractLatestTwoDataPoints(marketRawResults[3]);

  const marketRows: MarketRow[] = [
    (() => {
      const { current, previous } = ipcDataPoints;
      if (!current) return { label: 'IPC', value: 'N/D', detail: 'Sin datos', up: false, available: false };
      const variationPercentage = previous ? ((current.valor - previous.valor) / Math.abs(previous.valor) * 100) : 0;
      return {
        label: 'IPC',
        value: `${current.valor.toFixed(2)}%`,
        detail: previous ? `vs ${previous.valor.toFixed(2)}% mes anterior` : 'Ultimo dato disponible',
        up: variationPercentage >= 0,
        available: true,
      };
    })(),
    (() => {
      const { current, previous } = unemploymentDataPoints;
      if (!current) return { label: 'Tasa de Desempleo', value: 'N/D', detail: 'Sin datos', up: false, available: false };
      const variationPercentage = previous ? current.valor - previous.valor : 0;
      return {
        label: 'Tasa de Desempleo',
        value: `${current.valor.toFixed(1)}%`,
        detail: previous ? `vs ${previous.valor.toFixed(1)}% trimestre anterior` : 'Ultimo dato disponible',
        up: variationPercentage <= 0,
        available: true,
      };
    })(),
    (() => {
      const { current, previous } = imacecDataPoints;
      if (!current) return { label: 'IMACEC', value: 'N/D', detail: 'Sin datos', up: false, available: false };
      const variationPercentage = previous ? current.valor - previous.valor : 0;
      return {
        label: 'IMACEC',
        value: `${current.valor >= 0 ? '+' : ''}${current.valor.toFixed(1)}%`,
        detail: previous ? `vs ${previous.valor.toFixed(1)}% mes anterior` : 'Ultimo dato disponible',
        up: variationPercentage >= 0,
        available: true,
      };
    })(),
    (() => {
      const { current, previous } = copperDataPoints;
      if (!current) return { label: 'Libra de Cobre', value: 'N/D', detail: 'Sin datos', up: false, available: false };
      const variationPercentage = previous ? ((current.valor - previous.valor) / previous.valor * 100) : 0;
      return {
        label: 'Libra de Cobre',
        value: `$${current.valor.toFixed(2)}`,
        detail: previous ? `${variationPercentage >= 0 ? '+' : ''}${variationPercentage.toFixed(2)}% vs mes anterior` : 'Ultimo dato disponible',
        up: variationPercentage >= 0,
        available: true,
      };
    })(),
  ];

  const alerts: AlertItem[] = [];

  const dollarIndicator = indicators['dolar'];
  const dollarVariation = indicatorVariations['dolar'];
  if (dollarIndicator) {
    const isDollarUp = !dollarVariation.startsWith('-');
    alerts.push({
      icon: isDollarUp
        ? 'M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941'
        : 'M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181',
      color: isDollarUp ? 'text-amber-400' : 'text-emerald-400',
      bg: isDollarUp ? 'bg-amber-500/8' : 'bg-emerald-500/8',
      title: `Dolar ${isDollarUp ? 'en alza' : 'a la baja'}`,
      desc: `${formatCurrency(dollarIndicator.valor, 0)} CLP · ${dollarVariation} hoy`,
    });
  }

  const ufIndicator = indicators['uf'];
  const ufVariation = indicatorVariations['uf'];
  if (ufIndicator) {
    const variationNumber = parseFloat(ufVariation.replace(',', '.').replace('%', ''));
    const isUfStable = Math.abs(variationNumber) < 0.05;
    alerts.push({
      icon: isUfStable
        ? 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
        : 'M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z',
      color: isUfStable ? 'text-emerald-400' : 'text-amber-400',
      bg: isUfStable ? 'bg-emerald-500/8' : 'bg-amber-500/8',
      title: `UF ${isUfStable ? 'estable' : 'con variacion'}`,
      desc: `${formatCurrency(ufIndicator.valor, 2)} · ${ufVariation} hoy`,
    });
  }

  if (ipcDataPoints.current) {
    const ipcValue = ipcDataPoints.current.valor;
    const isIpcHigh = ipcValue > 0.4;
    alerts.push({
      icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
      color: isIpcHigh ? 'text-amber-400' : 'text-blue-400',
      bg: isIpcHigh ? 'bg-amber-500/8' : 'bg-blue-500/8',
      title: `IPC ${isIpcHigh ? 'elevado' : 'moderado'}`,
      desc: `${ipcValue.toFixed(2)}% mensual · ${isIpcHigh ? 'Por encima del promedio' : 'Dentro de lo esperado'}`,
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      icon: 'M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z',
      color: 'text-slate-400',
      bg: 'bg-slate-500/8',
      title: 'Sin alertas',
      desc: 'No se pudieron obtener datos para generar alertas',
    });
  }

  return { indicators, indicatorVariations, marketRows, alerts };
}

// ─── hook principal para obtener datos del dashboard ─────────────────────
// ─── maneja fetching, cache en memoria y refresco periodico
export function useDashboardData() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadData = useCallback(async () => {
    try {
      const fetchedData = await fetchDashboardData();
      setDashboardData(fetchedData);
      setIsLoading(false);
      setHasError(false);
    } catch (error) {
      console.error('[useDashboardData] Error:', error);
      setIsLoading(false);
      setHasError(true);
    }
  }, []);

  useEffect(() => {
    loadData();
    refreshIntervalRef.current = setInterval(loadData, REFRESH_INTERVAL_MILLISECONDS);
    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    };
  }, [loadData]);

  return { data: dashboardData, loading: isLoading, error: hasError };
}
