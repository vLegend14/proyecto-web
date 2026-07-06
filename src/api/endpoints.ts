import { API_BASE_URL } from '../constants/indicators';
import type { IndicatorCode } from '../types/indicator';

// ─── definicion centralizada de endpoints de la api mindicador.cl ─────────────────────
// ─── cada funcion construye la url completa para un endpoint especifico
export const endpoints = {
  // ─── obtener todos los indicadores actuales ─────────────────────
  // ─── get https://mindicador.cl/api
  getAllIndicators: () => `${API_BASE_URL}`,

  // ─── obtener un indicador especifico con su serie historica ─────────────────────
  // ─── get https://mindicador.cl/api/{codigo}
  getIndicator: (code: IndicatorCode) => `${API_BASE_URL}/${code}`,

  // ─── obtener historial de un indicador por año ─────────────────────
  // ─── get https://mindicador.cl/api/{codigo}/{año}
  getIndicatorByYear: (code: IndicatorCode, year: number) =>
    `${API_BASE_URL}/${code}/${year}`,

  // ─── obtener valor de un indicador en una fecha especifica ─────────────────────
  // ─── get https://mindicador.cl/api/{codigo}/{dia}-{mes}-{año}
  getIndicatorByDate: (code: IndicatorCode, date: Date) => {
    const dayOfMonth = String(date.getDate()).padStart(2, '0');
    const monthOfYear = String(date.getMonth() + 1).padStart(2, '0');
    const fullYear = date.getFullYear();
    return `${API_BASE_URL}/${code}/${dayOfMonth}-${monthOfYear}-${fullYear}`;
  },
};
