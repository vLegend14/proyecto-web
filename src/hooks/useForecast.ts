import { useState, useEffect } from 'react';
import type { IndicatorCode, ForecastResult, ApiResponse } from '../types/indicator';
import { endpoints } from '../api/endpoints';
import { fetchWithRetry, handleResponse, HttpError, validateIndicatorResponse } from '../api/client';
import { generateForecast, formatChartData, combineHistoricalAndProjected } from '../utils/forecast';

interface UseForecastState {
  data: ForecastResult | null;
  chartData: any[];
  loading: boolean;
  error: string | null;
  fetchedAt: Date | null;
  sourceUrl: string;
}

// ─── hook para obtener pronostico de un indicador ─────────────────────
// ─── obtiene datos historicos y genera proyeccion mediante regresion lineal
export function useForecast(code: IndicatorCode, monthsToProject: number = 3) {
  const [forecastState, setForecastState] = useState<UseForecastState>({
    data: null,
    chartData: [],
    loading: true,
    error: null,
    fetchedAt: null,
    sourceUrl: endpoints.getIndicator(code),
  });

  useEffect(() => {
    let isComponentMounted = true;

    const fetchAndCalculateForecast = async () => {
      setForecastState({ data: null, chartData: [], loading: true, error: null, fetchedAt: null, sourceUrl: endpoints.getIndicator(code) });

      try {
        const indicatorUrl = endpoints.getIndicator(code);

        const response = await fetchWithRetry(indicatorUrl);

        const apiData = await handleResponse<ApiResponse>(response);

        if (!isComponentMounted) return;

        if (!apiData.serie || apiData.serie.length === 0) {
          setForecastState({
            data: null,
            chartData: [],
            loading: false,
            error: 'No hay datos historicos disponibles',
            fetchedAt: new Date(),
            sourceUrl: endpoints.getIndicator(code),
          });
          return;
        }

        // ─── tomar ultimos 12 meses de datos ────────────────────────
        const recentSeriesData = apiData.serie.slice(0, 12);
        
        // ─── preparar datos para el algoritmo de pronostico ────────────────────────
        const historicalDataForForecast = recentSeriesData.map((item: any) => ({
          date: item.fecha,
          value: item.valor,
        }));

        // ─── generar pronostico ────────────────────────
        const forecastResult = generateForecast(historicalDataForForecast, monthsToProject);

        // ─── formatear para el grafico ────────────────────────
        const formattedHistoricalData = formatChartData(recentSeriesData);
        const combinedChartData = combineHistoricalAndProjected(
          formattedHistoricalData,
          forecastResult.projected
        );

        setForecastState({
          data: forecastResult,
          chartData: combinedChartData,
          loading: false,
          error: null,
          fetchedAt: new Date(),
          sourceUrl: endpoints.getIndicator(code),
        });
      } catch (error) {
        if (!isComponentMounted) return;
        const errorMessage = error instanceof HttpError ? error.message
          : error instanceof Error ? error.message
          : 'Error desconocido al obtener datos';
        console.error(`[useForecast] Error fetching ${code}:`, errorMessage);
        setForecastState({
          data: null,
          chartData: [],
          loading: false,
          error: errorMessage,
          fetchedAt: new Date(),
          sourceUrl: endpoints.getIndicator(code),
        });
      }
    };

    fetchAndCalculateForecast();

    return () => {
      isComponentMounted = false;
    };
  }, [code, monthsToProject]);

  return forecastState;
}
