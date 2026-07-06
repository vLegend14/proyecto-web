import { useState, useEffect, useRef } from 'react';
import { mindicadorService } from '../services/mindicador.service';
import { MAIN_INDICATORS } from '../constants/indicators';
import type { IndicatorValue } from '../types/indicator';

const REFRESH_INTERVAL_MILLISECONDS = 5 * 60 * 1000;

// ─── hook para obtener los valores actuales de los indicadores principales ─────────────────────
// ─── usa promise.allsettled para manejar fallos individuales
export function useCurrentValues() {
  const [currentValues, setCurrentValues] = useState<Record<string, IndicatorValue | null>>({});
  const [isLoading, setIsLoading] = useState(true);
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchCurrentValues = async () => {
    try {
      const results = await Promise.allSettled(
        MAIN_INDICATORS.map(async (code) => ({
          code,
          value: await mindicadorService.getCurrentValue(code),
        }))
      );

      const updatedValues: Record<string, IndicatorValue | null> = {};
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          updatedValues[result.value.code] = result.value.value;
        } else {
          updatedValues[MAIN_INDICATORS[results.indexOf(result)]] = null;
        }
      });

      setCurrentValues(updatedValues);
      setIsLoading(false);
    } catch {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentValues();
    refreshIntervalRef.current = setInterval(fetchCurrentValues, REFRESH_INTERVAL_MILLISECONDS);
    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    };
  }, []);

  return { values: currentValues, loading: isLoading };
}
