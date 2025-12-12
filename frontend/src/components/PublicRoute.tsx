import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface PublicRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

export function PublicRoute({
  children,
  redirectTo = "/app",
}: PublicRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)] mb-4"></div>
          <div className="text-slate-600">Loading...</div>
        </div>
      </div>
    );
  }

  // Redirect authenticated users away from public pages (like login/register)
  if (isAuthenticated) {
    // Check if there's a return URL in state, otherwise use default redirect
    const state = location.state as { returnUrl?: string } | null;
    const destination = state?.returnUrl || redirectTo;
    return <Navigate to={destination} replace />;
  }

  // User is not authenticated, show public page
  return <>{children}</>;
}
