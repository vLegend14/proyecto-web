import { fetchWithRetry, handleResponse } from '../api/client';
import { API_BASE_URL } from '../constants/indicators';
import type {
  AllIndicatorsResponse,
  ApiResponse,
  IndicatorCode,
  IndicatorValue,
  IndicatorSeries,
} from '../types/indicator';

// ─── servicio para interactuar con la api de mindicador.cl ─────────────────────
// ─── encapsula todas las llamadas http y manejo de respuestas
class MindicadorService {
  // ─── obtiene todos los indicadores actuales ─────────────────────
  // ─── retorna el objeto completo con todos los indicadores
  async getAllIndicators(): Promise<AllIndicatorsResponse> {
    const response = await fetchWithRetry(API_BASE_URL);
    return handleResponse<AllIndicatorsResponse>(response);
  }

  // ─── obtiene un indicador especifico con su serie historica ─────────────────────
  // ─── retorna los ultimos 30 dias de datos del indicador
  async getIndicator(code: IndicatorCode): Promise<ApiResponse> {
    const response = await fetchWithRetry(`${API_BASE_URL}/${code}`);
    return handleResponse<ApiResponse>(response);
  }

  // ─── obtiene el historial de un indicador por año ─────────────────────
  // ─── retorna todos los registros del indicador en el año indicado
  async getIndicatorByYear(
    code: IndicatorCode,
    year: number
  ): Promise<ApiResponse> {
    const response = await fetchWithRetry(`${API_BASE_URL}/${code}/${year}`);
    return handleResponse<ApiResponse>(response);
  }

  // ─── obtiene el valor actual de un indicador especifico ─────────────────────
  // ─── retorna el primer elemento de la serie (el mas reciente)
  async getCurrentValue(code: IndicatorCode): Promise<IndicatorValue | null> {
    const response = await this.getIndicator(code);
    if (response.serie && response.serie.length > 0) {
      const latestDataPoint = response.serie[0];
      return {
        codigo: response.codigo,
        nombre: response.nombre,
        unidad_medida: response.unidad_medida,
        fecha: latestDataPoint.fecha,
        valor: latestDataPoint.valor,
      };
    }
    return null;
  }

  // ─── obtiene los valores actuales de multiples indicadores ─────────────────────
  // ─── usa promise.allsettled para no fallar si uno falla
  async getMultipleIndicators(
    codes: IndicatorCode[]
  ): Promise<Record<IndicatorCode, IndicatorValue | null>> {
    const results = await Promise.allSettled(
      codes.map(async (code) => ({
        code,
        value: await this.getCurrentValue(code),
      }))
    );

    const indicatorsData: Record<string, IndicatorValue | null> = {};

    results.forEach((result, i) => {
      const currentCode = codes[i];
      if (result.status === 'fulfilled') {
        indicatorsData[currentCode] = result.value.value;
      } else {
        indicatorsData[currentCode] = null;
      }
    });

    return indicatorsData as Record<IndicatorCode, IndicatorValue | null>;
  }

  // ─── obtiene la serie historica de un indicador ─────────────────────────────────
  // ─── si se especifica año, filtra por ese año, sino retorna la serie completa
  async getHistoricalSeries(
    code: IndicatorCode,
    year?: number
  ): Promise<IndicatorSeries> {
    const response = year
      ? await this.getIndicatorByYear(code, year)
      : await this.getIndicator(code);

    return {
      codigo: response.codigo,
      nombre: response.nombre,
      unidad_medida: response.unidad_medida,
      serie: response.serie,
    };
  }
}

export const mindicadorService = new MindicadorService();
