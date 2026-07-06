import { useState, useCallback, useRef, useEffect } from 'react';
import type { IndicatorCode, ApiResponse } from '../types/indicator';
import { endpoints } from '../api/endpoints';
import { fetchWithRetry, handleResponse, HttpError } from '../api/client';

interface UseHistoricalSearchState {
  data: ApiResponse | null;
  loading: boolean;
  error: string | null;
}

// ─── hook para realizar busquedas historicas de indicadores ─────────────────────
// ─── permite buscar por codigo de indicador y año
export function useHistoricalSearch() {
  const [searchState, setSearchState] = useState<UseHistoricalSearchState>({
    data: null,
    loading: false,
    error: null,
  });

  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const search = useCallback(
    async (code: IndicatorCode, year: number) => {
      setSearchState({ data: null, loading: true, error: null });

      try {
        const searchUrl = endpoints.getIndicatorByYear(code, year);

        const response = await fetchWithRetry(searchUrl);

        const responseData = await handleResponse<ApiResponse>(response);

        if (!isMountedRef.current) return;

        setSearchState({
          data: responseData,
          loading: false,
          error: null,
        });

        return responseData;
      } catch (error) {
        const errorMessage = error instanceof HttpError ? error.message
          : error instanceof Error ? error.message
          : 'Error al obtener datos';
        console.error(`[useHistoricalSearch] Error:`, errorMessage);

        if (!isMountedRef.current) return;

        setSearchState({
          data: null,
          loading: false,
          error: errorMessage,
        });
      }
    },
    []
  );

  const reset = useCallback(() => {
    setSearchState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...searchState,
    search,
    reset,
  };
}
