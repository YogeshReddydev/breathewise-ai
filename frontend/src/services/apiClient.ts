/**
 * BreatheWise AI - Unified HTTP Client & Error Handling
 * Standardizes fetch requests, parameter serialization, and structured error throwing.
 */

export class ApiError extends Error {
  public readonly status: number;
  public readonly detail: string;
  public readonly isNetworkError: boolean;

  constructor(message: string, status: number = 0, detail: string = '', isNetworkError: boolean = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail || message;
    this.isNetworkError = isNetworkError;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Builds a sanitized URL query string, skipping undefined, null, or empty string values.
 */
export function buildQueryParams(
  params: Record<string, string | number | boolean | undefined | null>
): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  }
  const str = searchParams.toString();
  return str ? `?${str}` : '';
}

/**
 * Executes a typed HTTP request against the API base URL with structured error extraction.
 */
export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit,
  fallbackMessage: string = 'API request failed'
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  let response: Response;
  try {
    response = (options && Object.keys(options).length > 0)
      ? await fetch(url, options)
      : await fetch(url);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Network connection failure';
    throw new ApiError(
      `${fallbackMessage}: Network connection failure`,
      0,
      errorMsg,
      true
    );
  }

  if (!response.ok) {
    let detail = '';
    try {
      const errorBody = await response.json();
      detail = errorBody?.detail || errorBody?.message || '';
    } catch {
      // response body was not valid JSON
    }
    const message = detail || `${fallbackMessage} (HTTP ${response.status})`;
    throw new ApiError(message, response.status, detail, false);
  }

  return response.json();
}
