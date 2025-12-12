import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

type Mode = "login" | "register";

export function AuthPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"advisor" | "client" | "admin">("client");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLogin = mode === "login";

  // Get return URL from query params (set by ProtectedRoute)
  const getReturnUrl = () => {
    const params = new URLSearchParams(location.search);
    const returnUrl = params.get("returnUrl");
    return returnUrl || "/app";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, fullName, role);
      }
      // Redirect to return URL or default to /app after successful auth
      navigate(getReturnUrl(), { replace: true });
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left panel */}
        <div className="hidden lg:block">
          <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-sm p-10">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-slate-50 opacity-80" />
            <div className="relative space-y-6">
              <div className="inline-flex items-center gap-3 rounded-full bg-blue-50 text-blue-700 px-4 py-2 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Secure Client Portal
              </div>
              <h1 className="text-3xl font-semibold text-slate-900 leading-tight tracking-tight">
                Welcome to your
                <br />
                investor workspace
              </h1>
              <p className="text-slate-600 text-lg leading-relaxed">
                Manage profiles, collaborate with your advisor, and complete account onboarding with a clean,
                modern experience designed for clarity and speed.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-100 bg-white/70 p-4">
                  <p className="text-sm font-medium text-slate-900">One secure place</p>
                  <p className="text-sm text-slate-600">All your investor details stay organized and accessible.</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white/70 p-4">
                  <p className="text-sm font-medium text-slate-900">Save progress</p>
                  <p className="text-sm text-slate-600">Pick up where you left off with automatic drafts.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Auth card */}
        <div className="bg-white/90 backdrop-blur-sm border border-slate-100 shadow-lg rounded-3xl p-8 md:p-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm font-medium text-blue-600">Investor Portal</p>
              <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
                {isLogin ? "Sign in" : "Create an account"}
              </h2>
            </div>
            <div className="inline-flex rounded-full border border-slate-200 p-1 bg-slate-50">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isLogin ? "bg-white shadow-sm text-slate-900" : "text-slate-500"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  !isLogin ? "bg-white shadow-sm text-slate-900" : "text-slate-500"
                }`}
              >
                Register
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="fullName">
                  Full name
                </label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Smith"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="password">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="role">
                  Role
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as typeof role)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                >
                  <option value="client">Client</option>
                  <option value="advisor">Advisor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors duration-100"
            >
              {isSubmitting ? (isLogin ? "Signing in..." : "Creating account...") : isLogin ? "Sign in" : "Create account"}
            </Button>

            <div className="text-sm text-slate-600 text-center">
              {isLogin ? "New to the portal?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => setMode(isLogin ? "register" : "login")}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {isLogin ? "Create an account" : "Sign in instead"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

