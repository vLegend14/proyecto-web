import type { IndicatorCode } from '../types/indicator';

// ─── nombres completos de cada indicador ─────────────────────
// ─── mapea el codigo de la api al nombre legible para el usuario
export const INDICATOR_NAMES: Record<IndicatorCode, string> = {
  uf: 'Unidad de Fomento (UF)',
  utm: 'Unidad Tributaria Mensual (UTM)',
  dolar: 'Dolar Observado',
  euro: 'Euro',
  ipc: 'Indice de Precios al Consumidor (IPC)',
  ivp: 'Indice de Valor Promedio (IVP)',
  imacec: 'Indice Mensual de Actividad Economica (IMACEC)',
  tpm: 'Tasa de Politica Monetaria (TPM)',
  libra_cobre: 'Libra de Cobre',
  tasa_desempleo: 'Tasa de Desempleo',
  bitcoin: 'Bitcoin',
  dolar_intercambio: 'Dolar Intercambio',
};

// ─── mapa de codigos para busqueda inversa ─────────────────────
// ─── permite convertir un string a un indicatorcode valido
export const INDICATOR_CODES: Record<string, IndicatorCode> = {
  'uf': 'uf',
  'utm': 'utm',
  'dolar': 'dolar',
  'euro': 'euro',
  'ipc': 'ipc',
  'ivp': 'ivp',
  'imacec': 'imacec',
  'tpm': 'tpm',
  'libra_cobre': 'libra_cobre',
  'tasa_desempleo': 'tasa_desempleo',
  'bitcoin': 'bitcoin',
  'dolar_intercambio': 'dolar_intercambio',
};

// ─── indicadores principales que se muestran en el dashboard ─────────────────────
// ─── uf, utm, dolar y euro son los mas relevantes para el usuario
export const MAIN_INDICATORS: IndicatorCode[] = ['uf', 'utm', 'dolar', 'euro'];

// ─── url base de la api publica de mindicador.cl ─────────────────────
export const API_BASE_URL = 'https://mindicador.cl/api';
