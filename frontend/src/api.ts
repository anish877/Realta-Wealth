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
import { getApiUrl } from "./config/api";

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
      const errObj = data.error;

      // New-style backend errors: { code, message, details?, field? }
      if (errObj.details) {
        const details = errObj.details;
        if (Array.isArray(details) && details.length > 0) {
          // Zod-style details (array of { path, message })
          if (typeof details[0] === "object" && details[0] !== null && ("path" in details[0] || "message" in details[0])) {
            errorMessage = details
              .map((err: any) => {
                const path = Array.isArray(err.path) ? err.path.join(".") : err.path || err.field || "unknown";
                return `${path}: ${err.message || "validation error"}`;
              })
              .join(", ");
          } else if (details.every((d: any) => typeof d === "string")) {
            // Simple list of validation messages
            errorMessage = details.join(", ");
          }
        }
      }

      // Legacy / fallback shapes
      if (typeof errObj === "string") {
        errorMessage = errObj;
      } else if (Array.isArray(errObj)) {
        // Handle Zod validation errors - show field path and message
        errorMessage = errObj
          .map((err: any) => {
            const path = err.path?.join(".") || "unknown";
            return `${path}: ${err.message || "validation error"}`;
          })
          .join(", ");
      } else if (errObj.message) {
        // If we didn't derive a better message from details, use the top-level message
        if (errorMessage === "Request failed") {
          errorMessage = errObj.message;
        }
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
  const res = await fetch(getApiUrl("/api/auth/login"), {
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
  const res = await fetch(getApiUrl("/api/auth/register"), {
    method: "POST",
    headers,
    body: JSON.stringify({ email, password, fullName, role }),
  });
  return handleResponse<AuthResponse>(res);
}

export async function fetchMe(token?: string): Promise<AuthResponse> {
  const tokenToUse = token || getToken();
  if (!tokenToUse) {
    throw new Error("No token available");
  }
  const res = await fetch(getApiUrl("/api/auth/me"), {
    headers: { Authorization: `Bearer ${tokenToUse}` },
  });
  return handleResponse<AuthResponse>(res);
}

export async function refreshToken(): Promise<AuthResponse> {
  const token = getToken();
  if (!token) {
    throw new Error("No token available");
  }
  const res = await fetch(getApiUrl("/api/auth/refresh"), {
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
export async function createProfile(step1Data: any, clientId?: string): Promise<{ data: InvestorProfile }> {
  const body = clientId ? { ...step1Data, clientId } : step1Data;
  const res = await fetch(getApiUrl("/api/investor-profiles"), {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  const response = await handleResponse<{ success: boolean; data: InvestorProfile }>(res);
  return { data: response.data };
}

export async function getProfile(profileId: string): Promise<{ data: InvestorProfile }> {
  const res = await fetch(getApiUrl(`/api/investor-profiles/${profileId}`), {
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
  const res = await fetch(getApiUrl(`/api/investor-profiles/${profileId}`), {
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
  const res = await fetch(getApiUrl(`/api/investor-profiles/${profileId}/step${stepNumber}`), {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(stepData),
  });
  const response = await handleResponse<{ success: boolean; data: InvestorProfile }>(res);
  return { data: response.data };
}

export async function submitProfile(profileId: string): Promise<{ data: InvestorProfile }> {
  const res = await fetch(getApiUrl(`/api/investor-profiles/${profileId}/submit`), {
    method: "POST",
    headers: getAuthHeaders(),
  });
  const response = await handleResponse<{ success: boolean; data: InvestorProfile }>(res);
  return { data: response.data };
}

export async function getProfilesByUser(
  filters?: { status?: string; search?: string },
  pagination?: { page: number; limit: number },
  clientId?: string
): Promise<ProfileListResponse> {
  const params = new URLSearchParams();
  if (filters?.status) params.append("status", filters.status);
  if (filters?.search) params.append("search", filters.search);
  if (clientId) params.append("clientId", clientId);
  if (pagination) {
    params.append("page", pagination.page.toString());
    params.append("limit", pagination.limit.toString());
  }

  const res = await fetch(getApiUrl(`/api/investor-profiles?${params.toString()}`), {
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
  const res = await fetch(getApiUrl(`/api/investor-profiles/${profileId}/account-holders`), {
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
  const res = await fetch(getApiUrl(`/api/investor-profiles/${profileId}/account-holders/${holderId}`), {
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
  const res = await fetch(getApiUrl(`/api/investor-profiles/${profileId}/signatures`), {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(signatureData),
  });
  return handleResponse<{ data: any }>(res);
}

export async function generatePdf(profileId: string): Promise<{ data: { message: string; profileId: string } }> {
  const res = await fetch(getApiUrl(`/api/investor-profiles/${profileId}/generate-pdf`), {
    method: "POST",
    headers: getAuthHeaders(),
  });
  const response = await handleResponse<{ success: boolean; data: { message: string; profileId: string } }>(res);
  return { data: response.data };
}

// ============================================
// Statement of Financial Condition API
// ============================================

export interface StatementProfile {
  id: string;
  userId: string;
  status: "draft" | "submitted" | "approved" | "rejected";
  lastCompletedPage?: number;
  pageCompletionStatus?: Record<string, { completed?: boolean; updatedAt?: string }>;
  rrName?: string;
  rrNo?: string;
  customerNames?: string;
  notesPage1?: string;
  additionalNotes?: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
}

export async function createStatement(step1Data: any, clientId?: string): Promise<{ data: StatementProfile }> {
  const body = clientId ? { ...step1Data, clientId } : step1Data;
  const res = await fetch(getApiUrl("/api/statements"), {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  const response = await handleResponse<{ success: boolean; data: StatementProfile }>(res);
  return { data: response.data };
}

export async function getStatements(options?: { page?: number; limit?: number; status?: string; clientId?: string }): Promise<{ statements: StatementProfile[]; pagination?: any }> {
  const params = new URLSearchParams();
  if (options?.page) params.append("page", options.page.toString());
  if (options?.limit) params.append("limit", options.limit.toString());
  if (options?.status) params.append("status", options.status);
  if (options?.clientId) params.append("clientId", options.clientId);
  
  const queryString = params.toString();
  const url = `/api/statements${queryString ? `?${queryString}` : ""}`;
  
  const res = await fetch(getApiUrl(url), {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const response = await handleResponse<{ success: boolean; data: StatementProfile[]; pagination?: any }>(res);
  return { statements: response.data || [], pagination: response.pagination };
}

export async function getStatement(statementId: string): Promise<{ data: StatementProfile }> {
  const res = await fetch(getApiUrl(`/api/statements/${statementId}`), {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const response = await handleResponse<{ success: boolean; data: StatementProfile }>(res);
  return { data: response.data };
}

export async function updateStatementStep(
  statementId: string,
  stepNumber: number,
  stepData: any
): Promise<{ data: StatementProfile }> {
  const res = await fetch(getApiUrl(`/api/statements/${statementId}/step${stepNumber}`), {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(stepData),
  });
  const response = await handleResponse<{ success: boolean; data: StatementProfile }>(res);
  return { data: response.data };
}

export async function submitStatement(statementId: string): Promise<{ data: StatementProfile }> {
  const res = await fetch(getApiUrl(`/api/statements/${statementId}/submit`), {
    method: "POST",
    headers: getAuthHeaders(),
  });
  const response = await handleResponse<{ success: boolean; data: StatementProfile }>(res);
  return { data: response.data };
}

export async function getStatementProgress(statementId: string): Promise<{ data: any }> {
  const res = await fetch(getApiUrl(`/api/statements/${statementId}/progress`), {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse<{ success: boolean; data: any }>(res);
}

export async function generateStatementPdf(
  statementId: string
): Promise<{ data: { message: string; statementId: string } }> {
  const url = getApiUrl(`/api/statements/${statementId}/generate-pdf`);
  console.log('[API] generateStatementPdf called with statementId:', statementId);
  console.log('[API] Request URL:', url);
  const res = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  console.log('[API] generateStatementPdf response status:', res.status);
  const response = await handleResponse<{
    success: boolean;
    data: { message: string; statementId: string };
  }>(res);
  console.log('[API] generateStatementPdf response data:', response);
  return { data: response.data };
}

// ============================================
// Additional Holder API
// ============================================

export interface AdditionalHolderProfile {
  id: string;
  userId: string;
  status: "draft" | "submitted" | "approved" | "rejected";
  lastCompletedPage?: number;
  pageCompletionStatus?: Record<string, { completed?: boolean; updatedAt?: string }>;
  accountRegistration?: string;
  rrName?: string;
  rrNo?: string;
  name?: string;
  personEntity?: "Person" | "Entity";
  ssn?: string;
  ein?: string;
  holderParticipantRole?: string;
  email?: string;
  dateOfBirth?: string;
  positionHeld?: string;
  primaryCitizenship?: string;
  additionalCitizenship?: string;
  gender?: "Male" | "Female";
  maritalStatus?: string[];
  employmentStatus?: string[];
  occupation?: string;
  yearsEmployed?: number;
  typeOfBusiness?: string;
  employerName?: string;
  overallInvestmentKnowledge?: "Limited" | "Moderate" | "Extensive" | "None";
  annualIncomeFrom?: number;
  annualIncomeTo?: number;
  netWorthFrom?: number;
  netWorthTo?: number;
  liquidNetWorthFrom?: number;
  liquidNetWorthTo?: number;
  taxBracket?: string;
  yearsOfInvestmentExperience?: number;
  employeeOfThisBrokerDealer?: "Yes" | "No";
  relatedToEmployeeAtThisBrokerDealer?: "Yes" | "No";
  employeeName?: string;
  relationship?: string;
  employeeOfAnotherBrokerDealer?: "Yes" | "No";
  brokerDealerName?: string;
  relatedToEmployeeAtAnotherBrokerDealer?: "Yes" | "No";
  brokerDealerName2?: string;
  employeeName2?: string;
  relationship2?: string;
  maintainingOtherBrokerageAccounts?: "Yes" | "No";
  withWhatFirms?: string;
  affiliatedWithExchangeOrFinra?: "Yes" | "No";
  whatIsTheAffiliation?: string;
  seniorOfficerDirectorShareholder?: "Yes" | "No";
  companyNames?: string;
  signature?: string;
  printedName?: string;
  signatureDate?: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  addresses?: Array<{
    id: string;
    addressType: "legal" | "mailing" | "employer";
    addressLine?: string;
    city?: string;
    stateProvince?: string;
    zipPostalCode?: string;
    country?: string;
  }>;
  phones?: Array<{
    id: string;
    phoneType: "home" | "business" | "mobile";
    phoneNumber?: string;
  }>;
  governmentIds?: Array<{
    id: string;
    type?: string;
    idNumber?: string;
    countryOfIssue?: string;
    dateOfIssue?: string;
    dateOfExpiration?: string;
  }>;
  investmentKnowledge?: Array<{
    id: string;
    investmentType: string;
    knowledgeLevel?: "Limited" | "Moderate" | "Extensive" | "None";
    sinceYear?: number;
  }>;
}

export async function createAdditionalHolder(step1Data: any, clientId?: string): Promise<{ data: AdditionalHolderProfile }> {
  const body = clientId ? { ...step1Data, clientId } : step1Data;
  const res = await fetch(getApiUrl("/api/additional-holders"), {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  const response = await handleResponse<{ success: boolean; data: AdditionalHolderProfile }>(res);
  return { data: response.data };
}

export async function getAdditionalHolders(options?: { page?: number; limit?: number; status?: string; clientId?: string }): Promise<{ profiles: AdditionalHolderProfile[]; pagination?: any }> {
  const params = new URLSearchParams();
  if (options?.page) params.append("page", options.page.toString());
  if (options?.limit) params.append("limit", options.limit.toString());
  if (options?.status) params.append("status", options.status);
  if (options?.clientId) params.append("clientId", options.clientId);
  
  const queryString = params.toString();
  const url = `/api/additional-holders${queryString ? `?${queryString}` : ""}`;
  
  const res = await fetch(getApiUrl(url), {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const response = await handleResponse<{ success: boolean; data: AdditionalHolderProfile[]; pagination?: any }>(res);
  return { profiles: response.data || [], pagination: response.pagination };
}

export async function getAdditionalHolder(holderId: string): Promise<{ data: AdditionalHolderProfile }> {
  const res = await fetch(getApiUrl(`/api/additional-holders/${holderId}`), {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const response = await handleResponse<{ success: boolean; data: AdditionalHolderProfile }>(res);
  return { data: response.data };
}

export async function updateAdditionalHolderStep(
  holderId: string,
  stepNumber: number,
  stepData: any
): Promise<{ data: AdditionalHolderProfile }> {
  const res = await fetch(getApiUrl(`/api/additional-holders/${holderId}/step${stepNumber}`), {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(stepData),
  });
  const response = await handleResponse<{ success: boolean; data: AdditionalHolderProfile }>(res);
  return { data: response.data };
}

export async function submitAdditionalHolder(holderId: string): Promise<{ data: AdditionalHolderProfile }> {
  const res = await fetch(getApiUrl(`/api/additional-holders/${holderId}/submit`), {
    method: "POST",
    headers: getAuthHeaders(),
  });
  const response = await handleResponse<{ success: boolean; data: AdditionalHolderProfile }>(res);
  return { data: response.data };
}

export async function generateAdditionalHolderPdf(
  holderId: string
): Promise<{ data: { message: string; holderId: string } }> {
  const res = await fetch(getApiUrl(`/api/additional-holders/${holderId}/generate-pdf`), {
    method: "POST",
    headers: getAuthHeaders(),
  });
  const response = await handleResponse<{
    success: boolean;
    data: { message: string; holderId: string };
  }>(res);
  return { data: response.data };
}

// ============================================
// Alternative Investment Order API
// ============================================

export interface AltOrderProfile {
  id: string;
  userId: string;
  status: "draft" | "submitted" | "approved" | "rejected";
  lastCompletedPage?: number;
  pageCompletionStatus?: Record<string, { completed?: boolean; updatedAt?: string }>;
  rrName?: string;
  rrNo?: string;
  customerNames?: string;
  proposedPrincipalAmount?: number;
  qualifiedAccount?: "Yes" | "No";
  qualifiedAccountCertificationText?: string;
  solicitedTrade?: "Yes" | "No";
  taxAdvantagePurchase?: "Yes" | "No";
  custodian?: string;
  nameOfProduct?: string;
  sponsorIssuer?: string;
  dateOfPpm?: string;
  datePpmSent?: string;
  existingIlliquidAltPositions?: number;
  existingIlliquidAltConcentration?: number;
  existingSemiLiquidAltPositions?: number;
  existingSemiLiquidAltConcentration?: number;
  existingTaxAdvantageAltPositions?: number;
  existingTaxAdvantageAltConcentration?: number;
  totalNetWorth?: number;
  liquidNetWorth?: number;
  totalConcentration?: number;
  accountOwnerSignature?: string;
  accountOwnerPrintedName?: string;
  accountOwnerDate?: string;
  jointAccountOwnerSignature?: string;
  jointAccountOwnerPrintedName?: string;
  jointAccountOwnerDate?: string;
  financialProfessionalSignature?: string;
  financialProfessionalPrintedName?: string;
  financialProfessionalDate?: string;
  registeredPrincipalSignature?: string;
  registeredPrincipalPrintedName?: string;
  registeredPrincipalDate?: string;
  notes?: string;
  regBiDelivery?: boolean;
  stateRegistration?: boolean;
  aiInsight?: boolean;
  statementOfFinancialCondition?: boolean;
  suitabilityReceived?: boolean;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
}

export async function createAltOrder(orderData: any, clientId?: string): Promise<{ data: AltOrderProfile }> {
  const body = clientId ? { ...orderData, clientId } : orderData;
  const res = await fetch(getApiUrl("/api/alt-orders"), {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  const response = await handleResponse<{ success: boolean; data: AltOrderProfile }>(res);
  return { data: response.data };
}

export async function getAltOrders(options?: { page?: number; limit?: number; status?: string; clientId?: string }): Promise<{ profiles: AltOrderProfile[]; pagination?: any }> {
  const params = new URLSearchParams();
  if (options?.page) params.append("page", options.page.toString());
  if (options?.limit) params.append("limit", options.limit.toString());
  if (options?.status) params.append("status", options.status);
  if (options?.clientId) params.append("clientId", options.clientId);
  
  const queryString = params.toString();
  const url = `/api/alt-orders${queryString ? `?${queryString}` : ""}`;
  
  const res = await fetch(getApiUrl(url), {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const response = await handleResponse<{ success: boolean; data: AltOrderProfile[]; pagination?: any }>(res);
  return { profiles: response.data || [], pagination: response.pagination };
}

export async function getAltOrder(orderId: string): Promise<{ data: AltOrderProfile }> {
  const res = await fetch(getApiUrl(`/api/alt-orders/${orderId}`), {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const response = await handleResponse<{ success: boolean; data: AltOrderProfile }>(res);
  return { data: response.data };
}

export async function updateAltOrder(
  orderId: string,
  orderData: any
): Promise<{ data: AltOrderProfile }> {
  const res = await fetch(getApiUrl(`/api/alt-orders/${orderId}`), {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(orderData),
  });
  const response = await handleResponse<{ success: boolean; data: AltOrderProfile }>(res);
  return { data: response.data };
}

export async function submitAltOrder(orderId: string): Promise<{ data: AltOrderProfile }> {
  const res = await fetch(getApiUrl(`/api/alt-orders/${orderId}/submit`), {
    method: "POST",
    headers: getAuthHeaders(),
  });
  const response = await handleResponse<{ success: boolean; data: AltOrderProfile }>(res);
  return { data: response.data };
}

export async function generateAltOrderPdf(
  orderId: string
): Promise<{ data: { message: string; orderId: string } }> {
  const res = await fetch(getApiUrl(`/api/alt-orders/${orderId}/generate-pdf`), {
    method: "POST",
    headers: getAuthHeaders(),
  });
  const response = await handleResponse<{
    success: boolean;
    data: { message: string; orderId: string };
  }>(res);
  return { data: response.data };
}

// ============================================
// Accredited Investor Verification (506c) API
// ============================================

export interface AccreditationProfile {
  id: string;
  userId: string;
  status: "draft" | "submitted" | "approved" | "rejected";
  lastCompletedPage?: number;
  pageCompletionStatus?: Record<string, { completed?: boolean; updatedAt?: string }>;
  rrName?: string;
  rrNo?: string;
  customerNames?: string;
  hasJointOwner?: boolean;
  accountOwnerSignature?: string;
  accountOwnerPrintedName?: string;
  accountOwnerDate?: string;
  jointAccountOwnerSignature?: string;
  jointAccountOwnerPrintedName?: string;
  jointAccountOwnerDate?: string;
  financialProfessionalSignature?: string;
  financialProfessionalPrintedName?: string;
  financialProfessionalDate?: string;
  registeredPrincipalSignature?: string;
  registeredPrincipalPrintedName?: string;
  registeredPrincipalDate?: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
}

export async function createAccreditation(accreditationData: any, clientId?: string): Promise<{ data: AccreditationProfile }> {
  const body = clientId ? { ...accreditationData, clientId } : accreditationData;
  const res = await fetch(getApiUrl("/api/accreditations"), {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  const response = await handleResponse<{ success: boolean; data: AccreditationProfile }>(res);
  return { data: response.data };
}

export async function getAccreditations(options?: { page?: number; limit?: number; status?: string; clientId?: string }): Promise<{ profiles: AccreditationProfile[]; pagination?: any }> {
  const params = new URLSearchParams();
  if (options?.page) params.append("page", options.page.toString());
  if (options?.limit) params.append("limit", options.limit.toString());
  if (options?.status) params.append("status", options.status);
  if (options?.clientId) params.append("clientId", options.clientId);
  
  const queryString = params.toString();
  const url = `/api/accreditations${queryString ? `?${queryString}` : ""}`;
  
  const res = await fetch(getApiUrl(url), {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const response = await handleResponse<{ success: boolean; data: AccreditationProfile[]; pagination?: any }>(res);
  return { profiles: response.data || [], pagination: response.pagination };
}

export async function getAccreditation(accreditationId: string): Promise<{ data: AccreditationProfile }> {
  const res = await fetch(getApiUrl(`/api/accreditations/${accreditationId}`), {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const response = await handleResponse<{ success: boolean; data: AccreditationProfile }>(res);
  return { data: response.data };
}

export async function updateAccreditation(
  accreditationId: string,
  accreditationData: any
): Promise<{ data: AccreditationProfile }> {
  const res = await fetch(getApiUrl(`/api/accreditations/${accreditationId}`), {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(accreditationData),
  });
  const response = await handleResponse<{ success: boolean; data: AccreditationProfile }>(res);
  return { data: response.data };
}

export async function submitAccreditation(accreditationId: string): Promise<{ data: AccreditationProfile }> {
  const res = await fetch(getApiUrl(`/api/accreditations/${accreditationId}/submit`), {
    method: "POST",
    headers: getAuthHeaders(),
  });
  const response = await handleResponse<{ success: boolean; data: AccreditationProfile }>(res);
  return { data: response.data };
}

export async function generateAccreditationPdf(
  accreditationId: string
): Promise<{ data: { message: string; accreditationId: string } }> {
  const res = await fetch(getApiUrl(`/api/accreditations/${accreditationId}/generate-pdf`), {
    method: "POST",
    headers: getAuthHeaders(),
  });
  const response = await handleResponse<{
    success: boolean;
    data: { message: string; accreditationId: string };
  }>(res);
  return { data: response.data };
}

// ============================================
// Client Management API
// ============================================

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  investorProfiles?: InvestorProfile[];
  statementProfiles?: StatementProfile[];
  additionalHolderProfiles?: AdditionalHolderProfile[];
  altOrderProfiles?: AltOrderProfile[];
  accreditationProfiles?: AccreditationProfile[];
}

export interface ClientListResponse {
  clients: Client[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export async function getClients(options?: { page?: number; limit?: number; search?: string }): Promise<ClientListResponse> {
  const params = new URLSearchParams();
  if (options?.page) params.append("page", options.page.toString());
  if (options?.limit) params.append("limit", options.limit.toString());
  if (options?.search) params.append("search", options.search);
  
  const queryString = params.toString();
  const url = `/api/clients${queryString ? `?${queryString}` : ""}`;
  
  const res = await fetch(getApiUrl(url), {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const response = await handleResponse<{ success: boolean; data: ClientListResponse }>(res);
  return response.data;
}

export async function getClient(clientId: string): Promise<{ data: Client }> {
  const res = await fetch(getApiUrl(`/api/clients/${clientId}`), {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const response = await handleResponse<{ success: boolean; data: Client }>(res);
  return { data: response.data };
}

export async function createClient(clientData: { name: string; email?: string; phone?: string }): Promise<{ data: Client }> {
  const res = await fetch(getApiUrl("/api/clients"), {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(clientData),
  });
  const response = await handleResponse<{ success: boolean; data: Client }>(res);
  return { data: response.data };
}

export async function updateClient(
  clientId: string,
  clientData: { name?: string; email?: string; phone?: string }
): Promise<{ data: Client }> {
  const res = await fetch(getApiUrl(`/api/clients/${clientId}`), {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(clientData),
  });
  const response = await handleResponse<{ success: boolean; data: Client }>(res);
  return { data: response.data };
}

export async function deleteClient(clientId: string): Promise<{ data: { success: boolean } }> {
  const res = await fetch(getApiUrl(`/api/clients/${clientId}`), {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  const response = await handleResponse<{ success: boolean; data: { success: boolean } }>(res);
  return { data: response.data };
}

// ============================================
// Analytics API
// ============================================

export interface DashboardAnalytics {
  totalClients: number;
  formsCompleted: {
    investorProfile: number;
    statement: number;
    additionalHolder: number;
    altOrder: number;
    accreditation: number;
    total: number;
  };
  formsInProgress: {
    investorProfile: number;
    statement: number;
    additionalHolder: number;
    altOrder: number;
    accreditation: number;
    total: number;
  };
  completionRates: {
    investorProfile: number;
    statement: number;
    additionalHolder: number;
    altOrder: number;
    accreditation: number;
  };
  recentActivity: Array<{
    id: string;
    status: string;
    updatedAt: string;
    client?: { id: string; name: string };
    formType: string;
  }>;
  statusBreakdown: {
    investorProfile: { draft: number; submitted: number; approved: number; rejected: number };
    statement: { draft: number; submitted: number; approved: number; rejected: number };
    additionalHolder: { draft: number; submitted: number; approved: number; rejected: number };
    altOrder: { draft: number; submitted: number; approved: number; rejected: number };
    accreditation: { draft: number; submitted: number; approved: number; rejected: number };
  };
}

export interface ClientAnalytics {
  client: Client;
  forms: {
    investorProfile: InvestorProfile | null;
    statement: StatementProfile | null;
    additionalHolder: AdditionalHolderProfile | null;
    altOrder: AltOrderProfile | null;
    accreditation: AccreditationProfile | null;
  };
  completionStatus: {
    completed: number;
    total: number;
    percentage: number;
  };
}

export async function getDashboardAnalytics(): Promise<{ data: DashboardAnalytics }> {
  const res = await fetch(getApiUrl("/api/analytics/dashboard"), {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const response = await handleResponse<{ success: boolean; data: DashboardAnalytics }>(res);
  return { data: response.data };
}

export async function getClientAnalytics(clientId: string): Promise<{ data: ClientAnalytics }> {
  const res = await fetch(getApiUrl(`/api/analytics/clients/${clientId}`), {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const response = await handleResponse<{ success: boolean; data: ClientAnalytics }>(res);
  return { data: response.data };
}

