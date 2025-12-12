import { useState, useEffect, useMemo, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import InvestorProfileForm from "./components/InvestorProfileForm";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AuthPage } from "./components/AuthPage";
import LandingPage from "./components/LandingPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicRoute } from "./components/PublicRoute";
import { getProfilesByUser, generatePdf, type InvestorProfile } from "./api";
import { setupApiInterceptor } from "./utils/apiInterceptor";

function AppShell({
  children,
  onLogout,
  userName,
  onGeneratePdf,
  isGeneratingPdf,
  hasProfiles,
}: {
  children: React.ReactNode;
  onLogout: () => void;
  userName?: string | null;
  onGeneratePdf?: () => void;
  isGeneratingPdf?: boolean;
  hasProfiles?: boolean;
}) {
  const accentLines = useMemo(
    () => (
      <div className="app-accent-lines">
        <div className="hline" />
        <div className="hline" />
        <div className="hline" />
        <div className="vline" />
        <div className="vline" />
        <div className="vline" />
      </div>
    ),
    []
  );

  return (
    <div className="app-shell">
      <style>{`
.app-shell, .app-shell * {
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.app-shell {
  --primary: #0b5cff;
  --primary-dark: #0a4fd8;
  --bg: #ffffff;
  --fg: #0f172a;
  --muted: #5f6a7a;
  --border: #c8d7f5;
  --accent: #f1f4fc;
  background: var(--bg);
  color: var(--fg);
  min-height: 100vh;
}
.app-background {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}
.app-accent-lines {
  position: absolute;
  inset: 0;
}
.app-accent-lines .hline,
.app-accent-lines .vline {
  position: absolute;
  background: rgba(11,92,255,0.2);
  opacity: 0.9;
  will-change: transform, opacity;
}
.app-accent-lines .hline {
  height: 1px; left: 0; right: 0;
  transform: scaleX(0);
  transform-origin: 50% 50%;
  animation: drawX 800ms cubic-bezier(.22,.61,.36,1) forwards;
}
.app-accent-lines .hline:nth-child(1){ top: 18%; animation-delay: 120ms; }
.app-accent-lines .hline:nth-child(2){ top: 50%; animation-delay: 240ms; }
.app-accent-lines .hline:nth-child(3){ top: 78%; animation-delay: 360ms; }
.app-accent-lines .vline {
  width: 1px; top: 0; bottom: 0;
  transform: scaleY(0);
  transform-origin: 50% 0%;
  animation: drawY 900ms cubic-bezier(.22,.61,.36,1) forwards;
}
.app-accent-lines .vline:nth-child(4){ left: 22%; animation-delay: 480ms; }
.app-accent-lines .vline:nth-child(5){ left: 50%; animation-delay: 600ms; }
.app-accent-lines .vline:nth-child(6){ left: 78%; animation-delay: 720ms; }
.app-accent-lines .hline::after, .app-accent-lines .vline::after{
  content:"";
  position:absolute;
  inset:0;
  background: linear-gradient(90deg, transparent, rgba(11,92,255,.24), transparent);
  opacity:0;
  animation: shimmer 900ms ease-out forwards;
}
.app-accent-lines .hline:nth-child(1)::after{ animation-delay: 120ms; }
.app-accent-lines .hline:nth-child(2)::after{ animation-delay: 240ms; }
.app-accent-lines .hline:nth-child(3)::after{ animation-delay: 360ms; }
.app-accent-lines .vline:nth-child(4)::after{ animation-delay: 480ms; }
.app-accent-lines .vline:nth-child(5)::after{ animation-delay: 600ms; }
.app-accent-lines .vline:nth-child(6)::after{ animation-delay: 720ms; }
@keyframes drawX {
  0% { transform: scaleX(0); opacity: 0; }
  60% { opacity: .9; }
  100% { transform: scaleX(1); opacity: .75; }
}
@keyframes drawY {
  0% { transform: scaleY(0); opacity: 0; }
  60% { opacity: .9; }
  100% { transform: scaleY(1); opacity: .75; }
}
@keyframes shimmer {
  0% { opacity: .0; }
  30% { opacity: .25; }
  100% { opacity: 0; }
}
.app-header {
  position: sticky;
  top: 0;
  z-index: 20;
  padding: 14px 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 1px solid rgba(11,92,255,0.08);
}
.app-brand {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--fg);
}
.app-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.app-user {
  height: 36px;
  min-width: 36px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(11,92,255,0.12);
  background: rgba(11,92,255,0.06);
  color: var(--fg);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
}
.app-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}
.app-logout {
  height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  background: var(--primary);
  color: #fff;
  border: 1px solid rgba(11,92,255,0.2);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.01em;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 10px 28px rgba(11,92,255,0.18);
}
.app-logout:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 12px 32px rgba(11,92,255,0.22);
}
.app-generate-pdf {
  height: 38px;
  padding: 0 16px;
  border-radius: 999px;
  background: var(--primary);
  color: #fff;
  border: 1px solid rgba(11,92,255,0.2);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.01em;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 10px 30px rgba(11,92,255,0.18);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}
.app-generate-pdf:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 12px 34px rgba(11,92,255,0.22);
}
.app-generate-pdf:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
.app-container {
  position: relative;
  z-index: 5;
}
.app-main {
  max-width: 1100px;
  margin: 0 auto;
  padding: 48px 24px 64px 24px;
}
.hub-hero {
  text-align: center;
  margin-bottom: 28px;
}
.hub-kicker {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--primary);
  margin-bottom: 8px;
}
.hub-title {
  font-size: clamp(32px, 5vw, 46px);
  font-weight: 300;
  color: var(--fg);
  margin: 0 0 10px 0;
  letter-spacing: -0.01em;
}
.hub-sub {
  color: var(--muted);
  font-size: 15px;
  line-height: 1.6;
  max-width: 680px;
  margin: 0 auto;
}
.hub-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}
.hub-card {
  border: 1px solid rgba(11,92,255,0.12);
  border-radius: 28px;
  background: #fff;
  box-shadow: 0 18px 48px rgba(11,92,255,0.08);
  padding: 20px;
}
.pill {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(11,92,255,0.08);
  color: #0f172a;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid rgba(11,92,255,0.14);
}
@media (max-width: 768px) {
  .app-header { padding: 12px 18px; }
  .app-main { padding: 36px 18px 48px 18px; }
}
      `}</style>
      <div className="app-background">{accentLines}</div>
      <div className="app-container">
        <header className="app-header">
          <div className="app-brand">Realta Wealth</div>
          <div className="app-actions">
            {hasProfiles && onGeneratePdf && (
              <button
                type="button"
                onClick={onGeneratePdf}
                disabled={isGeneratingPdf}
                className="app-generate-pdf"
              >
                {isGeneratingPdf ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Generate PDF
                  </>
                )}
              </button>
            )}
            <div className="app-user">
              <span className="app-avatar">{userName?.[0]?.toUpperCase() || "R"}</span>
              <span>{userName || "Profile"}</span>
            </div>
            <button className="app-logout" onClick={onLogout}>
              Log out
            </button>
          </div>
        </header>
        <main className="app-main">{children}</main>
      </div>
    </div>
  );
}

function ProtectedApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [profiles, setProfiles] = useState<InvestorProfile[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(false);
  const [profilesError, setProfilesError] = useState<string | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Determine current view from route
  const isFormView = location.pathname.includes("/profile");
  const profileId = location.pathname.includes("/profile/") 
    ? location.pathname.split("/profile/")[1] 
    : null;

  const fetchProfiles = useCallback(async () => {
    try {
      setProfilesLoading(true);
      setProfilesError(null);
      const resp = await getProfilesByUser(undefined, { page: 1, limit: 10 });
      setProfiles(resp.profiles || []);
    } catch (err: any) {
      setProfilesError(err.message || "Unable to load forms");
    } finally {
      setProfilesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  // Refresh profiles when returning to hub (so Continue uses latest data)
  useEffect(() => {
    if (!isFormView) {
      fetchProfiles();
    }
  }, [isFormView, fetchProfiles]);

  const handleSelectProfile = (profileId: string) => {
    navigate(`/app/profile/${profileId}`, { replace: true });
  };

  const handleStartNew = () => {
    // If profile exists, navigate to it (will update it)
    // Otherwise, navigate to new (will create it)
    if (profiles.length > 0 && profiles[0].id) {
      navigate(`/app/profile/${profiles[0].id}`, { replace: true });
    } else {
      navigate("/app/profile/new", { replace: true });
    }
  };

  const handleBackToHub = () => {
    navigate("/app", { replace: true });
  };

  const handleGeneratePdf = async () => {
    const profileIdToUse = selectedProfileId || (profiles[0]?.id);
    
    if (!profileIdToUse) {
      alert("Please select a profile first");
      return;
    }

    setIsGeneratingPdf(true);
    try {
      // Call backend endpoint which handles n8n webhook
      await generatePdf(profileIdToUse);
      alert("PDF generation request sent successfully!");
    } catch (error: any) {
      console.error("Error generating PDF:", error);
      alert(error.message || "Failed to generate PDF");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Auto-select the user's profile when it loads (only one profile per user)
  useEffect(() => {
    if (profiles.length > 0 && !selectedProfileId) {
      // Since there's only one profile per user, select it automatically
      setSelectedProfileId(profiles[0].id);
    }
  }, [profiles, selectedProfileId]);

  const primaryProfile = profiles[0];
  const statusLabel = primaryProfile ? primaryProfile.status : "Not started";
  const actionLabel = primaryProfile ? (primaryProfile.status === "submitted" ? "View" : "Continue") : "Start";

  return (
    <AppShell 
      onLogout={() => logout("/auth")} 
      userName={user?.fullName}
      onGeneratePdf={handleGeneratePdf}
      isGeneratingPdf={isGeneratingPdf}
      hasProfiles={profiles.length > 0 && !!selectedProfileId}
    >
      {!isFormView && (
        <div className="space-y-10">
          <div className="hub-hero">
            <div className="hub-kicker">Realta Wealth</div>
            <h1 className="hub-title">Your investor forms, simplified.</h1>
            <p className="hub-sub">Start or continue the Investor Profile. Clean, guided, and ready for your clients.</p>
          </div>

          <div className="hub-grid">
            <div className="hub-card flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--primary)] mb-1">Form</p>
                  <h2 className="text-xl font-semibold text-[var(--fg)]">Investor Profile</h2>
                  <p className="text-sm text-[var(--muted)]">Accurate, guided onboarding for Realta clients.</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[rgba(11,92,255,0.08)] text-[var(--primary)] border border-[rgba(11,92,255,0.16)]">
                  {statusLabel}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="pill">Blue-first palette</span>
                <span className="pill">Advisor-ready</span>
                <span className="pill">Secure</span>
              </div>

              {profilesError && <div className="text-sm text-red-600">{profilesError}</div>}

              {/* Profile Info - Only one profile per user */}
              {profiles.length > 0 && primaryProfile && (
                <div className="mt-6 pt-6 border-t border-[rgba(11,92,255,0.1)]">
                  <div className="text-xs font-semibold text-[var(--muted)] mb-2 uppercase tracking-[0.1em]">
                    Your Profile
                  </div>
                  <div className="text-sm text-[var(--fg)]">
                    {primaryProfile.rrName || primaryProfile.customerNames || `Profile ${primaryProfile.id.slice(0, 8)}`}
                    {primaryProfile.accountNo && (
                      <span className="text-[var(--muted)] ml-2">• {primaryProfile.accountNo}</span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-[var(--muted)]">
                  {primaryProfile 
                    ? "Continue editing your investor profile or generate a PDF when ready." 
                    : "Start your investor profile. You can save and continue anytime."}
                </div>
                <button
                  type="button"
                  className="h-11 px-5 rounded-full bg-[var(--primary)] text-white text-sm font-semibold hover:bg-[var(--primary-dark)] transition"
                  onClick={() => {
                    if (primaryProfile) {
                      handleSelectProfile(primaryProfile.id);
                    } else {
                      handleStartNew();
                    }
                  }}
                  disabled={profilesLoading}
                >
                  {actionLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isFormView && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--primary)] mb-1">Investor Profile</p>
              <h2 className="text-xl font-semibold text-[var(--fg)]">Complete your form</h2>
            </div>
            <button
              className="text-[var(--primary)] text-sm font-semibold hover:underline"
              onClick={handleBackToHub}
            >
              ← Back to forms
            </button>
          </div>
          <InvestorProfileForm />
        </div>
      )}
    </AppShell>
  );
}

export default function App() {
  // Setup API interceptor for global 401 handling
  useEffect(() => {
    setupApiInterceptor();
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/auth"
            element={
              <PublicRoute>
                <AuthPage />
              </PublicRoute>
            }
          />
          <Route
            path="/app/*"
            element={
              <ProtectedRoute>
                <ProtectedApp />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

