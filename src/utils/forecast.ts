import type { ForecastDataPoint, ForecastResult } from '../types/indicator';
import { getShortMonthName } from './format';

// ─── implementa regresion lineal simple para proyeccion de datos ─────────────────────
// ─── calcula pendiente e intercepto usando minimos cuadrados
export function calculateLinearRegression(xValues: number[], yValues: number[]): {
  slope: number;
  intercept: number;
} {
  const totalDataPoints = xValues.length;

  if (totalDataPoints === 0) {
    return { slope: 0, intercept: 0 };
  }

  let sumOfX = 0;
  let sumOfY = 0;
  let sumOfXY = 0;
  let sumOfXX = 0;

  for (let i = 0; i < totalDataPoints; i++) {
    sumOfX += xValues[i];
    sumOfY += yValues[i];
    sumOfXY += xValues[i] * yValues[i];
    sumOfXX += xValues[i] * xValues[i];
  }

  const slope = (totalDataPoints * sumOfXY - sumOfX * sumOfY) / (totalDataPoints * sumOfXX - sumOfX * sumOfX);
  const intercept = (sumOfY - slope * sumOfX) / totalDataPoints;

  return { slope, intercept };
}

// ─── calcula la desviacion estandar de un array de numeros ─────────────────────
// ─── usa la formula estandar de desviacion poblacional
function calculateStandardDeviation(values: number[]): number {
  if (values.length === 0) return 0;

  const meanValue = values.reduce((accumulator, currentValue) => accumulator + currentValue, 0) / values.length;
  const squaredDifferences = values.map((currentValue) => Math.pow(currentValue - meanValue, 2));
  const averageSquaredDifference =
    squaredDifferences.reduce((accumulator, currentValue) => accumulator + currentValue, 0) / values.length;

  return Math.sqrt(averageSquaredDifference);
}

// ─── calcula el nivel de confianza de la proyeccion basado en la volatilidad ─────────────────────
// ─── usa el coeficiente de variacion para determinar la confianza
function calculateConfidenceLevel(
  values: number[]
): 'low' | 'medium' | 'high' {
  if (values.length < 3) return 'low';

  const standardDeviation = calculateStandardDeviation(values);
  const meanValue = values.reduce((accumulator, currentValue) => accumulator + currentValue, 0) / values.length;
  const coefficientOfVariation = (standardDeviation / meanValue) * 100;

  if (coefficientOfVariation < 2) return 'high';
  if (coefficientOfVariation < 5) return 'medium';
  return 'low';
}

// ─── genera pronostico basado en datos historicos usando regresion lineal ─────────────────────
// ─── esta es una proyeccion matematica simple basada en tendencia historica
// ─── no constituye asesoria financiera ni informacion oficial
export function generateForecast(
  historicalData: { date: string; value: number }[],
  monthsToProject: number = 3
): ForecastResult {
  if (historicalData.length === 0) {
    return {
      historical: [],
      projected: [],
      statistics: {
        min: 0,
        max: 0,
        avgGrowth: 0,
        confidence: 'low',
      },
    };
  }

  // ─── ordenar datos por fecha ascendente ────────────────────────
  const sortedData = [...historicalData].sort(
    (firstItem, secondItem) => new Date(firstItem.date).getTime() - new Date(secondItem.date).getTime()
  );

  // ─── convertir a formato para grafico ────────────────────────
  const historicalDataPoints: ForecastDataPoint[] = sortedData.map((item) => ({
    date: item.date,
    value: item.value,
    projected: false,
  }));

  // ─── preparar datos para regresion ────────────────────────
  const xValues = sortedData.map((_, i) => i);
  const yValues = sortedData.map((item) => item.value);

  // ─── calcular regresion lineal ────────────────────────
  const { slope, intercept } = calculateLinearRegression(xValues, yValues);

  // ─── generar proyecciones ────────────────────────
  const projectedDataPoints: ForecastDataPoint[] = [];
  const lastDateInSeries = new Date(sortedData[sortedData.length - 1].date);
  const lastIndexInSeries = sortedData.length - 1;

  // ─── detectar frecuencia de datos (diferencia entre ultimas 2 fechas) ────────────────────────
  let isMonthlyFrequency = true;
  if (sortedData.length >= 2) {
    const previousDate = new Date(sortedData[sortedData.length - 2].date);
    const differenceInMilliseconds = lastDateInSeries.getTime() - previousDate.getTime();
    const differenceInDays = Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24));
    // ─── si la diferencia es menor a 10 dias, asumimos datos diarios ────────────────────────
    isMonthlyFrequency = differenceInDays >= 10;
  }

  for (let projectionIndex = 1; projectionIndex <= monthsToProject; projectionIndex++) {
    const projectedValue = slope * (lastIndexInSeries + projectionIndex) + intercept;

    // ─── crear fecha proyectada segun frecuencia detectada ────────────────────────
    const projectedDate = new Date(lastDateInSeries);
    if (isMonthlyFrequency) {
      projectedDate.setMonth(projectedDate.getMonth() + projectionIndex);
    } else {
      projectedDate.setDate(projectedDate.getDate() + projectionIndex);
    }

    projectedDataPoints.push({
      date: projectedDate.toISOString(),
      value: Math.max(0, projectedValue), // no permitir valores negativos
      projected: true,
    });
  }

  // ─── calcular estadisticas ────────────────────────
  const allProjectedValues = projectedDataPoints.map((point) => point.value);
  const minimumProjectedValue = Math.min(...allProjectedValues);
  const maximumProjectedValue = Math.max(...allProjectedValues);

  // ─── calcular crecimiento promedio ────────────────────────
  const averageGrowth =
    sortedData.length > 1
      ? ((sortedData[sortedData.length - 1].value - sortedData[0].value) /
          sortedData[0].value) *
        100
      : 0;

  const confidenceLevel = calculateConfidenceLevel(yValues);

  return {
    historical: historicalDataPoints,
    projected: projectedDataPoints,
    statistics: {
      min: minimumProjectedValue,
      max: maximumProjectedValue,
      avgGrowth: averageGrowth,
      confidence: confidenceLevel,
    },
  };
}

// ─── formatea datos historicos para el grafico ─────────────────────
// ─── toma solo los ultimos n puntos para no sobrecargar el grafico
export function formatChartData(
  historicalData: { fecha: string; valor: number }[],
  maximumDataPoints: number = 12
): ForecastDataPoint[] {
  // ─── tomar solo los ultimos n puntos
  const recentDataPoints = historicalData.slice(-maximumDataPoints);

  return recentDataPoints.map((item, i) => {
    const parsedDate = new Date(item.fecha);
    return {
      date: getShortMonthName(parsedDate.getMonth()),
      value: Math.round(item.valor),
      projected: false,
    };
  });
}

// ─── combina datos historicos y proyectados para el grafico ─────────────────────
// ─── fusiona ambos arrays en una unica serie para mostrar
export function combineHistoricalAndProjected(
  historicalDataPoints: ForecastDataPoint[],
  projectedDataPoints: ForecastDataPoint[]
): ForecastDataPoint[] {
  return [
    ...historicalDataPoints.map((historicalPoint) => ({ ...historicalPoint, projected: false })),
    ...projectedDataPoints.map((projectedPoint, i) => {
      const parsedDate = new Date(projectedPoint.date);
      return {
        date: getShortMonthName(parsedDate.getMonth()),
        value: Math.round(projectedPoint.value),
        projected: true,
      };
    }),
  ];
}
