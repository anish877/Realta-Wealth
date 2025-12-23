import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: ("advisor" | "client" | "admin")[];
  requireAuth?: boolean;
}

export function ProtectedRoute({ children, roles, requireAuth = true }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <div className="text-slate-600">Checking your session...</div>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated, redirect to login
  if (requireAuth && !isAuthenticated) {
    // Save the current location to redirect back after login
    const returnUrl = location.pathname + location.search;
    return <Navigate to={`/auth?returnUrl=${encodeURIComponent(returnUrl)}`} replace />;
  }

  // If roles are specified, check if user has required role
  if (roles && roles.length > 0 && user) {
    if (!roles.includes(user.role)) {
      // User doesn't have required role, redirect to landing page
      return <Navigate to="/" replace />;
    }
  }

  // For admin-only routes, check if user is admin
  // If no roles specified but we're in /app routes, require admin
  if (!roles && requireAuth && user && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // User is authenticated and has required role (if specified)
  return <>{children}</>;
}
