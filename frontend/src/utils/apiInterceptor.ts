/**
 * Setup API response interceptor to handle 401 errors globally
 * This should be called once in the app initialization
 */
export function setupApiInterceptor() {
  // Intercept fetch responses
  const originalFetch = window.fetch;
  
  window.fetch = async function(...args) {
    const response = await originalFetch(...args);
    
    // Handle 401 Unauthorized responses
    if (response.status === 401) {
      // Clear auth state
      const token = localStorage.getItem("auth_token");
      if (token) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        
        // Redirect to login if not already there
        if (!window.location.pathname.includes("/auth") && window.location.pathname !== "/") {
          window.location.href = "/auth";
        }
      }
    }
    
    return response;
  };
}

/**
 * Handle API errors, specifically 401 Unauthorized
 * Clears auth storage and redirects to login with return URL
 */
export async function handleApiError(response: Response): Promise<void> {
  if (response.status === 401) {
    // Clear auth storage
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    
    // Redirect to login with return URL
    const returnUrl = window.location.pathname + window.location.search;
    window.location.href = `/auth?returnUrl=${encodeURIComponent(returnUrl)}`;
    
    throw new Error("Unauthorized - Please log in again");
  }
}

/**
 * Enhanced fetch wrapper that handles auth errors
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = localStorage.getItem("auth_token");
  
  // Add auth header if token exists
  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  // Handle 401 Unauthorized
  if (response.status === 401) {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    
    // Only redirect if not already on auth page
    if (!window.location.pathname.includes("/auth") && window.location.pathname !== "/") {
      window.location.href = "/auth";
    }
  }
  
  return response;
}
