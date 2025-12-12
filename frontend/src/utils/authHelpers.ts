import { jwtDecode } from "jwt-decode";

interface TokenPayload {
  exp: number;
  iat: number;
  sub: string;
  email: string;
  role: string;
}

/**
 * Decode JWT token to get payload
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    return jwtDecode<TokenPayload>(token);
  } catch (error) {
    return null;
  }
}

/**
 * Check if token is expired or will expire soon
 * @param token JWT token string
 * @param bufferSeconds Buffer time in seconds before expiry to consider token as expired (default: 300 = 5 minutes)
 */
export function isTokenExpired(token: string, bufferSeconds: number = 300): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  const expirationTime = decoded.exp * 1000; // Convert to milliseconds
  const currentTime = Date.now();
  const bufferTime = bufferSeconds * 1000;

  return currentTime >= expirationTime - bufferTime;
}

/**
 * Get token expiration time in milliseconds
 */
export function getTokenExpirationTime(token: string): number | null {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return null;
  }
  return decoded.exp * 1000;
}

/**
 * Get time until token expires in milliseconds
 */
export function getTimeUntilExpiration(token: string): number | null {
  const expirationTime = getTokenExpirationTime(token);
  if (!expirationTime) {
    return null;
  }
  return Math.max(0, expirationTime - Date.now());
}
