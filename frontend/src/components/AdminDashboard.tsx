import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getClients, getDashboardAnalytics, type Client, type DashboardAnalytics as DashboardAnalyticsType } from "../api";
import { useToast } from "./Toast";

interface AdminDashboardProps {
  onCreateClient: () => void;
  onClientClick: (clientId: string) => void;
}

export default function AdminDashboard({ onCreateClient, onClientClick }: AdminDashboardProps) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [analytics, setAnalytics] = useState<DashboardAnalyticsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Use ref to store showToast to avoid dependency issues
  const showToastRef = useRef(showToast);
  useEffect(() => {
    showToastRef.current = showToast;
  }, [showToast]);

  const fetchData = useCallback(async (search?: string) => {
    try {
      setLoading(true);
      const [clientsData, analyticsData] = await Promise.all([
        getClients({ page: 1, limit: 100, search: search || undefined }),
        getDashboardAnalytics(),
      ]);
      setClients(clientsData?.clients || []);
      setAnalytics(analyticsData?.data || null);
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      showToastRef.current(error.message || "Failed to load dashboard data", "error");
      // Set empty arrays on error so UI doesn't stay in loading state
      setClients([]);
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchData(searchQuery);
    }, 300); // 300ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, fetchData]);

  const getFormStatus = (client: Client) => {
    const forms = {
      investor: client.investorProfiles?.[0]?.status || "not_started",
      statement: client.statementProfiles?.[0]?.status || "not_started",
      additionalHolder: client.additionalHolderProfiles?.[0]?.status || "not_started",
      altOrder: client.altOrderProfiles?.[0]?.status || "not_started",
      accreditation: client.accreditationProfiles?.[0]?.status || "not_started",
    };

    const completed = Object.values(forms).filter((s) => s === "submitted" || s === "approved").length;
    const inProgress = Object.values(forms).filter((s) => s === "draft").length;

    return { completed, inProgress, total: 5 };
  };

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

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="hub-kicker">Client Management</div>
          <h1 className="hub-title">Manage Your Clients</h1>
          <p className="hub-sub">View all clients, track onboarding progress, and manage forms.</p>
        </div>
        <button
          onClick={onCreateClient}
          className="h-11 px-5 rounded-full bg-[var(--primary)] text-white text-sm font-semibold hover:bg-[var(--primary-dark)] transition"
        >
          + New Client
        </button>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="hub-card">
            <div className="text-sm text-[var(--muted)] mb-1">Total Clients</div>
            <div className="text-3xl font-semibold text-[var(--fg)]">{analytics.totalClients}</div>
          </div>
          <div className="hub-card">
            <div className="text-sm text-[var(--muted)] mb-1">Forms Completed</div>
            <div className="text-3xl font-semibold text-[var(--fg)]">{analytics.formsCompleted.total}</div>
          </div>
          <div className="hub-card">
            <div className="text-sm text-[var(--muted)] mb-1">Forms In Progress</div>
            <div className="text-3xl font-semibold text-[var(--fg)]">{analytics.formsInProgress.total}</div>
          </div>
          <div className="hub-card">
            <div className="text-sm text-[var(--muted)] mb-1">Avg Completion Rate</div>
            <div className="text-3xl font-semibold text-[var(--fg)]">
              {Math.round(
                (Object.values(analytics.completionRates).reduce((a, b) => a + b, 0) /
                  Object.keys(analytics.completionRates).length) *
                  100
              ) / 100}
              %
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="hub-card">
        <input
          type="text"
          placeholder="Search clients by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-[rgba(11,92,255,0.12)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        />
      </div>

      {/* Client List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-[var(--fg)]">All Clients</h2>
        {loading ? (
          <div className="text-center py-12 text-[var(--muted)]">Loading clients...</div>
        ) : clients.length === 0 ? (
          <div className="hub-card text-center py-12">
            <p className="text-[var(--muted)] mb-4">No clients found</p>
            <button
              onClick={onCreateClient}
              className="h-11 px-5 rounded-full bg-[var(--primary)] text-white text-sm font-semibold hover:bg-[var(--primary-dark)] transition"
            >
              Create Your First Client
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {clients.map((client) => {
              const status = getFormStatus(client);
              return (
                <div
                  key={client.id}
                  className="hub-card cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => onClientClick(client.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-[var(--fg)]">{client.name}</h3>
                        {client.email && (
                          <span className="text-sm text-[var(--muted)]">• {client.email}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-[var(--muted)]">
                        <span>
                          {status.completed}/{status.total} forms completed
                        </span>
                        {status.inProgress > 0 && (
                          <span className="text-yellow-600">{status.inProgress} in progress</span>
                        )}
                        <span>Updated {new Date(client.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onClientClick(client.id);
                      }}
                      className="h-10 px-4 rounded-full bg-[var(--primary)] text-white text-sm font-semibold hover:bg-[var(--primary-dark)] transition"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      {analytics && analytics.recentActivity && analytics.recentActivity.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-[var(--fg)]">Recent Activity</h2>
          <div className="hub-card">
            <div className="space-y-3">
              {analytics.recentActivity.slice(0, 10).map((activity: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-[rgba(11,92,255,0.08)] last:border-0">
                  <div>
                    <span className="text-sm font-medium text-[var(--fg)]">
                      {activity.client?.name || "Unknown Client"}
                    </span>
                    <span className="text-sm text-[var(--muted)] ml-2">
                      • {activity.formType} • {activity.status}
                    </span>
                  </div>
                  <span className="text-xs text-[var(--muted)]">
                    {new Date(activity.updatedAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



