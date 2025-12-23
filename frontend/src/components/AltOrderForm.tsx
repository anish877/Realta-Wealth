import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import altOrderSchema from "../REI-Alt-Order-Ticket-v20240101-1.json";
import { StepContainer } from "./steps/StepContainer";
import { FormNavigation } from "./FormNavigation";
import { AltOrderFieldRenderer } from "./AltOrderFieldRenderer";
import { AltOrderSignaturesSection } from "./fields/AltOrderSignaturesSection";
import { SignatureField } from "./fields/SignatureField";
import { TextField } from "./fields/TextField";
import { DateField } from "./fields/DateField";
import { useAltOrderValidation } from "../hooks/useAltOrderValidation";
import { updateHasJointOwner } from "../utils/altOrderFieldDependencies";
import { useToast, ToastContainer } from "./Toast";
import { StepErrorSummary } from "./ValidationError";
import { FormSkeleton } from "./FormSkeleton";
import { useAuth } from "../contexts/AuthContext";
import {
  createAltOrder,
  getAltOrder,
  updateAltOrder,
  submitAltOrder,
} from "../api";
import { transformAltOrderToBackend } from "../utils/altOrderFormDataToBackend";
import { transformBackendToAltOrderForm } from "../utils/altOrderBackendToFormData";
import type { AltOrderFormData, AltOrderField, AltOrderSection } from "../types/altOrderForm";
import type { FieldValue } from "../types/altOrderForm";

type SaveState =
  | { status: "idle"; error?: string }
  | { status: "saving"; error?: string }
  | { status: "success"; error?: string; timestamp: Date }
  | { status: "error"; error: string };

interface AltOrderFormProps {
  clientId?: string;
}

export default function AltOrderForm({ clientId }: AltOrderFormProps = {}) {
  const { isAuthenticated } = useAuth();
  const { toasts, showToast, removeToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract clientId from URL if not provided as prop
  const clientIdFromUrl = useMemo(() => {
    const pathMatch = location.pathname.match(/\/clients\/([^/]+)/);
    return pathMatch ? pathMatch[1] : null;
  }, [location.pathname]);

  const effectiveClientId = clientId || clientIdFromUrl;

  // Extract orderId from URL pathname (handles both /app/alt-order/:id and /app/clients/:clientId/forms/alt-order/:id)
  const orderIdFromUrl = useMemo(() => {
    const pathMatch = location.pathname.match(/\/alt-order\/([^/]+)/);
    if (pathMatch && pathMatch[1]) {
      const id = pathMatch[1];
      return id === "new" ? null : id;
    }
    return null;
  }, [location.pathname]);

  const [formData, setFormData] = useState<AltOrderFormData>({});
  const [orderId, setOrderId] = useState<string | null>(orderIdFromUrl);
  const [hasLoadedOrder, setHasLoadedOrder] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>({ status: "idle" });

  const allSections = (altOrderSchema as any).schema as AltOrderSection[];
  const currentSection = allSections[0]; // Single page form

  // Update has_joint_owner when customer_names changes
  useEffect(() => {
    const updated = updateHasJointOwner(formData);
    if (updated.has_joint_owner !== formData.has_joint_owner) {
      setFormData(updated);
    }
  }, [formData.customer_names]);

  // Initialize validation hook
  const validation = useAltOrderValidation({
    formData,
  });

  const loadAltOrder = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const response = await getAltOrder(id);
      const backendData = response.data;
      const transformedData = transformBackendToAltOrderForm(backendData);
      setFormData(transformedData);
      setHasLoadedOrder(id);

      // Set completed pages from backend
      if (backendData.pageCompletionStatus) {
        const completed = new Set<number>();
        Object.keys(backendData.pageCompletionStatus).forEach((key) => {
          const pageNum = parseInt(key, 10);
          if (pageNum && (backendData.pageCompletionStatus as any)[key]?.completed) {
            completed.add(pageNum);
          }
        });
      }
    } catch (error: any) {
      console.error("Error loading alt order:", error);
      showToast(error.message || "Failed to load alt order", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // Load alt order when orderIdFromUrl changes
  useEffect(() => {
    if (orderIdFromUrl && isAuthenticated && orderIdFromUrl !== hasLoadedOrder) {
      setOrderId(orderIdFromUrl);
      loadAltOrder(orderIdFromUrl);
    } else if (!orderIdFromUrl && isAuthenticated && hasLoadedOrder !== null) {
      setOrderId(null);
      setFormData({});
      setHasLoadedOrder(null);
    }
  }, [orderIdFromUrl, isAuthenticated, hasLoadedOrder, loadAltOrder]);

  const updateField = useCallback((fieldId: string, value: FieldValue) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        [fieldId]: value,
      };
      return updated;
    });
  }, []);

  const handleFieldBlur = useCallback((fieldId: string) => {
    validation.setTouched(fieldId, true);
    const value = formData[fieldId as keyof AltOrderFormData];
    validation.validateField(fieldId, value);
  }, [validation, formData]);

  const handleSubmit = useCallback(async () => {
    if (!orderId) {
      showToast("Please save the form first before submitting.", "warning");
      return;
    }

    // Validate entire form
    const validationResult = validation.validateAll();
    if (!validationResult.isValid) {
      showToast("Please fix validation errors before submitting", "error");
      // Mark all fields with errors as touched
      Object.keys(validationResult.errors).forEach((fieldId) => {
        validation.setTouched(fieldId, true);
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Save current form silently before submitting
      await saveCurrentOrder(false, true);
      await submitAltOrder(orderId);
      showToast("Form submitted successfully!", "success");
    } catch (error: any) {
      showToast(error.message || "Failed to submit form", "error");
    } finally {
      setIsSubmitting(false);
    }
  }, [orderId, formData, validation, showToast]);

  const saveCurrentOrder = useCallback(async (showNotification = true, silent = false) => {
    if (showNotification && !silent) {
      setSaveState({ status: "saving" });
    }

    const orderData = transformAltOrderToBackend(formData);

    let lastError: any = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        let responseData;
        if (orderId) {
          const response = await updateAltOrder(orderId, orderData);
          responseData = response.data;
        } else {
          const response = await createAltOrder(orderData, effectiveClientId);
          responseData = response.data;
          const newOrderId = response.data.id;
          setOrderId(newOrderId);
          if (effectiveClientId) {
            navigate(`/app/clients/${effectiveClientId}/forms/alt-order/${newOrderId}`, { replace: true });
          } else {
            navigate(`/app/alt-order/${newOrderId}`, { replace: true });
          }
        }

        const statusMap = (responseData as any).pageCompletionStatus || {};

        setSaveState({ status: "success", timestamp: new Date() });
        if (showNotification && !silent) {
          showToast("Form saved successfully", "success");
        }
        return;
      } catch (error: any) {
        lastError = error;
        await new Promise((resolve) => setTimeout(resolve, 300 * Math.pow(2, attempt)));
      }
    }

    const message = lastError?.message || "Failed to save form";
    setSaveState({ status: "error", error: message });
    if (!silent) {
      showToast(message, "error");
    }
    console.error("Error saving form:", lastError);
  }, [formData, orderId, showToast, navigate]);

  const handleManualSave = useCallback(async () => {
    await saveCurrentOrder(true);
  }, [saveCurrentOrder]);

  const renderField = useCallback((field: AltOrderField) => {
    // Skip signature fields - handled separately
    if (field.type === "signature") {
      return null;
    }

    const fieldValue = formData[field.id as keyof AltOrderFormData] || "";
    const fieldError = validation.getFieldError(field.id);

    return (
      <AltOrderFieldRenderer
        key={field.id}
        field={field}
        value={fieldValue}
        onChange={(val) => updateField(field.id, val)}
        formData={formData}
        updateField={updateField}
        disabled={isSubmitting}
        errors={validation.errors}
        onBlur={handleFieldBlur}
      />
    );
  }, [formData, updateField, validation, isSubmitting, handleFieldBlur]);

  if (isLoading) {
    return (
      <div className="form-root">
        <div className="form-container">
          <div className="form-content">
            <FormSkeleton fieldCount={8} showSectionHeader={true} />
          </div>
        </div>
      </div>
    );
  }

  if (!currentSection) {
    return (
      <div className="form-root">
        <div className="form-container">
          <div className="form-content">
            <div className="form-header">
              <h1 className="form-title">Form Not Found</h1>
              <p className="form-subtitle">The requested form section could not be found.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get signature field errors
  const accountOwnerErrors = {
    signature: validation.getFieldError("account_owner_signature"),
    printedName: validation.getFieldError("account_owner_printed_name"),
    date: validation.getFieldError("account_owner_date"),
  };
  const jointAccountOwnerErrors = {
    signature: validation.getFieldError("joint_account_owner_signature"),
    printedName: validation.getFieldError("joint_account_owner_printed_name"),
    date: validation.getFieldError("joint_account_owner_date"),
  };
  const financialProfessionalErrors = {
    signature: validation.getFieldError("financial_professional_signature"),
    printedName: validation.getFieldError("financial_professional_printed_name"),
    date: validation.getFieldError("financial_professional_date"),
  };

  return (
    <div className="form-root">
      <style>{`
.form-root, .form-root * {
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

.form-root {
  position: relative;
  min-height: 100vh;
  width: 100%;
  --primary: #0b5cff;
  --primary-dark: #0a4fd8;
  --bg: #ffffff;
  --fg: #0f172a;
  --muted: #5f6a7a;
  --border: #c8d7f5;
  --accent: #f1f4fc;
  background: var(--bg);
  color: var(--fg);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-weight: 300;
  line-height: 1.5;
  padding: 120px 24px 80px 24px;
}

.form-container {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-top-nav {
  position: sticky;
  top: 76px;
  z-index: 15;
  margin-bottom: 24px;
  padding: 20px 24px;
  background: rgba(255, 255, 255, 0.86);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border: 1px solid rgba(11,92,255,0.1);
  box-shadow: 0 10px 30px rgba(11, 92, 255, 0.08);
  border-radius: 18px;
  overflow: hidden;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.form-nav-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  flex-shrink: 0;
}

.form-nav-status {
  font-size: 11px;
  font-weight: 500;
  color: var(--muted);
  white-space: nowrap;
}

.form-nav-status.saving {
  color: var(--primary);
}

.form-nav-status.saved {
  color: #22c55e;
}

.form-nav-status.error {
  color: #ef4444;
}

.form-content {
  min-width: 0;
}

.form-header {
  margin-bottom: 32px;
  text-align: center;
}

.form-title {
  font-size: clamp(32px, 5vw, 48px);
  font-weight: 300;
  letter-spacing: -0.02em;
  color: var(--fg);
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.form-subtitle {
  font-size: 16px;
  font-weight: 300;
  color: var(--muted);
  margin: 0;
}

.form-save-button {
  height: 32px;
  padding: 0 16px;
  border-radius: 999px;
  background: var(--primary);
  color: white;
  border: none;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: -0.01em;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 2px 8px rgba(11,92,255,0.2);
  white-space: nowrap;
}

.form-save-button:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(11,92,255,0.3);
}

.form-save-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 1024px) {
  .form-root {
    padding: 100px 20px 60px 20px;
  }
  .form-top-nav {
    flex-direction: column;
    gap: 16px;
  }
  .form-nav-actions {
    align-items: flex-start;
    width: 100%;
  }
  .form-save-button {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .form-root {
    padding: 80px 16px 40px 16px;
  }
  .form-top-nav {
    top: 70px;
    padding: 16px;
  }
}
      `}</style>
      <div className="form-container">
        {/* Top navigation with save button */}
        <div className="form-top-nav">
          <div style={{ flex: 1 }} />
          <div className="form-nav-actions">
            {(saveState.status === "saving" || isSubmitting) && (
              <div className={`form-nav-status ${saveState.status === "saving" ? 'saving' : 'saving'}`}>
                {saveState.status === "saving" ? "Saving..." : "Submitting..."}
              </div>
            )}
            {saveState.status === "success" && !isSubmitting && (
              <div className="form-nav-status saved">
                Saved {(saveState as any).timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
            {saveState.status === "error" && (
              <div className="form-nav-status error">Error</div>
            )}
            <button
              onClick={handleManualSave}
              disabled={saveState.status === "saving" || isSubmitting}
              className="form-save-button"
            >
              {saveState.status === "saving" ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        <div className="form-content">
          {/* Toast Container */}
          <ToastContainer toasts={toasts} onRemove={removeToast} />

          {/* Header */}
          <div className="form-header">
            <h1 className="form-title">{altOrderSchema.document.title}</h1>
            <p className="form-subtitle">Complete all fields to submit</p>
          </div>

          {/* Form Card */}
          <StepContainer title={currentSection.title} hideTitle={true}>
            <div className="space-y-6">
              {/* Form-level error summary */}
              {Object.keys(validation.errors).length > 0 && (
                <StepErrorSummary errors={validation.errors} />
              )}
              
              {/* Render all fields except signatures */}
              {currentSection.fields
                .filter((field) => field.type !== "signature")
                .map((field) => renderField(field))}

              {/* Signatures Section */}
              <AltOrderSignaturesSection
                accountOwnerSignature={(formData.account_owner_signature as string) || ""}
                onAccountOwnerSignatureChange={(val) => updateField("account_owner_signature", val)}
                accountOwnerPrintedName={(formData.account_owner_printed_name as string) || ""}
                onAccountOwnerPrintedNameChange={(val) => updateField("account_owner_printed_name", val)}
                accountOwnerDate={(formData.account_owner_date as string) || ""}
                onAccountOwnerDateChange={(val) => updateField("account_owner_date", val)}
                accountOwnerErrors={accountOwnerErrors}
                onAccountOwnerBlur={(field) => handleFieldBlur(`account_owner_${field}`)}
                jointAccountOwnerSignature={(formData.joint_account_owner_signature as string) || ""}
                onJointAccountOwnerSignatureChange={(val) => updateField("joint_account_owner_signature", val)}
                jointAccountOwnerPrintedName={(formData.joint_account_owner_printed_name as string) || ""}
                onJointAccountOwnerPrintedNameChange={(val) => updateField("joint_account_owner_printed_name", val)}
                jointAccountOwnerDate={(formData.joint_account_owner_date as string) || ""}
                onJointAccountOwnerDateChange={(val) => updateField("joint_account_owner_date", val)}
                jointAccountOwnerErrors={jointAccountOwnerErrors}
                onJointAccountOwnerBlur={(field) => handleFieldBlur(`joint_account_owner_${field}`)}
                financialProfessionalSignature={(formData.financial_professional_signature as string) || ""}
                onFinancialProfessionalSignatureChange={(val) => updateField("financial_professional_signature", val)}
                financialProfessionalPrintedName={(formData.financial_professional_printed_name as string) || ""}
                onFinancialProfessionalPrintedNameChange={(val) => updateField("financial_professional_printed_name", val)}
                financialProfessionalDate={(formData.financial_professional_date as string) || ""}
                onFinancialProfessionalDateChange={(val) => updateField("financial_professional_date", val)}
                financialProfessionalErrors={financialProfessionalErrors}
                onFinancialProfessionalBlur={(field) => handleFieldBlur(`financial_professional_${field}`)}
                hasJointOwner={formData.has_joint_owner === true}
              />

              {/* Registered Principal Signature (Internal Use Only) */}
              <div className="mt-8 pt-8 border-t border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Realta INTERNAL USE ONLY</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <SignatureField
                      id="registered_principal_signature"
                      label="Registered Principal Signature"
                      value={(formData.registered_principal_signature as string) || ""}
                      onChange={(val) => updateField("registered_principal_signature", val)}
                      onBlur={() => handleFieldBlur("registered_principal_signature")}
                      error={validation.getFieldError("registered_principal_signature")}
                    />
                  </div>
                  <div>
                    <TextField
                      id="registered_principal_printed_name"
                      label="Printed Name"
                      value={(formData.registered_principal_printed_name as string) || ""}
                      onChange={(val) => updateField("registered_principal_printed_name", val)}
                      onBlur={() => handleFieldBlur("registered_principal_printed_name")}
                      error={validation.getFieldError("registered_principal_printed_name")}
                    />
                  </div>
                  <div>
                    <DateField
                      id="registered_principal_date"
                      label="Date"
                      value={(formData.registered_principal_date as string) || ""}
                      onChange={(val) => updateField("registered_principal_date", val)}
                      onBlur={() => handleFieldBlur("registered_principal_date")}
                      error={validation.getFieldError("registered_principal_date")}
                    />
                  </div>
                </div>
              </div>
            </div>
          </StepContainer>

          {/* Submit Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="form-nav-button form-nav-button-submit"
              style={{
                height: "42px",
                padding: "0 20px",
                borderRadius: "999px",
                fontSize: "14px",
                fontWeight: 600,
                letterSpacing: "-0.01em",
                cursor: "pointer",
                transition: "all 0.15s ease",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                border: "none",
                minWidth: "120px",
                background: "#22c55e",
                color: "white",
                boxShadow: "0 4px 12px rgba(34,197,94,0.24)",
              }}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

