import type { AuthTokens } from './types';

const ACCESS_KEY = 'checkpoint_access';
const REFRESH_KEY = 'checkpoint_refresh';

export function saveTokens(tokens: AuthTokens): void {
  localStorage.setItem(ACCESS_KEY, tokens.access);
  localStorage.setItem(REFRESH_KEY, tokens.refresh);
  window.dispatchEvent(new Event('authchange'));
}

export const getAccessToken = (): string | null => localStorage.getItem(ACCESS_KEY);
export const getRefreshToken = (): string | null => localStorage.getItem(REFRESH_KEY);
export const isAuthenticated = (): boolean => Boolean(getAccessToken());

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  window.dispatchEvent(new Event('authchange'));
}

export function logout(redirect = true): void {
  clearTokens();
  if (redirect) window.location.hash = '/login';
}
