import { useState, useEffect, useMemo, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import InvestorProfileForm from "./components/InvestorProfileForm";
import StatementOfFinancialConditionForm from "./components/StatementOfFinancialConditionForm";
import AdditionalHolderForm from "./components/AdditionalHolderForm";
import AltOrderForm from "./components/AltOrderForm";
import AccreditationForm from "./components/AccreditationForm";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AuthPage } from "./components/AuthPage";
import LandingPage from "./components/LandingPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicRoute } from "./components/PublicRoute";
import AdminDashboard from "./components/AdminDashboard";
import ClientCreationDrawer from "./components/ClientCreationDrawer";
import ClientDetailView from "./components/ClientDetailView";
import ClientFormsHub from "./components/ClientFormsHub";
import { getProfilesByUser, generatePdf, getStatements, getAdditionalHolders, getAltOrders, getAccreditations, generateStatementPdf, generateAdditionalHolderPdf, generateAltOrderPdf, generateAccreditationPdf, type InvestorProfile, type StatementProfile, type AdditionalHolderProfile, type AltOrderProfile, type AccreditationProfile, type Client } from "./api";
import { setupApiInterceptor } from "./utils/apiInterceptor";
import { useToast, ToastContainer } from "./components/Toast";

function AppShell({
  children,
  onLogout,
  userName,
  onGeneratePdf,
  isGeneratingPdf,
  hasProfiles,
  hasSelectedForms,
}: {
  children: React.ReactNode;
  onLogout: () => void;
  userName?: string | null;
  onGeneratePdf?: () => void;
  isGeneratingPdf?: boolean;
  hasProfiles?: boolean;
  hasSelectedForms?: boolean;
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
  display: flex;
  flex-direction: column;
  gap: 20px;
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
          <div className="app-brand">Tax Alpha</div>
          <div className="app-actions">
            {hasProfiles && onGeneratePdf && (
              <button
                type="button"
                onClick={onGeneratePdf}
                disabled={isGeneratingPdf || !hasSelectedForms}
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
  const { toasts, showToast, removeToast } = useToast();
  const [showClientModal, setShowClientModal] = useState(false);

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  const [profiles, setProfiles] = useState<InvestorProfile[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(false);
  const [profilesError, setProfilesError] = useState<string | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [statements, setStatements] = useState<StatementProfile[]>([]);
  const [statementsLoading, setStatementsLoading] = useState(false);
  const [additionalHolders, setAdditionalHolders] = useState<AdditionalHolderProfile[]>([]);
  const [additionalHoldersLoading, setAdditionalHoldersLoading] = useState(false);
  const [altOrders, setAltOrders] = useState<AltOrderProfile[]>([]);
  const [altOrdersLoading, setAltOrdersLoading] = useState(false);
  const [accreditations, setAccreditations] = useState<AccreditationProfile[]>([]);
  const [accreditationsLoading, setAccreditationsLoading] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [selectedForms, setSelectedForms] = useState<Set<string>>(new Set());
  const [isGeneratingSelectedPdfs, setIsGeneratingSelectedPdfs] = useState(false);

  // Determine current view from route
  const isClientFormsRoute = location.pathname.includes("/clients/") && location.pathname.includes("/forms");
  const isClientDetailRoute = location.pathname.match(/^\/app\/clients\/[^/]+$/);
  const isFormView =
    location.pathname.includes("/profile") ||
    location.pathname.includes("/statement") ||
    location.pathname.includes("/additional-holder") ||
    location.pathname.includes("/alt-order") ||
    location.pathname.includes("/506c");
  const isStatementView = location.pathname.includes("/statement");
  const isAdditionalHolderView = location.pathname.includes("/additional-holder");
  const isAltOrderView = location.pathname.includes("/alt-order");
  const isAccreditationView = location.pathname.includes("/506c");
  
  // Extract IDs from route
  const clientIdMatch = location.pathname.match(/\/clients\/([^/]+)/);
  const clientId = clientIdMatch ? clientIdMatch[1] : null;
  
  // Extract form IDs - handle both /app/profile/:id and /app/clients/:clientId/forms/profile/:id
  const profileIdMatch = location.pathname.match(/\/profile\/([^/]+)/);
  const profileId = profileIdMatch ? (profileIdMatch[1] === "new" ? null : profileIdMatch[1]) : null;
  
  const statementIdMatch = location.pathname.match(/\/statement\/([^/]+)/);
  const statementId = statementIdMatch ? (statementIdMatch[1] === "new" ? null : statementIdMatch[1]) : null;
  
  const additionalHolderIdMatch = location.pathname.match(/\/additional-holder\/([^/]+)/);
  const additionalHolderId = additionalHolderIdMatch ? (additionalHolderIdMatch[1] === "new" ? null : additionalHolderIdMatch[1]) : null;
  
  const altOrderIdMatch = location.pathname.match(/\/alt-order\/([^/]+)/);
  const altOrderId = altOrderIdMatch ? (altOrderIdMatch[1] === "new" ? null : altOrderIdMatch[1]) : null;
  
  const accreditationIdMatch = location.pathname.match(/\/506c\/([^/]+)/);
  const accreditationId = accreditationIdMatch ? (accreditationIdMatch[1] === "new" ? null : accreditationIdMatch[1]) : null;

  const fetchProfiles = useCallback(async () => {
    try {
      setProfilesLoading(true);
      setProfilesError(null);
      const resp = await getProfilesByUser(undefined, { page: 1, limit: 10 }, clientId || undefined);
      setProfiles(resp.profiles || []);
    } catch (err: any) {
      setProfilesError(err.message || "Unable to load forms");
    } finally {
      setProfilesLoading(false);
    }
  }, [clientId]);

  const fetchStatements = useCallback(async () => {
    try {
      setStatementsLoading(true);
      const resp = await getStatements({ page: 1, limit: 10, clientId: clientId || undefined });
      setStatements(resp.statements || []);
    } catch (err: any) {
      console.error("Error fetching statements:", err);
      setStatements([]);
    } finally {
      setStatementsLoading(false);
    }
  }, [clientId]);

  const fetchAdditionalHolders = useCallback(async () => {
    try {
      setAdditionalHoldersLoading(true);
      const resp = await getAdditionalHolders({ page: 1, limit: 10, clientId: clientId || undefined });
      setAdditionalHolders(resp.profiles || []);
    } catch (err: any) {
      console.error("Error fetching additional holders:", err);
      setAdditionalHolders([]);
    } finally {
      setAdditionalHoldersLoading(false);
    }
  }, [clientId]);

  const fetchAltOrders = useCallback(async () => {
    try {
      setAltOrdersLoading(true);
      const resp = await getAltOrders({ page: 1, limit: 10, clientId: clientId || undefined });
      setAltOrders(resp.profiles || []);
    } catch (err: any) {
      console.error("Error fetching alt orders:", err);
      setAltOrders([]);
    } finally {
      setAltOrdersLoading(false);
    }
  }, [clientId]);

  const fetchAccreditations = useCallback(async () => {
    try {
      setAccreditationsLoading(true);
      const resp = await getAccreditations({ page: 1, limit: 10, clientId: clientId || undefined });
      setAccreditations(resp.profiles || []);
    } catch (err: any) {
      console.error("Error fetching accreditations:", err);
      setAccreditations([]);
    } finally {
      setAccreditationsLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchProfiles();
    fetchStatements();
    fetchAdditionalHolders();
    fetchAltOrders();
    fetchAccreditations();
  }, [fetchProfiles, fetchStatements, fetchAdditionalHolders, fetchAltOrders, fetchAccreditations]);

  // Refresh profiles, statements, additional holders, alt orders, and accreditations when returning to hub (so Continue uses latest data)
  useEffect(() => {
    if (!isFormView) {
      fetchProfiles();
      fetchStatements();
      fetchAdditionalHolders();
      fetchAltOrders();
      fetchAccreditations();
    }
  }, [isFormView, fetchProfiles, fetchStatements, fetchAdditionalHolders, fetchAltOrders, fetchAccreditations]);

  const handleSelectProfile = (profileId: string) => {
    if (clientId) {
      navigate(`/app/clients/${clientId}/forms/profile/${profileId}`, { replace: true });
    } else {
    navigate(`/app/profile/${profileId}`, { replace: true });
    }
  };

  const handleStartNew = () => {
    if (clientId) {
      if (profiles.length > 0 && profiles[0].id) {
        navigate(`/app/clients/${clientId}/forms/profile/${profiles[0].id}`, { replace: true });
      } else {
        navigate(`/app/clients/${clientId}/forms/profile/new`, { replace: true });
      }
    } else {
    if (profiles.length > 0 && profiles[0].id) {
      navigate(`/app/profile/${profiles[0].id}`, { replace: true });
    } else {
      navigate("/app/profile/new", { replace: true });
      }
    }
  };

  const handleStartNewStatement = () => {
    const draftStatement = statements.find(s => s.status === "draft");
    if (clientId) {
      if (draftStatement && draftStatement.id) {
        navigate(`/app/clients/${clientId}/forms/statement/${draftStatement.id}`, { replace: true });
      } else {
        navigate(`/app/clients/${clientId}/forms/statement/new`, { replace: true });
      }
    } else {
    if (draftStatement && draftStatement.id) {
      navigate(`/app/statement/${draftStatement.id}`, { replace: true });
    } else {
      navigate("/app/statement/new", { replace: true });
      }
    }
  };

  const handleStartNewAltOrder = () => {
    const draftAltOrder = altOrders.find(o => o.status === "draft");
    if (clientId) {
      if (draftAltOrder && draftAltOrder.id) {
        navigate(`/app/clients/${clientId}/forms/alt-order/${draftAltOrder.id}`, { replace: true });
      } else {
        navigate(`/app/clients/${clientId}/forms/alt-order/new`, { replace: true });
      }
    } else {
    if (draftAltOrder && draftAltOrder.id) {
      navigate(`/app/alt-order/${draftAltOrder.id}`, { replace: true });
    } else {
      navigate("/app/alt-order/new", { replace: true });
      }
    }
  };

  const handleStartNewAdditionalHolder = () => {
    const draftAdditionalHolder = additionalHolders.find(h => h.status === "draft");
    if (clientId) {
      if (draftAdditionalHolder && draftAdditionalHolder.id) {
        navigate(`/app/clients/${clientId}/forms/additional-holder/${draftAdditionalHolder.id}`, { replace: true });
      } else {
        navigate(`/app/clients/${clientId}/forms/additional-holder/new`, { replace: true });
      }
    } else {
    if (draftAdditionalHolder && draftAdditionalHolder.id) {
      navigate(`/app/additional-holder/${draftAdditionalHolder.id}`, { replace: true });
    } else {
      navigate("/app/additional-holder/new", { replace: true });
      }
    }
  };

  const handleStartNewAccreditation = () => {
    const draftAccreditation = accreditations.find(a => a.status === "draft");
    if (clientId) {
      if (draftAccreditation && draftAccreditation.id) {
        navigate(`/app/clients/${clientId}/forms/506c/${draftAccreditation.id}`, { replace: true });
      } else {
        navigate(`/app/clients/${clientId}/forms/506c/new`, { replace: true });
      }
    } else {
    if (draftAccreditation && draftAccreditation.id) {
      navigate(`/app/506c/${draftAccreditation.id}`, { replace: true });
    } else {
      navigate("/app/506c/new", { replace: true });
      }
    }
  };

  const handleBackToHub = () => {
    if (clientId) {
      navigate(`/app/clients/${clientId}/forms`, { replace: true });
    } else {
    navigate("/app", { replace: true });
    }
  };

  const handleClientCreated = (client: Client) => {
    navigate(`/app/clients/${client.id}/forms`, { replace: true });
  };

  const handleClientClick = (clientId: string) => {
    navigate(`/app/clients/${clientId}`, { replace: true });
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

  const handleToggleFormSelection = (formType: string) => {
    setSelectedForms((prev) => {
      const next = new Set(prev);
      if (next.has(formType)) {
        next.delete(formType);
      } else {
        next.add(formType);
      }
      return next;
    });
  };

  const handleGenerateSelectedPdfs = async () => {
    console.log('[App] handleGenerateSelectedPdfs called');
    console.log('[App] selectedForms:', selectedForms);
    console.log('[App] selectedForms.size:', selectedForms.size);
    console.log('[App] selectedForms array:', Array.from(selectedForms));
    
    if (selectedForms.size === 0) {
      showToast("Please select at least one form to generate PDF", "warning");
      return;
    }

    setIsGeneratingSelectedPdfs(true);
    const results: Array<{ formType: string; success: boolean; message: string }> = [];

    try {
      // Generate PDFs for each selected form
      for (const formType of selectedForms) {
        console.log('[App] Processing formType:', formType);
        console.log('[App] formType type:', typeof formType);
        console.log('[App] formType === "statement":', formType === "statement");
        
        try {
          let success = false;
          let message = "";

          switch (formType) {
            case "investorProfile": {
              const profileToUse = profiles.find(p => p.id);
              if (!profileToUse?.id) {
                results.push({ formType, success: false, message: "No investor profile found" });
                continue;
              }
              await generatePdf(profileToUse.id);
              success = true;
              message = "Investor Profile PDF generated";
              break;
            }
            case "statement": {
              console.log('[App] === STATEMENT CASE HIT ===');
              console.log('[App] Generating PDF for statement, available statements:', statements);
              console.log('[App] statements.length:', statements?.length || 0);
              const draftStatement = statements.find(s => s.status === "draft" || s.status === "submitted");
              console.log('[App] Found statement for PDF:', draftStatement);
              console.log('[App] draftStatement?.id:', draftStatement?.id);
              if (!draftStatement?.id) {
                console.log('[App] No statement found, adding error result');
                results.push({ formType, success: false, message: "No statement found" });
                continue;
              }
              console.log('[App] About to call generateStatementPdf with ID:', draftStatement.id);
              await generateStatementPdf(draftStatement.id);
              console.log('[App] generateStatementPdf completed successfully');
              success = true;
              message = "Statement PDF generated";
              break;
            }
            case "accreditation": {
              const draftAccreditation = accreditations.find(a => a.status === "draft" || a.status === "submitted");
              if (!draftAccreditation?.id) {
                results.push({ formType, success: false, message: "No accreditation found" });
                continue;
              }
              await generateAccreditationPdf(draftAccreditation.id);
              success = true;
              message = "Accreditation PDF generated";
              break;
            }
            case "additionalHolder": {
              const draftAdditionalHolder = additionalHolders.find(h => h.status === "draft" || h.status === "submitted");
              if (!draftAdditionalHolder?.id) {
                results.push({ formType, success: false, message: "No additional holder found" });
                continue;
              }
              await generateAdditionalHolderPdf(draftAdditionalHolder.id);
              success = true;
              message = "Additional Holder PDF generated";
              break;
            }
            case "altOrder": {
              const draftAltOrder = altOrders.find(o => o.status === "draft" || o.status === "submitted");
              if (!draftAltOrder?.id) {
                results.push({ formType, success: false, message: "No alt order found" });
                continue;
              }
              await generateAltOrderPdf(draftAltOrder.id);
              success = true;
              message = "Alt Order PDF generated";
              break;
            }
            default:
              console.error('[App] UNKNOWN FORM TYPE IN SWITCH:', formType);
              console.error('[App] formType value:', JSON.stringify(formType));
              console.error('[App] formType === "statement":', formType === "statement");
              console.error('[App] formType === "investorProfile":', formType === "investorProfile");
              results.push({ formType, success: false, message: `Unknown form type: ${formType}` });
          }
          
          console.log('[App] After switch, success:', success, 'message:', message);

          if (success) {
            results.push({ formType, success: true, message });
          }
        } catch (error: any) {
          results.push({ formType, success: false, message: error.message || "Failed to generate PDF" });
        }
      }

      // Show results
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      if (successCount > 0 && failCount === 0) {
        showToast(`Successfully generated ${successCount} PDF(s)`, "success");
      } else if (successCount > 0 && failCount > 0) {
        showToast(`Generated ${successCount} PDF(s), ${failCount} failed`, "warning");
      } else {
        showToast("Failed to generate PDFs", "error");
      }

      // Clear selections after generation
      setSelectedForms(new Set());
    } catch (error: any) {
      console.error("Error generating PDFs:", error);
      showToast(error.message || "Failed to generate PDFs", "error");
    } finally {
      setIsGeneratingSelectedPdfs(false);
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
  
  const draftStatement = statements.find(s => s.status === "draft");
  const statementActionLabel = draftStatement ? "Continue" : "Start";
  
  const draftAdditionalHolder = additionalHolders.find(h => h.status === "draft");
  const additionalHolderActionLabel = draftAdditionalHolder ? "Continue" : "Start";
  
  const draftAltOrder = altOrders.find(o => o.status === "draft");
  const altOrderActionLabel = draftAltOrder ? "Continue" : "Start";
  
  const draftAccreditation = accreditations.find(a => a.status === "draft");
  const accreditationActionLabel = draftAccreditation ? "Continue" : "Start";

  // Show admin dashboard for admins on main /app route
  if (isAdmin && location.pathname === "/app") {
    return (
      <AppShell 
        onLogout={() => logout("/auth")} 
        userName={user?.fullName}
      >
        <AdminDashboard 
          onCreateClient={() => setShowClientModal(true)}
          onClientClick={handleClientClick}
        />
        <ClientCreationDrawer
          isOpen={showClientModal}
          onClose={() => setShowClientModal(false)}
          onSuccess={handleClientCreated}
        />
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </AppShell>
    );
  }

  // Show client detail view
  if (isAdmin && isClientDetailRoute) {
    return (
      <AppShell 
        onLogout={() => logout("/auth")} 
        userName={user?.fullName}
      >
        <ClientDetailView />
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </AppShell>
    );
  }

  // Show client forms hub (client-scoped)
  if (isAdmin && isClientFormsRoute && !isFormView) {
    const hasAnyForms =
      profiles.length > 0 ||
      statements.length > 0 ||
      additionalHolders.length > 0 ||
      altOrders.length > 0 ||
      accreditations.length > 0;

    return (
      <AppShell 
        onLogout={() => logout("/auth")} 
        userName={user?.fullName}
        onGeneratePdf={handleGenerateSelectedPdfs}
        isGeneratingPdf={isGeneratingSelectedPdfs}
        hasProfiles={hasAnyForms}
        hasSelectedForms={selectedForms.size > 0}
      >
        <ClientFormsHub
          selectedForms={selectedForms}
          onToggleFormSelection={handleToggleFormSelection}
        />
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </AppShell>
    );
  }

  return (
    <AppShell 
      onLogout={() => logout("/auth")} 
      userName={user?.fullName}
      onGeneratePdf={handleGeneratePdf}
      isGeneratingPdf={isGeneratingPdf}
      hasProfiles={profiles.length > 0 && !!selectedProfileId}
      hasSelectedForms={selectedForms.size > 0}
    >
      {!isFormView && !isClientFormsRoute && (
        <div className="space-y-10">
          <div className="hub-hero">
            <div className="hub-kicker">Tax Alpha</div>
            <h1 className="hub-title">Your investor forms, simplified.</h1>
            <p className="hub-sub">Start or continue your forms. Clean, guided, and ready for your clients.</p>
          </div>

          <div className="hub-grid">
            <div className="hub-card flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedForms.has("investorProfile")}
                      onChange={() => handleToggleFormSelection("investorProfile")}
                      className="w-5 h-5 rounded border-2 border-[rgba(11,92,255,0.3)] text-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-1 transition-all cursor-pointer group-hover:border-[var(--primary)]"
                    />
                  </label>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--primary)] mb-1">Form</p>
                    <h2 className="text-xl font-semibold text-[var(--fg)]">Investor Profile</h2>
                    <p className="text-sm text-[var(--muted)]">Accurate, guided onboarding for Realta clients.</p>
                  </div>
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

            <div className="hub-card flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedForms.has("statement")}
                      onChange={() => handleToggleFormSelection("statement")}
                      className="w-5 h-5 rounded border-2 border-[rgba(11,92,255,0.3)] text-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-1 transition-all cursor-pointer group-hover:border-[var(--primary)]"
                    />
                  </label>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--primary)] mb-1">Form</p>
                    <h2 className="text-xl font-semibold text-[var(--fg)]">Statement of Financial Condition</h2>
                    <p className="text-sm text-[var(--muted)]">Financial condition assessment for accredited investors.</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[rgba(11,92,255,0.08)] text-[var(--primary)] border border-[rgba(11,92,255,0.16)]">
                  Available
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="pill">Financial Data</span>
                <span className="pill">Reg D Compliance</span>
                <span className="pill">Secure</span>
              </div>

              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-[var(--muted)]">
                  Complete your statement of financial condition for investment suitability assessment.
                </div>
                <button
                  type="button"
                  className="h-11 px-5 rounded-full bg-[var(--primary)] text-white text-sm font-semibold hover:bg-[var(--primary-dark)] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleStartNewStatement}
                  disabled={statementsLoading}
                >
                  {statementActionLabel}
                </button>
              </div>
            </div>

            <div className="hub-card flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedForms.has("additionalHolder")}
                      onChange={() => handleToggleFormSelection("additionalHolder")}
                      className="w-5 h-5 rounded border-2 border-[rgba(11,92,255,0.3)] text-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-1 transition-all cursor-pointer group-hover:border-[var(--primary)]"
                    />
                  </label>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--primary)] mb-1">Form</p>
                    <h2 className="text-xl font-semibold text-[var(--fg)]">Additional Holder</h2>
                    <p className="text-sm text-[var(--muted)]">Additional Holder / Participant Information Supplement.</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[rgba(11,92,255,0.08)] text-[var(--primary)] border border-[rgba(11,92,255,0.16)]">
                  Available
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="pill">Joint Holder #3</span>
                <span className="pill">Trustee #2</span>
                <span className="pill">Entity Manager #2</span>
              </div>

              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-[var(--muted)]">
                  Complete additional holder information for joint accounts, trusts, or entities.
                </div>
                <button
                  type="button"
                  className="h-11 px-5 rounded-full bg-[var(--primary)] text-white text-sm font-semibold hover:bg-[var(--primary-dark)] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleStartNewAdditionalHolder}
                  disabled={additionalHoldersLoading}
                >
                  {additionalHolderActionLabel}
                </button>
              </div>
            </div>

            <div className="hub-card flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedForms.has("altOrder")}
                      onChange={() => handleToggleFormSelection("altOrder")}
                      className="w-5 h-5 rounded border-2 border-[rgba(11,92,255,0.3)] text-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-1 transition-all cursor-pointer group-hover:border-[var(--primary)]"
                    />
                  </label>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--primary)] mb-1">Form</p>
                    <h2 className="text-xl font-semibold text-[var(--fg)]">Alternative Investment Order</h2>
                    <p className="text-sm text-[var(--muted)]">Brokerage Alternative Investment Order and Disclosure Form.</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[rgba(11,92,255,0.08)] text-[var(--primary)] border border-[rgba(11,92,255,0.16)]">
                  Available
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="pill">Alternative Investments</span>
                <span className="pill">Order Form</span>
                <span className="pill">Disclosure</span>
              </div>

              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-[var(--muted)]">
                  Complete alternative investment order and disclosure form.
                </div>
                <button
                  type="button"
                  className="h-11 px-5 rounded-full bg-[var(--primary)] text-white text-sm font-semibold hover:bg-[var(--primary-dark)] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleStartNewAltOrder}
                  disabled={altOrdersLoading}
                >
                  {altOrderActionLabel}
                </button>
              </div>
            </div>
            <div className="hub-card flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedForms.has("accreditation")}
                      onChange={() => handleToggleFormSelection("accreditation")}
                      className="w-5 h-5 rounded border-2 border-[rgba(11,92,255,0.3)] text-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-1 transition-all cursor-pointer group-hover:border-[var(--primary)]"
                    />
                  </label>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--primary)] mb-1">Form</p>
                    <h2 className="text-xl font-semibold text-[var(--fg)]">Accredited Investor Verification (506c)</h2>
                    <p className="text-sm text-[var(--muted)]">Brokerage Accredited Investor Verification Form for SEC Rule 506C.</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[rgba(11,92,255,0.08)] text-[var(--primary)] border border-[rgba(11,92,255,0.16)]">
                  Available
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="pill">Accreditation</span>
                <span className="pill">Rule 506c</span>
                <span className="pill">Verification</span>
              </div>

              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-[var(--muted)]">
                  Verify accredited investor status with policy guidance and signatures.
                </div>
                <button
                  type="button"
                  className="h-11 px-5 rounded-full bg-[var(--primary)] text-white text-sm font-semibold hover:bg-[var(--primary-dark)] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleStartNewAccreditation}
                  disabled={accreditationsLoading}
                >
                  {accreditationActionLabel}
                </button>
              </div>
            </div>
          </div>

          {/* Floating Generate PDF Button */}
          {selectedForms.size > 0 && (
            <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-5">
              <button
                type="button"
                onClick={handleGenerateSelectedPdfs}
                disabled={isGeneratingSelectedPdfs}
                className="h-14 px-6 rounded-full bg-[var(--primary)] text-white text-sm font-semibold hover:bg-[var(--primary-dark)] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
              >
                {isGeneratingSelectedPdfs ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Generate PDF{selectedForms.size > 1 ? "s" : ""} ({selectedForms.size})
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {isFormView && !isStatementView && !isAdditionalHolderView && !isAltOrderView && !isAccreditationView && (
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
              ← Back to {clientId ? "client forms" : "forms"}
            </button>
          </div>
          <InvestorProfileForm clientId={clientId || undefined} />
        </div>
      )}

      {isStatementView && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--primary)] mb-1">Statement of Financial Condition</p>
              <h2 className="text-xl font-semibold text-[var(--fg)]">Complete your form</h2>
            </div>
            <button
              className="text-[var(--primary)] text-sm font-semibold hover:underline"
              onClick={handleBackToHub}
            >
              ← Back to {clientId ? "client forms" : "forms"}
            </button>
          </div>
          <StatementOfFinancialConditionForm clientId={clientId || undefined} />
        </div>
      )}

      {isAdditionalHolderView && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--primary)] mb-1">Additional Holder</p>
              <h2 className="text-xl font-semibold text-[var(--fg)]">Complete your form</h2>
            </div>
            <button
              className="text-[var(--primary)] text-sm font-semibold hover:underline"
              onClick={handleBackToHub}
            >
              ← Back to {clientId ? "client forms" : "forms"}
            </button>
          </div>
          <AdditionalHolderForm clientId={clientId || undefined} />
        </div>
      )}

      {isAltOrderView && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--primary)] mb-1">Alternative Investment Order</p>
              <h2 className="text-xl font-semibold text-[var(--fg)]">Complete your form</h2>
            </div>
            <button
              className="text-[var(--primary)] text-sm font-semibold hover:underline"
              onClick={handleBackToHub}
            >
              ← Back to {clientId ? "client forms" : "forms"}
            </button>
          </div>
          <AltOrderForm clientId={clientId || undefined} />
        </div>
      )}

      {isAccreditationView && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--primary)] mb-1">Accredited Investor Verification (506c)</p>
              <h2 className="text-xl font-semibold text-[var(--fg)]">Complete your form</h2>
            </div>
            <button
              className="text-[var(--primary)] text-sm font-semibold hover:underline"
              onClick={handleBackToHub}
            >
              ← Back to {clientId ? "client forms" : "forms"}
            </button>
          </div>
          <AccreditationForm clientId={clientId || undefined} />
        </div>
      )}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
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

