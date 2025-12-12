import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getProfilesByUser } from "../api";
import type { InvestorProfile } from "../api";
import { Button } from "./ui/button";

interface ProfileListProps {
  onSelectProfile: (profileId: string) => void;
  onCreateNew: () => void;
}

export function ProfileList({ onSelectProfile, onCreateNew }: ProfileListProps) {
  const { isAuthenticated } = useAuth();
  const [profiles, setProfiles] = useState<InvestorProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "draft" | "submitted" | "approved" | "rejected">("all");

  useEffect(() => {
    if (isAuthenticated) {
      loadProfiles();
    }
  }, [isAuthenticated, filter]);

  const loadProfiles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getProfilesByUser(
        filter !== "all" ? { status: filter } : undefined,
        { page: 1, limit: 50 }
      );
      setProfiles(response.profiles || []);
    } catch (err: any) {
      setError(err.message || "Failed to load profiles");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "submitted":
        return "bg-blue-100 text-blue-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 mb-2">My Profiles</h1>
            <p className="text-slate-600">Manage your investor profiles</p>
          </div>
          <Button onClick={onCreateNew} className="bg-blue-600 hover:bg-blue-700">
            Create New Profile
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2">
          {(["all", "draft", "submitted", "approved", "rejected"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="text-slate-600">Loading profiles...</div>
          </div>
        )}

        {/* Profiles List */}
        {!isLoading && profiles.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-slate-600 mb-4">No profiles found</p>
            <Button onClick={onCreateNew} className="bg-blue-600 hover:bg-blue-700">
              Create Your First Profile
            </Button>
          </div>
        )}

        {!isLoading && profiles.length > 0 && (
          <div className="grid gap-4">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onSelectProfile(profile.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-slate-900">
                        {profile.customerNames || "Unnamed Profile"}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          profile.status
                        )}`}
                      >
                        {profile.status}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600 space-y-1">
                      {profile.accountNo && (
                        <p>
                          <span className="font-medium">Account No:</span> {profile.accountNo}
                        </p>
                      )}
                      {profile.rrName && (
                        <p>
                          <span className="font-medium">RR Name:</span> {profile.rrName}
                        </p>
                      )}
                      <p>
                        <span className="font-medium">Created:</span> {formatDate(profile.createdAt)}
                      </p>
                      {profile.submittedAt && (
                        <p>
                          <span className="font-medium">Submitted:</span>{" "}
                          {formatDate(profile.submittedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProfile(profile.id);
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {profile.status === "draft" ? "Continue Editing" : "View"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

