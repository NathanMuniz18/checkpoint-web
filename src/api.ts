import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from './auth';
import type { ApiErrorBody, AuthTokens } from './types';

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://checkpoint-api-7z0m.onrender.com').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(public status: number, public data: ApiErrorBody | null, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

function errorText(data: ApiErrorBody | null, fallback: string): string {
  if (!data) return fallback;
  const messages: string[] = [];
  Object.entries(data).forEach(([field, value]) => {
    if (Array.isArray(value)) messages.push(...value);
    else if (typeof value === 'string') messages.push(value);
    else Object.values(value).forEach((items) => messages.push(...items));
    if (field === 'detail' && typeof value === 'string') return;
  });
  return messages.join(' ') || fallback;
}

async function parseResponse(response: Response): Promise<unknown> {
  if (response.status === 204) return null;
  const contentType = response.headers.get('content-type') || '';
  return contentType.includes('application/json') ? response.json() : null;
}

async function refreshAccessToken(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;
  try {
    const response = await fetch(`${API_BASE_URL}/api/token/refresh/`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh }),
    });
    if (!response.ok) return false;
    const data = await response.json() as { access: string; refresh?: string };
    saveTokens({ access: data.access, refresh: data.refresh || refresh });
    return true;
  } catch { return false; }
}

type RequestOptions = RequestInit & { authenticated?: boolean; retry?: boolean };

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { authenticated = false, retry = true, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers);
  if (fetchOptions.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (authenticated) {
    const token = getAccessToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...fetchOptions, headers });
  } catch {
    throw new ApiError(0, null, 'Não foi possível conectar à API. Confira se o backend está ligado.');
  }

  if (response.status === 401 && authenticated && retry && await refreshAccessToken()) {
    return request<T>(path, { ...options, retry: false });
  }
  const data = await parseResponse(response) as T | ApiErrorBody | null;
  if (!response.ok) {
    if (response.status === 401 && authenticated) {
      clearTokens();
      window.location.hash = '/login';
    }
    throw new ApiError(response.status, data as ApiErrorBody | null, errorText(data as ApiErrorBody | null, `Erro ${response.status} na API.`));
  }
  return data as T;
}

export const api = {
  get: <T>(path: string, authenticated = true) => request<T>(path, { authenticated }),
  post: <T>(path: string, body: unknown, authenticated = true) => request<T>(path, { method: 'POST', body: JSON.stringify(body), authenticated }),
  patch: <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH', body: JSON.stringify(body), authenticated: true }),
  delete: (path: string) => request<null>(path, { method: 'DELETE', authenticated: true }),
};

export const loginRequest = (username: string, password: string) => api.post<AuthTokens>('/api/token/', { username, password }, false);
export const registerRequest = (data: object) => api.post<unknown>('/api/usuarios/registrar/', data, false);
export const forgotPasswordRequest = (email: string) => api.post<unknown>('/api/usuarios/esqueci-senha/', { email }, false);
export const resetPasswordRequest = (data: object) => api.post<unknown>('/api/usuarios/redefinir-senha/', data, false);
