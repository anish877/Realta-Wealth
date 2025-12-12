import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";
import { AuthUser, login as apiLogin, register as apiRegister, fetchMe, refreshToken as apiRefreshToken } from "../api";
import { isTokenExpired, getTimeUntilExpiration } from "../utils/authHelpers";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, role: AuthUser["role"]) => Promise<void>;
  logout: (redirectTo?: string) => void;
  refreshToken: () => Promise<boolean>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear auth state
  const clearAuth = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  }, []);

  // Schedule token refresh check
  const scheduleTokenRefresh = useCallback((currentToken: string) => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    const timeUntilExpiration = getTimeUntilExpiration(currentToken);
    if (!timeUntilExpiration || timeUntilExpiration <= 0) {
      return;
    }

    // Refresh 5 minutes before expiration (timeUntilExpiration is already in milliseconds)
    const refreshTime = Math.max(0, timeUntilExpiration - 5 * 60 * 1000);
    
    refreshTimeoutRef.current = setTimeout(async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (storedToken && !isTokenExpired(storedToken)) {
        // Token still valid, verify with server
        try {
          const data = await fetchMe(storedToken);
          if (data && data.user) {
            setUser(data.user);
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));
            scheduleTokenRefresh(storedToken);
          }
        } catch {
          clearAuth();
        }
      } else {
        clearAuth();
      }
    }, refreshTime);
  }, [clearAuth]);

  // Load token and user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        
        // Check if token is expired
        if (isTokenExpired(storedToken)) {
          clearAuth();
          setIsLoading(false);
          return;
        }

        setToken(storedToken);
        setUser(parsedUser);
        
        // Verify token is still valid with server
        fetchMe(storedToken)
          .then((data) => {
            if (data && data.user) {
              setUser(data.user);
              localStorage.setItem(USER_KEY, JSON.stringify(data.user));
              scheduleTokenRefresh(storedToken);
            }
          })
          .catch(() => {
            // Token invalid, clear storage
            clearAuth();
          })
          .finally(() => setIsLoading(false));
      } catch (error) {
        // Invalid stored data, clear it
        clearAuth();
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [clearAuth, scheduleTokenRefresh]);

  const login = async (email: string, password: string) => {
    const response = await apiLogin(email, password);
    setToken(response.token);
    setUser(response.user);
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    scheduleTokenRefresh(response.token);
  };

  const register = async (
    email: string,
    password: string,
    fullName: string,
    role: AuthUser["role"]
  ) => {
    const response = await apiRegister(email, password, fullName, role);
    setToken(response.token);
    setUser(response.user);
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    scheduleTokenRefresh(response.token);
  };

  const logout = useCallback((redirectTo?: string) => {
    clearAuth();
    if (redirectTo && typeof window !== "undefined") {
      window.location.href = redirectTo;
    }
  }, [clearAuth]);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) {
      return false;
    }

    // If token is expired, we can't refresh it without re-authentication
    if (isTokenExpired(storedToken)) {
      clearAuth();
      return false;
    }

    try {
      // Call refresh endpoint to get new token (apiRefreshToken gets token from localStorage internally)
      const response = await apiRefreshToken();
      if (response.token && response.user) {
        setToken(response.token);
        setUser(response.user);
        localStorage.setItem(TOKEN_KEY, response.token);
        localStorage.setItem(USER_KEY, JSON.stringify(response.user));
        scheduleTokenRefresh(response.token);
        return true;
      }
      return false;
    } catch (error) {
      // Refresh failed, clear auth
      clearAuth();
      return false;
    }
  }, [clearAuth, scheduleTokenRefresh]);

  const checkAuthStatus = useCallback(async (): Promise<boolean> => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) {
      return false;
    }

    // Check if token is expired
    if (isTokenExpired(storedToken)) {
      clearAuth();
      return false;
    }

    try {
      const data = await fetchMe(storedToken);
      if (data && data.user) {
        setUser(data.user);
        setToken(storedToken);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        scheduleTokenRefresh(storedToken);
        return true;
      }
      return false;
    } catch (error) {
      // Token invalid, clear storage
      clearAuth();
      return false;
    }
  }, [clearAuth, scheduleTokenRefresh]);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

