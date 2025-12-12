export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: "advisor" | "client" | "admin";
};

type AuthResponse = {
  token: string;
  user: AuthUser;
};

import { handleApiError } from "./utils/apiInterceptor";

const headers = { "Content-Type": "application/json" };

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    // Handle 401 errors globally via interceptor
    if (res.status === 401) {
      await handleApiError(res);
    }
    
    const data = await res.json().catch(() => ({}));
    let errorMessage = "Request failed";
    if (data.error) {
      if (typeof data.error === "string") {
        errorMessage = data.error;
      } else if (Array.isArray(data.error)) {
        // Handle Zod validation errors - show field path and message
        errorMessage = data.error.map((err: any) => {
          const path = err.path?.join(".") || "unknown";
          return `${path}: ${err.message || "validation error"}`;
        }).join(", ");
      } else if (data.error.message) {
        errorMessage = data.error.message;
      }
    }
    throw new Error(errorMessage);
  }
  
  const data = await res.json();
  // Backend returns { success: true, data: ... } format
  // For auth endpoints, return the data directly
  // For other endpoints, return the full response (which includes data field)
  return data;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers,
    body: JSON.stringify({ email, password }),
  });
  return handleResponse<AuthResponse>(res);
}

export async function register(
  email: string,
  password: string,
  fullName: string,
  role: AuthUser["role"]
): Promise<AuthResponse> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers,
    body: JSON.stringify({ email, password, fullName, role }),
  });
  return handleResponse<AuthResponse>(res);
}

export async function fetchMe(token?: string) {
  const tokenToUse = token || getToken();
  if (!tokenToUse) {
    throw new Error("No token available");
  }
  const res = await fetch("/api/auth/me", {
    headers: { Authorization: `Bearer ${tokenToUse}` },
  });
  return handleResponse(res);
}

export async function refreshToken(): Promise<AuthResponse> {
  const token = getToken();
  if (!token) {
    throw new Error("No token available");
  }
  const res = await fetch("/api/auth/refresh", {
    method: "POST",
    headers: getAuthHeaders(),
  });
  return handleResponse<AuthResponse>(res);
}

// Get authentication token from localStorage
function getToken(): string | null {
  return localStorage.getItem("auth_token");
}

// Create headers with authentication
function getAuthHeaders(): HeadersInit {
  const token = getToken();
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

// Investor Profile Types
export interface InvestorProfile {
  id: string;
  userId: string;
  status: "draft" | "submitted" | "approved" | "rejected";
  lastCompletedStep?: number;
  stepCompletionStatus?: Record<string, { completed?: boolean; updatedAt?: string }>;
  rrName?: string;
  rrNo?: string;
  customerNames?: string;
  accountNo?: string;
  retirementAccount: boolean;
  retailAccount: boolean;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
}

export interface ProfileListResponse {
  profiles: InvestorProfile[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Investor Profile API Functions
export async function createProfile(step1Data: any): Promise<{ data: InvestorProfile }> {
  const res = await fetch("/api/investor-profiles", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(step1Data),
  });
  const response = await handleResponse<{ success: boolean; data: InvestorProfile }>(res);
  return { data: response.data };
}

export async function getProfile(profileId: string): Promise<{ data: InvestorProfile }> {
  const res = await fetch(`/api/investor-profiles/${profileId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const response = await handleResponse<{ success: boolean; data: InvestorProfile }>(res);
  return { data: response.data };
}

export async function updateProfile(
  profileId: string,
  updates: any
): Promise<{ data: InvestorProfile }> {
  const res = await fetch(`/api/investor-profiles/${profileId}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });
  const response = await handleResponse<{ success: boolean; data: InvestorProfile }>(res);
  return { data: response.data };
}

export async function updateStep(
  profileId: string,
  stepNumber: number,
  stepData: any
): Promise<{ data: InvestorProfile }> {
  const res = await fetch(`/api/investor-profiles/${profileId}/step${stepNumber}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(stepData),
  });
  const response = await handleResponse<{ success: boolean; data: InvestorProfile }>(res);
  return { data: response.data };
}

export async function submitProfile(profileId: string): Promise<{ data: InvestorProfile }> {
  const res = await fetch(`/api/investor-profiles/${profileId}/submit`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  const response = await handleResponse<{ success: boolean; data: InvestorProfile }>(res);
  return { data: response.data };
}

export async function getProfilesByUser(
  filters?: { status?: string; search?: string },
  pagination?: { page: number; limit: number }
): Promise<ProfileListResponse> {
  const params = new URLSearchParams();
  if (filters?.status) params.append("status", filters.status);
  if (filters?.search) params.append("search", filters.search);
  if (pagination) {
    params.append("page", pagination.page.toString());
    params.append("limit", pagination.limit.toString());
  }

  const res = await fetch(`/api/investor-profiles?${params.toString()}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const response = await handleResponse<{ success: boolean; data: InvestorProfile[]; meta?: { pagination?: any } }>(res);
  return {
    profiles: Array.isArray(response.data) ? response.data : [],
    pagination: response.meta?.pagination,
  };
}

export async function getAccountHolders(profileId: string): Promise<{ data: any[] }> {
  const res = await fetch(`/api/investor-profiles/${profileId}/account-holders`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse<{ data: any[] }>(res);
}

export async function updateAccountHolder(
  profileId: string,
  holderId: string,
  data: any
): Promise<{ data: any }> {
  const res = await fetch(`/api/investor-profiles/${profileId}/account-holders/${holderId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<{ data: any }>(res);
}

export async function createOrUpdateSignature(
  profileId: string,
  signatureData: any
): Promise<{ data: any }> {
  const res = await fetch(`/api/investor-profiles/${profileId}/signatures`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(signatureData),
  });
  return handleResponse<{ data: any }>(res);
}

export async function generatePdf(profileId: string): Promise<{ data: { message: string; profileId: string } }> {
  const res = await fetch(`/api/investor-profiles/${profileId}/generate-pdf`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  const response = await handleResponse<{ success: boolean; data: { message: string; profileId: string } }>(res);
  return { data: response.data };
}

