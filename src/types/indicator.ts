// ─── tipos para la api de mindicador.cl ─────────────────────
// ─── define las estructuras de datos que maneja la aplicacion

export interface IndicatorValue {
  codigo: string;
  nombre: string;
  unidad_medida: string;
  fecha: string;
  valor: number;
}

export interface IndicatorSeries {
  codigo: string;
  nombre: string;
  unidad_medida: string;
  serie: SerieValue[];
}

export interface SerieValue {
  fecha: string;
  valor: number;
}

export interface ApiResponse {
  version: string;
  autor: string;
  codigo: string;
  nombre: string;
  unidad_medida: string;
  serie: SerieValue[];
}

export interface AllIndicatorsResponse {
  version: string;
  autor: string;
  fecha: string;
  uf?: IndicatorValue;
  ivp?: IndicatorValue;
  dolar?: IndicatorValue;
  dolar_intercambio?: IndicatorValue;
  euro?: IndicatorValue;
  ipc?: IndicatorValue;
  utm?: IndicatorValue;
  imacec?: IndicatorValue;
  tpm?: IndicatorValue;
  libra_cobre?: IndicatorValue;
  tasa_desempleo?: IndicatorValue;
  bitcoin?: IndicatorValue;
}

export type IndicatorCode = 'uf' | 'utm' | 'dolar' | 'euro' | 'ipc' | 'ivp' | 'imacec' | 'tpm' | 'libra_cobre' | 'tasa_desempleo' | 'bitcoin' | 'dolar_intercambio';

export interface HistoricalSearchParams {
  indicator: IndicatorCode;
  year: number;
}

export interface ForecastDataPoint {
  date: string;
  value: number;
  projected?: boolean;
}

export interface ForecastResult {
  historical: ForecastDataPoint[];
  projected: ForecastDataPoint[];
  statistics: {
    min: number;
    max: number;
    avgGrowth: number;
    confidence: 'low' | 'medium' | 'high';
  };
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}
