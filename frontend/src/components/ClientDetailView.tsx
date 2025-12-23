import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getClient, getClientAnalytics, type Client, type ClientAnalytics } from "../api";
import { useToast } from "./Toast";

export default function ClientDetailView() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [client, setClient] = useState<Client | null>(null);
  const [analytics, setAnalytics] = useState<ClientAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  // Extract clientId from URL pathname
  const clientIdMatch = location.pathname.match(/\/clients\/([^/]+)/);
  const clientId = clientIdMatch && clientIdMatch[1] !== "undefined" ? clientIdMatch[1] : null;

  // Use ref to store showToast to avoid dependency issues
  const showToastRef = useRef(showToast);
  useEffect(() => {
    showToastRef.current = showToast;
  }, [showToast]);

  useEffect(() => {
    if (!clientId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [clientData, analyticsData] = await Promise.all([
          getClient(clientId),
          getClientAnalytics(clientId),
        ]);
        setClient(clientData?.data || null);
        setAnalytics(analyticsData?.data || null);
      } catch (error: any) {
        console.error("Error fetching client data:", error);
        showToastRef.current(error.message || "Failed to load client data", "error");
        setClient(null);
        setAnalytics(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clientId]);

  if (loading) {
    return (
      <div className="text-center py-12 text-[var(--muted)]">Loading client details...</div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12 text-[var(--muted)]">Client not found</div>
    );
  }

  // If analytics failed but client exists, show client with default analytics
  if (!analytics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate("/app")}
              className="text-[var(--primary)] text-sm font-semibold hover:underline mb-2"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-2xl font-semibold text-[var(--fg)]">{client.name}</h1>
            {client.email && (
              <p className="text-sm text-[var(--muted)] mt-1">{client.email}</p>
            )}
          </div>
        </div>
        <div className="text-center py-12 text-[var(--muted)]">
          Unable to load analytics. Please try again.
        </div>
      </div>
    );
  }

  const forms = [
    {
      name: "Investor Profile",
      status: analytics.forms.investorProfile?.status || "not_started",
      id: analytics.forms.investorProfile?.id,
      route: "profile",
    },
    {
      name: "Statement of Financial Condition",
      status: analytics.forms.statement?.status || "not_started",
      id: analytics.forms.statement?.id,
      route: "statement",
    },
    {
      name: "Additional Holder",
      status: analytics.forms.additionalHolder?.status || "not_started",
      id: analytics.forms.additionalHolder?.id,
      route: "additional-holder",
    },
    {
      name: "Alternative Investment Order",
      status: analytics.forms.altOrder?.status || "not_started",
      id: analytics.forms.altOrder?.id,
      route: "alt-order",
    },
    {
      name: "Accredited Investor Verification (506c)",
      status: analytics.forms.accreditation?.status || "not_started",
      id: analytics.forms.accreditation?.id,
      route: "506c",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
      case "approved":
        return "bg-green-100 text-green-700 border-green-200";
      case "draft":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "submitted":
        return "Submitted";
      case "approved":
        return "Approved";
      case "draft":
        return "In Progress";
      case "rejected":
        return "Rejected";
      default:
        return "Not Started";
    }
  };

  const completedForms = forms.filter(f => f.status === "submitted" || f.status === "approved").length;
  const inProgressForms = forms.filter(f => f.status === "draft").length;
  const notStartedForms = forms.filter(f => f.status === "not_started").length;

  // Get last updated date from the most recently updated form
  const lastUpdated = forms
    .map(f => {
      if (f.status === "draft" || f.status === "submitted") {
        // We'd need to get updatedAt from analytics, but for now use client updatedAt
        return new Date(client.updatedAt);
      }
      return null;
    })
    .filter(Boolean)
    .sort((a, b) => (b as Date).getTime() - (a as Date).getTime())[0] || new Date(client.updatedAt);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <button
            onClick={() => navigate("/app")}
            className="text-[var(--primary)] text-sm font-semibold hover:underline mb-3 inline-block"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-semibold text-[var(--fg)] mb-2">{client.name}</h1>
          <div className="space-y-1">
            {client.email && (
              <p className="text-sm text-[var(--muted)] flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {client.email}
              </p>
            )}
            {client.phone && (
              <p className="text-sm text-[var(--muted)] flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {client.phone}
              </p>
            )}
            <p className="text-xs text-[var(--muted)] mt-2">
              Created {new Date(client.createdAt || client.updatedAt).toLocaleDateString()} • 
              Last updated {new Date(client.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            if (!clientId || clientId === "undefined") {
              showToast("Invalid client ID", "error");
              navigate("/app", { replace: true });
              return;
            }
            navigate(`/app/clients/${clientId}/forms`);
          }}
          className="h-11 px-6 rounded-full bg-[var(--primary)] text-white text-sm font-semibold hover:bg-[var(--primary-dark)] transition shadow-lg hover:shadow-xl"
        >
          Continue Onboarding
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="hub-card">
          <div className="text-sm text-[var(--muted)] mb-1">Completion Rate</div>
          <div className="text-3xl font-semibold text-[var(--fg)]">
            {Math.round(analytics.completionStatus.percentage)}%
          </div>
        </div>
        <div className="hub-card">
          <div className="text-sm text-[var(--muted)] mb-1">Completed</div>
          <div className="text-3xl font-semibold text-green-600">{completedForms}</div>
          <div className="text-xs text-[var(--muted)] mt-1">of {forms.length} forms</div>
        </div>
        <div className="hub-card">
          <div className="text-sm text-[var(--muted)] mb-1">In Progress</div>
          <div className="text-3xl font-semibold text-yellow-600">{inProgressForms}</div>
        </div>
        <div className="hub-card">
          <div className="text-sm text-[var(--muted)] mb-1">Not Started</div>
          <div className="text-3xl font-semibold text-gray-400">{notStartedForms}</div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="hub-card">
        <div className="mb-2">
          <div className="flex items-center justify-between mb-3">
            <span className="text-base font-semibold text-[var(--fg)]">Onboarding Progress</span>
            <span className="text-sm text-[var(--muted)]">
              {analytics.completionStatus.completed} of {analytics.completionStatus.total} forms completed
            </span>
          </div>
          <div className="w-full bg-[rgba(11,92,255,0.08)] rounded-full h-3">
            <div
              className="bg-[var(--primary)] h-3 rounded-full transition-all"
              style={{ width: `${analytics.completionStatus.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Forms Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[var(--fg)]">Forms Overview</h2>
          <button
            onClick={() => {
              if (!clientId || clientId === "undefined") {
                showToast("Invalid client ID", "error");
                navigate("/app", { replace: true });
                return;
              }
              navigate(`/app/clients/${clientId}/forms`);
            }}
            className="text-sm text-[var(--primary)] hover:underline font-medium"
          >
            View All Forms →
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {forms.map((form) => (
            <div
              key={form.name}
              className="hub-card"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-[var(--fg)] mb-2">{form.name}</h3>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                        form.status
                      )}`}
                    >
                      {getStatusLabel(form.status)}
                    </span>
                    {form.status === "draft" && (
                      <span className="text-xs text-[var(--muted)]">
                        • Draft saved
                      </span>
                    )}
                    {(form.status === "submitted" || form.status === "approved") && (
                      <span className="text-xs text-[var(--muted)]">
                        • Completed
                      </span>
                    )}
                  </div>
                </div>
                {form.id && (
                  <button
                    onClick={() => {
                      if (!clientId || clientId === "undefined" || !form.id) return;
                      navigate(`/app/clients/${clientId}/forms/${form.route}/${form.id}`);
                    }}
                    className="text-xs text-[var(--primary)] hover:underline font-medium"
                  >
                    View →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="hub-card">
        <h3 className="text-base font-semibold text-[var(--fg)] mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              if (!clientId || clientId === "undefined") {
                showToast("Invalid client ID", "error");
                navigate("/app", { replace: true });
                return;
              }
              navigate(`/app/clients/${clientId}/forms`);
            }}
            className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary-dark)] transition"
          >
            Continue Onboarding
          </button>
          {inProgressForms > 0 && (
            <button
              onClick={() => {
                if (!clientId || clientId === "undefined") return;
                const inProgressForm = forms.find(f => f.status === "draft");
                if (inProgressForm?.id) {
                  navigate(`/app/clients/${clientId}/forms/${inProgressForm.route}/${inProgressForm.id}`);
                } else {
                  navigate(`/app/clients/${clientId}/forms`);
                }
              }}
              className="px-4 py-2 rounded-lg border border-[rgba(11,92,255,0.12)] text-[var(--fg)] text-sm font-medium hover:bg-[rgba(11,92,255,0.06)] transition"
            >
              Resume In Progress ({inProgressForms})
            </button>
          )}
          {notStartedForms > 0 && (
            <button
              onClick={() => {
                if (!clientId || clientId === "undefined") return;
                const notStartedForm = forms.find(f => f.status === "not_started");
                if (notStartedForm) {
                  navigate(`/app/clients/${clientId}/forms/${notStartedForm.route}/new`);
                } else {
                  navigate(`/app/clients/${clientId}/forms`);
                }
              }}
              className="px-4 py-2 rounded-lg border border-[rgba(11,92,255,0.12)] text-[var(--fg)] text-sm font-medium hover:bg-[rgba(11,92,255,0.06)] transition"
            >
              Start Next Form ({notStartedForms})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}



