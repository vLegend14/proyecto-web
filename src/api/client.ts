import type { ApiError, ApiResponse } from '../types/indicator';

export class HttpError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
}

const DEFAULT_TIMEOUT_MILLISECONDS = 15000;
const DEFAULT_RETRY_COUNT = 2;

// ─── fetch con timeout para usar directamente en hooks del lado cliente ─────────────────────
// ─── lanzar httperror si hay timeout o error de red
export async function fetchWithTimeout(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { timeout = DEFAULT_TIMEOUT_MILLISECONDS, ...fetchOptions } = options;
  const abortController = new AbortController();
  const timeoutIdentifier = setTimeout(() => abortController.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: abortController.signal,
    });
    clearTimeout(timeoutIdentifier);
    return response;
  } catch (error) {
    clearTimeout(timeoutIdentifier);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new HttpError('la solicitud tardo demasiado. intenta de nuevo.', 408, 'TIMEOUT');
    }
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new HttpError('sin conexion a internet. verifica tu red.', undefined, 'NETWORK_ERROR');
    }
    throw new HttpError(
      `error de red: ${error instanceof Error ? error.message : 'desconocido'}`,
      undefined,
      'NETWORK_ERROR'
    );
  }
}

// ─── fetch con retry automatico para solicitudes fallidas ─────────────────────
// ─── reintenta automaticamente si el error es de timeout
export async function fetchWithRetry(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { retries = DEFAULT_RETRY_COUNT, ...fetchOptions } = options;

  try {
    return await fetchWithTimeout(url, fetchOptions);
  } catch (error) {
    if (retries > 0 && error instanceof HttpError && error.code === 'TIMEOUT') {
      // ─── esperar 1 segundo antes de reintentar
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchWithRetry(url, { ...fetchOptions, retries: retries - 1 });
    }
    throw error;
  }
}

// ─── valida que la respuesta tenga estructura de apiresponse ─────────────────────
// ─── verifica la presencia de campos requeridos
export function validateIndicatorResponse(data: any): data is ApiResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'codigo' in data &&
    'nombre' in data &&
    'serie' in data &&
    Array.isArray(data.serie)
  );
}

// ─── verifica que la respuesta http sea ok y devuelve el json tipado ─────────────────────
// ─── lanzar httperror en caso contrario
export async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new HttpError(
      `error ${response.status}: ${response.statusText}`,
      response.status,
      `HTTP_${response.status}`
    );
  }

  try {
    const data = await response.json();
    
    // ─── validacion basica de que no sea null o undefined ──────────────────────────────
    if (data === null || data === undefined) {
      throw new Error('Empty response');
    }
    
    return data as T;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError('respuesta invalida del servidor', 500, 'INVALID_JSON');
  }
}
