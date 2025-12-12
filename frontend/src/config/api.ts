/**
 * API Configuration
 * 
 * In development: Uses Vite proxy (see vite.config.ts)
 * In production: Uses VITE_API_URL environment variable
 * 
 * Set VITE_API_URL in Vercel environment variables to your Render backend URL
 * Example: https://your-backend.onrender.com
 */

const getApiBaseUrl = (): string => {
  // In production, use environment variable
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || "";
  }
  
  // In development, use empty string (Vite proxy handles it)
  return "";
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * Get the full API URL for a given endpoint
 * @param endpoint - API endpoint (e.g., "/api/auth/login")
 * @returns Full URL (e.g., "https://api.example.com/api/auth/login" or "/api/auth/login" in dev)
 */
export const getApiUrl = (endpoint: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  
  if (API_BASE_URL) {
    // Ensure no double slashes
    return `${API_BASE_URL.replace(/\/$/, "")}${cleanEndpoint}`;
  }
  
  // In development, return relative URL (Vite proxy handles it)
  return cleanEndpoint;
};

