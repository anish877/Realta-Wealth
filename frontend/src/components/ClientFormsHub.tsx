import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getProfilesByUser, getStatements, getAdditionalHolders, getAltOrders, getAccreditations, type InvestorProfile, type StatementProfile, type AdditionalHolderProfile, type AltOrderProfile, type AccreditationProfile } from "../api";
import { getClient } from "../api";
import { useToast } from "./Toast";

type FormSelectionHandler = (formType: string) => void;

export default function ClientFormsHub({
  selectedForms = new Set<string>(),
  onToggleFormSelection,
}: {
  selectedForms?: Set<string>;
  onToggleFormSelection?: FormSelectionHandler;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  // Extract clientId from URL pathname (more reliable than useParams)
  const clientId = useMemo(() => {
    const clientIdMatch = location.pathname.match(/\/clients\/([^/]+)/);
    return clientIdMatch ? clientIdMatch[1] : null;
  }, [location.pathname]);

  const [client, setClient] = useState<any>(null);
  const [profiles, setProfiles] = useState<InvestorProfile[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(false);
  const [profilesError, setProfilesError] = useState<string | null>(null);
  const [statements, setStatements] = useState<StatementProfile[]>([]);
  const [statementsLoading, setStatementsLoading] = useState(false);
  const [additionalHolders, setAdditionalHolders] = useState<AdditionalHolderProfile[]>([]);
  const [additionalHoldersLoading, setAdditionalHoldersLoading] = useState(false);
  const [altOrders, setAltOrders] = useState<AltOrderProfile[]>([]);
  const [altOrdersLoading, setAltOrdersLoading] = useState(false);
  const [accreditations, setAccreditations] = useState<AccreditationProfile[]>([]);
  const [accreditationsLoading, setAccreditationsLoading] = useState(false);

  // Redirect to dashboard if clientId is missing or undefined
  useEffect(() => {
    if (!clientId || clientId === "undefined") {
      showToast("Invalid client ID. Redirecting to dashboard.", "error");
      navigate("/app", { replace: true });
      return;
    }
  }, [clientId, navigate, showToast]);

  useEffect(() => {
    if (clientId && clientId !== "undefined") {
      getClient(clientId).then((res) => setClient(res.data)).catch(() => {});
    }
  }, [clientId]);

  const fetchProfiles = useCallback(async () => {
    if (!clientId) return;
    try {
      setProfilesLoading(true);
      setProfilesError(null);
      const resp = await getProfilesByUser(undefined, { page: 1, limit: 10 }, clientId);
      setProfiles(resp.profiles || []);
    } catch (err: any) {
      setProfilesError(err.message || "Unable to load forms");
    } finally {
      setProfilesLoading(false);
    }
  }, [clientId]);

  const fetchStatements = useCallback(async () => {
    if (!clientId) return;
    try {
      setStatementsLoading(true);
      const resp = await getStatements({ page: 1, limit: 10, clientId });
      setStatements(resp.statements || []);
    } catch (err: any) {
      console.error("Error fetching statements:", err);
      setStatements([]);
    } finally {
      setStatementsLoading(false);
    }
  }, [clientId]);

  const fetchAdditionalHolders = useCallback(async () => {
    if (!clientId) return;
    try {
      setAdditionalHoldersLoading(true);
      const resp = await getAdditionalHolders({ page: 1, limit: 10, clientId });
      setAdditionalHolders(resp.profiles || []);
    } catch (err: any) {
      console.error("Error fetching additional holders:", err);
      setAdditionalHolders([]);
    } finally {
      setAdditionalHoldersLoading(false);
    }
  }, [clientId]);

  const fetchAltOrders = useCallback(async () => {
    if (!clientId) return;
    try {
      setAltOrdersLoading(true);
      const resp = await getAltOrders({ page: 1, limit: 10, clientId });
      setAltOrders(resp.profiles || []);
    } catch (err: any) {
      console.error("Error fetching alt orders:", err);
      setAltOrders([]);
    } finally {
      setAltOrdersLoading(false);
    }
  }, [clientId]);

  const fetchAccreditations = useCallback(async () => {
    if (!clientId) return;
    try {
      setAccreditationsLoading(true);
      const resp = await getAccreditations({ page: 1, limit: 10, clientId });
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

  const handleSelectProfile = (profileId: string) => {
    if (!clientId || clientId === "undefined") return;
    navigate(`/app/clients/${clientId}/forms/profile/${profileId}`, { replace: true });
  };

  const handleStartNew = () => {
    if (!clientId || clientId === "undefined") return;
    if (profiles.length > 0 && profiles[0].id) {
      navigate(`/app/clients/${clientId}/forms/profile/${profiles[0].id}`, { replace: true });
    } else {
      navigate(`/app/clients/${clientId}/forms/profile/new`, { replace: true });
    }
  };

  const handleStartNewStatement = () => {
    if (!clientId || clientId === "undefined") return;
    const draftStatement = statements.find(s => s.status === "draft");
    if (draftStatement && draftStatement.id) {
      navigate(`/app/clients/${clientId}/forms/statement/${draftStatement.id}`, { replace: true });
    } else {
      navigate(`/app/clients/${clientId}/forms/statement/new`, { replace: true });
    }
  };

  const handleStartNewAltOrder = () => {
    if (!clientId || clientId === "undefined") return;
    const draftAltOrder = altOrders.find(o => o.status === "draft");
    if (draftAltOrder && draftAltOrder.id) {
      navigate(`/app/clients/${clientId}/forms/alt-order/${draftAltOrder.id}`, { replace: true });
    } else {
      navigate(`/app/clients/${clientId}/forms/alt-order/new`, { replace: true });
    }
  };

  const handleStartNewAdditionalHolder = () => {
    if (!clientId || clientId === "undefined") return;
    const draftAdditionalHolder = additionalHolders.find(h => h.status === "draft");
    if (draftAdditionalHolder && draftAdditionalHolder.id) {
      navigate(`/app/clients/${clientId}/forms/additional-holder/${draftAdditionalHolder.id}`, { replace: true });
    } else {
      navigate(`/app/clients/${clientId}/forms/additional-holder/new`, { replace: true });
    }
  };

  const handleStartNewAccreditation = () => {
    if (!clientId || clientId === "undefined") return;
    const draftAccreditation = accreditations.find(a => a.status === "draft");
    if (draftAccreditation && draftAccreditation.id) {
      navigate(`/app/clients/${clientId}/forms/506c/${draftAccreditation.id}`, { replace: true });
    } else {
      navigate(`/app/clients/${clientId}/forms/506c/new`, { replace: true });
    }
  };

  const handleBackToDashboard = () => {
    navigate("/app", { replace: true });
  };

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

  return (
    <div className="space-y-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <button
          onClick={handleBackToDashboard}
          className="text-[var(--primary)] hover:underline"
        >
          Dashboard
        </button>
        <span className="text-[var(--muted)]">/</span>
        <span className="text-[var(--muted)]">{client?.name || "Client"}</span>
        <span className="text-[var(--muted)]">/</span>
        <span className="text-[var(--fg)]">Forms</span>
      </div>

      <div className="hub-hero">
        <div className="hub-kicker">Client Onboarding</div>
        <h1 className="hub-title">Complete forms for {client?.name || "this client"}</h1>
        <p className="hub-sub">Fill out all required forms. You can save and continue anytime.</p>
      </div>

      <div className="hub-grid">
        <div className="hub-card flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedForms.has("investorProfile")}
                  onChange={() => onToggleFormSelection?.("investorProfile")}
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
                  onChange={() => onToggleFormSelection?.("statement")}
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
                  onChange={() => onToggleFormSelection?.("additionalHolder")}
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
                  onChange={() => onToggleFormSelection?.("altOrder")}
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
                  onChange={() => onToggleFormSelection?.("accreditation")}
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
    </div>
  );
}



