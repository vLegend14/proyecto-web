// ─── utilidades para formateo de datos ───────────────────────────
// ─── funciones puras para convertir valores a strings legibles

// ─── formatea un numero como moneda chilena ─────────────────────
// ─── usa intl numberformat con formato clp
export function formatCurrency(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

// ─── formatea un numero sin simbolo de moneda ─────────────────────
// ─── separadores de miles segun locale chileno
export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('es-CL', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

// ─── formatea una fecha iso a formato legible ─────────────────────
// ─── dd/mm/aaaa en locale es-cl
export function formatDate(dateString: string): string {
  const parsedDate = new Date(dateString);
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(parsedDate);
}

// ─── formatea una fecha para mostrar tiempo relativo ─────────────────────
// ─── calcula la diferencia entre la fecha y ahora
export function formatRelativeTime(dateString: string): string {
  const parsedDate = new Date(dateString);
  const currentDate = new Date();
  const differenceInMilliseconds = currentDate.getTime() - parsedDate.getTime();
  const differenceInMinutes = Math.floor(differenceInMilliseconds / (1000 * 60));
  const differenceInHours = Math.floor(differenceInMilliseconds / (1000 * 60 * 60));
  const differenceInDays = Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24));

  if (differenceInMinutes < 1) {
    return 'hace un momento';
  } else if (differenceInMinutes < 60) {
    return `hace ${differenceInMinutes} min`;
  } else if (differenceInHours < 24) {
    return `hace ${differenceInHours} hora${differenceInHours > 1 ? 's' : ''}`;
  } else if (differenceInDays < 7) {
    return `hace ${differenceInDays} dia${differenceInDays > 1 ? 's' : ''}`;
  } else {
    return formatDate(dateString);
  }
}

// ─── calcula la variacion porcentual entre dos valores ─────────────────────
// ─── retorna el porcentaje formateado y si es positivo
export function calculateVariation(
  current: number,
  previous: number
): {
  percentage: string;
  isPositive: boolean;
} {
  const variation = ((current - previous) / previous) * 100;
  const isPositive = variation >= 0;

  return {
    percentage: `${isPositive ? '+' : ''}${variation.toFixed(2)}%`,
    isPositive,
  };
}

// ─── obtiene la variacion entre dos valores consecutivos de una serie ─────────────────────
// ─── retorna string formateado con coma decimal
export function getVariation(
  currentValue: number,
  previousValue?: number
): string {
  if (!previousValue) {
    return '+0,00%';
  }

  const { percentage } = calculateVariation(currentValue, previousValue);
  return percentage.replace('.', ',');
}

// ─── formatea un valor de indicador segun su tipo ───────────────────────────────────────
// ─── moneda para uf/utm/dolar/euro, porcentaje para ipc/tpm, numero para imacec/ivp
export function formatIndicatorValue(
  value: number,
  code: string,
  decimals: number = 2
): string {
  // ─── para uf, utm, dolar, euro, libra_cobre, usar formato de moneda
  if (['uf', 'utm', 'dolar', 'euro', 'libra_cobre'].includes(code)) {
    return formatCurrency(value, decimals);
  }

  // ─── para porcentajes (ipc, tpm, tasa_desempleo)
  if (['ipc', 'tpm', 'tasa_desempleo'].includes(code)) {
    return `${formatNumber(value, decimals)}%`;
  }

  // ─── para indices (imacec, ivp)
  if (['imacec', 'ivp'].includes(code)) {
    return formatNumber(value, decimals);
  }

  // ─── por defecto, formatear como numero
  return formatNumber(value, decimals);
}

// ─── extrae el mes y año de una fecha iso ─────────────────────
// ─── retorna string como "ene 2026"
export function getMonthYear(dateString: string): string {
  const parsedDate = new Date(dateString);
  const monthAbbreviations = [
    'Ene',
    'Feb',
    'Mar',
    'Abr',
    'May',
    'Jun',
    'Jul',
    'Ago',
    'Sep',
    'Oct',
    'Nov',
    'Dic',
  ];
  return `${monthAbbreviations[parsedDate.getMonth()]} ${parsedDate.getFullYear()}`;
}

// ─── obtiene el nombre corto del mes ─────────────────────
// ─── retorna abreviatura de 3 letras en español
export function getShortMonthName(monthIndex: number): string {
  const monthAbbreviations = [
    'Ene',
    'Feb',
    'Mar',
    'Abr',
    'May',
    'Jun',
    'Jul',
    'Ago',
    'Sep',
    'Oct',
    'Nov',
    'Dic',
  ];
  return monthAbbreviations[monthIndex] || '';
}
