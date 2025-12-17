import { useState, useMemo, useEffect, useCallback } from "react";
import { z } from "zod";
import statementSchema from "../REI-Statement-of-Financial-Condition-v20240101-1.json";
import { StepContainer } from "./steps/StepContainer";
import { FormNavigation } from "./FormNavigation";
import { TextField } from "./fields/TextField";
import { TextareaField } from "./fields/TextareaField";
import { FinancialTableField } from "./fields/FinancialTableField";
import { StatementSignaturesSection } from "./fields/StatementSignaturesSection";
import { CurrencyField } from "./fields/CurrencyField";
import { ComputedCurrencyField } from "./fields/ComputedCurrencyField";
import { useStatementFormValidation } from "../hooks/useStatementFormValidation";
import { transformFormDataForValidation, transformErrorsForDisplay, getValidatorFieldId, getJsonFieldId } from "../utils/statementFormDataTransform";
import { shouldShowStatementField, updateHasJointOwner } from "../utils/statementFieldDependencies";
import { step1Schema, step2Schema } from "../validators/statementValidators";
import {
  computeTotalAssetsLessPrimaryResidence,
  computeTotalNetWorthAssetsLessPRMinusLiab,
  computeTotalNetWorthFinal,
  computeTotalPotentialLiquidity,
  checkManualOverrideWarnings,
} from "../utils/statementComputedFields";
import { normalizeCurrency } from "../utils/statementValidation";
import { buildStatementStep1Payload, buildStatementStep2Payload } from "../utils/statementFormDataToBackend";
import {
  createStatement,
  getStatement,
  updateStatementStep,
  submitStatement,
  type StatementProfile,
} from "../api";
import { useAuth } from "../contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast, ToastContainer } from "./Toast";
import type { StatementSection, StatementField, FieldValue } from "../types/statementForm";

type SaveState =
  | { status: "idle"; error?: string }
  | { status: "saving"; error?: string }
  | { status: "success"; error?: string; timestamp: Date }
  | { status: "error"; error: string };

interface Field {
  id: string;
  label: string;
  type: string;
  page?: number;
  fields?: Field[];
  columns?: string[];
  rows?: Array<{
    id: string;
    label: string;
    field_type: string;
    is_total?: boolean;
    allow_custom_label?: boolean;
  }>;
  allow_add_rows?: boolean;
  bullets?: string[];
  signature_lines?: Array<{
    role: string;
    fields: Array<{
      id: string;
      label: string;
      type: string;
    }>;
  }>;
}

export default function StatementOfFinancialConditionForm() {
  const { isAuthenticated } = useAuth();
  const { toasts, showToast, removeToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<Record<string, FieldValue>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statementId, setStatementId] = useState<string | null>(null);
  const [hasLoadedStatement, setHasLoadedStatement] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>({ status: "idle" });
  const [submitErrors, setSubmitErrors] = useState<Record<string, string>>({});

  const allSections = (statementSchema as any).schema as StatementSection[];
  const totalPages = 2;

  const currentSection = useMemo(() => {
    return allSections.find((section) => section.page === currentPage);
  }, [allSections, currentPage]);

  // Transform form data for validation (convert JSON IDs to validator IDs)
  const validatorFormData = useMemo(() => {
    return transformFormDataForValidation(formData);
  }, [formData]);

  // Initialize validation hook (convert 1-based page to 0-based)
  const validation = useStatementFormValidation({
    formData: validatorFormData,
    currentPage: currentPage - 1,
  });

  // Transform validation errors back to JSON field IDs for display
  const displayErrors = useMemo(() => {
    return transformErrorsForDisplay(validation.errors);
  }, [validation.errors]);

  // Update has_joint_owner when customer_names or account_type changes
  useEffect(() => {
    setFormData((prev) => {
      const updated = updateHasJointOwner(prev);
      // Only update if the value actually changed
      if (updated.has_joint_owner !== prev.has_joint_owner) {
        return updated;
      }
      return prev;
    });
  }, [formData.customer_names, formData.account_type]);

  // Derive statementId from URL if present (e.g., /app/statement/:id)
  const statementIdFromUrl = useMemo(() => {
    const pathMatch = location.pathname.match(/\/statement\/(.+)$/);
    if (pathMatch && pathMatch[1]) {
      const id = pathMatch[1];
      return id === "new" ? null : id;
    }
    return null;
  }, [location.pathname]);

  // Load existing statement if URL has id
  useEffect(() => {
    if (!isAuthenticated) return;

    if (statementIdFromUrl && statementIdFromUrl !== hasLoadedStatement) {
      setStatementId(statementIdFromUrl);
      (async () => {
        setIsLoading(true);
        try {
          const response = await getStatement(statementIdFromUrl);
          const backendData = response.data as StatementProfile & {
            financialRows?: any[];
            signatures?: any[];
          };
          // For now, we only hydrate header + notes; financial rows remain on client
          setFormData((prev) => ({
            ...prev,
            rr_name: backendData.rrName || "",
            rr_no: backendData.rrNo || "",
            customer_names: backendData.customerNames || "",
            notes_page1: backendData.notesPage1 || "",
            additional_notes: backendData.additionalNotes || "",
          }));
          setHasLoadedStatement(statementIdFromUrl);
        } catch (error: any) {
          console.error("Error loading statement:", error);
          showToast(error.message || "Failed to load statement", "error");
        } finally {
          setIsLoading(false);
        }
      })();
    } else if (!statementIdFromUrl && hasLoadedStatement !== null) {
      // Only reset if we haven't already reset (avoid infinite loop)
      setStatementId(null);
      setFormData({});
      setHasLoadedStatement(null);
    }
  }, [statementIdFromUrl, isAuthenticated, hasLoadedStatement, showToast]);

  // Calculate computed values (using validator field IDs as keys)
  const computedValues = useMemo(() => {
    const validatorData = transformFormDataForValidation(formData);
    return {
      nw_total_assets_less_primary_residence: computeTotalAssetsLessPrimaryResidence(validatorData),
      nw_total_net_worth_assets_less_pr_minus_liab: computeTotalNetWorthAssetsLessPRMinusLiab(validatorData),
      nw_total_net_worth_final: computeTotalNetWorthFinal(validatorData),
      nw_total_potential_liquidity: computeTotalPotentialLiquidity(validatorData),
    };
  }, [formData]);

  // Calculate computed warnings
  const computedWarnings = useMemo(() => {
    const validatorData = transformFormDataForValidation(formData);
    const warnings = checkManualOverrideWarnings(validatorData);
    // Transform warning keys back to JSON IDs
    const transformedWarnings: Record<string, string> = {};
    for (const [validatorId, warning] of Object.entries(warnings)) {
      const jsonId = Object.keys(formData).find(
        (id) => getValidatorFieldId(id) === validatorId
      ) || validatorId;
      transformedWarnings[jsonId] = warning;
    }
    return transformedWarnings;
  }, [formData]);

  const updateField = useCallback((fieldId: string, value: FieldValue) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        [fieldId]: value,
      };
      return updated;
    });
    // Clear any submit-level error for this field when user edits it
    setSubmitErrors((prev) => {
      if (!prev[fieldId]) return prev;
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  }, []);

  const handlePrevious = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  const handleNext = useCallback(() => {
    // Allow navigation without validation - users can save incomplete forms
    // Validation will only be enforced on submit
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, totalPages]);

  const saveCurrentPage = useCallback(
    async (showNotification = true, silent = false) => {
      const pageIndex = currentPage - 1;
      const pageNumber = pageIndex + 1;
      
      setSaveState({ status: "saving" });

      const buildPayload = () => {
        if (pageIndex === 0) {
          return buildStatementStep1Payload(formData);
        } else if (pageIndex === 1) {
          return buildStatementStep2Payload(formData);
        }
        return null;
      };

      const payload = buildPayload();
      if (!payload) return;

      // For page 2, we need a statementId
      if (pageIndex === 1 && !statementId) {
        const errorMsg = "Please complete Page 1 to create a statement before saving Page 2.";
        setSaveState({ status: "error", error: errorMsg });
        if (!silent) {
          showToast(errorMsg, "error");
        }
        return;
      }

      let lastError: any = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          let responseData;
          if (statementId) {
            const response = await updateStatementStep(statementId, pageNumber, payload);
            responseData = response.data;
          } else {
            // Only page 1 can create a new statement
            if (pageIndex !== 0) {
              throw new Error("Please complete Page 1 to create a statement before saving other pages.");
            }
            const response = await createStatement(payload);
            responseData = response.data;
            const newStatementId = response.data.id;
            setStatementId(newStatementId);
            // Update URL to include statementId so form reloads correctly when navigating back
            navigate(`/app/statement/${newStatementId}`, { replace: true });
          }

          setSaveState({ status: "success", timestamp: new Date() });
          if (showNotification && !silent) {
            showToast(`Page ${pageNumber} saved successfully`, "success");
          }
          return;
        } catch (error: any) {
          lastError = error;
          await new Promise((resolve) => setTimeout(resolve, 300 * Math.pow(2, attempt)));
        }
      }

      const message = lastError?.message || "Failed to save page";
      setSaveState({ status: "error", error: message });
      if (!silent) {
        showToast(message, "error");
      }
      console.error("Error saving page:", lastError);
    },
    [currentPage, formData, statementId, navigate, showToast]
  );

  const handleManualSave = useCallback(async () => {
    await saveCurrentPage(true);
  }, [saveCurrentPage]);


  const handleSubmit = useCallback(async () => {
    // Clear previous submit-level errors
    setSubmitErrors({});

    // Validate all pages before submission using full schemas
    const validatorData = transformFormDataForValidation(formData);
    
    const submitErrorMap: Record<string, string> = {};
    let hasErrors = false;

    // Validate page 1 (header + financials)
    try {
      step1Schema.parse(validatorData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          const leafId = typeof err.path[err.path.length - 1] === "string" ? (err.path[err.path.length - 1] as string) : "";
          if (!leafId) return;
          const jsonId = getJsonFieldId(leafId);
          submitErrorMap[jsonId] = err.message;
          hasErrors = true;
          // Mark validator field as touched so page-level validation is aware
          validation.setTouched(leafId, true);
        });
      }
    }

    // Validate page 2 (notes + signatures)
    try {
      step2Schema.parse(validatorData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          const leafId = typeof err.path[err.path.length - 1] === "string" ? (err.path[err.path.length - 1] as string) : "";
          if (!leafId) return;
          const jsonId = getJsonFieldId(leafId);
          submitErrorMap[jsonId] = err.message;
          hasErrors = true;
          validation.setTouched(leafId, true);
        });
      }
    }

    if (hasErrors) {
      setSubmitErrors(submitErrorMap);
      showToast("Please fix validation errors on all pages before submitting", "error");
      // If we're not on page 1, switch to page 1 to show errors
      if (currentPage !== 1) {
        setCurrentPage(1);
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // Persist Step 1 (header + financial rows) with latest formData
      const step1Payload = buildStatementStep1Payload(formData);
      let currentStatementId = statementId;

      if (currentStatementId) {
        await updateStatementStep(currentStatementId, 1, step1Payload);
      } else {
        const response = await createStatement(step1Payload);
        currentStatementId = response.data.id;
        setStatementId(currentStatementId);
        // Ensure URL reflects the created statement
        navigate(`/app/statement/${currentStatementId}`, { replace: true });
      }

      // Persist Step 2 (additional notes + signatures) with latest formData
      const step2Payload = buildStatementStep2Payload(formData);
      if (currentStatementId) {
        await updateStatementStep(currentStatementId, 2, step2Payload);
      }

      // Submit statement
      if (!currentStatementId) {
        throw new Error("Statement could not be created before submit.");
      }
      await submitStatement(currentStatementId);
      showToast("Statement submitted successfully!", "success");
      
      // Optionally redirect after a delay
      setTimeout(() => {
        window.location.href = "/?statementId=" + currentStatementId;
      }, 2000);
    } catch (error: any) {
      showToast(error.message || "Failed to submit statement", "error");
      console.error("Error submitting statement:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [statementId, validation, showToast, formData, currentPage, setCurrentPage, navigate]);

  // Get error for a field (handles both JSON and validator IDs)
  const getFieldError = useCallback((jsonFieldId: string): string | undefined => {
    // Submit-level errors (from full form validation) take precedence
    if (submitErrors[jsonFieldId]) {
      return submitErrors[jsonFieldId];
    }
    // Check display errors (already transformed to JSON IDs)
    if (displayErrors[jsonFieldId]) {
      return displayErrors[jsonFieldId];
    }
    // Also check validator ID in case transformation missed it
    const validatorId = getValidatorFieldId(jsonFieldId);
    const validatorError = validation.getFieldError(validatorId);
    if (validatorError) {
      return validatorError;
    }
    return undefined;
  }, [displayErrors, validation, submitErrors]);

  // Handle blur for a field
  const handleFieldBlur = useCallback((jsonFieldId: string) => {
    const validatorId = getValidatorFieldId(jsonFieldId);
    validation.handleBlur(validatorId);
  }, [validation]);

  // Get mapped errors for FinancialTableField
  // FinancialTableField constructs IDs as ${tableId}_${rowId}, so we need to map those
  const getTableErrors = useCallback((tableId: string, rows: Array<{ id: string }>): Record<string, string> => {
    const tableErrors: Record<string, string> = {};
    rows.forEach((row) => {
      // FinancialTableField uses ${tableId}_${row.id} format
      const tableFieldId = `${tableId}_${row.id}`;
      // This is the JSON field ID format
      const jsonFieldId = `${tableId}_${row.id}`;
      const error = getFieldError(jsonFieldId);
      if (error) {
        // Map error to the table's field ID format
        tableErrors[tableFieldId] = error;
      }
    });
    return tableErrors;
  }, [getFieldError]);

  const renderField = (field: StatementField) => {
    const fieldId = field.id;
    
    // Check conditional visibility
    if (!shouldShowStatementField(fieldId, formData)) {
      return null;
    }

    const value = (formData[fieldId] as string) || "";
    const error = getFieldError(fieldId);

    switch (field.type) {
      case "group":
        return (
          <div key={fieldId} className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">{field.label}</h3>
            <div className="space-y-4">
              {field.fields?.map((subField) => renderField(subField))}
            </div>
          </div>
        );

      case "text":
        return (
          <TextField
            key={fieldId}
            id={fieldId}
            label={field.label}
            value={value}
            onChange={(val) => updateField(fieldId, val)}
            onBlur={() => handleFieldBlur(fieldId)}
            error={error}
          />
        );

      case "textarea":
        return (
          <TextareaField
            key={fieldId}
            id={fieldId}
            label={field.label}
            value={value}
            onChange={(val) => updateField(fieldId, val)}
            onBlur={() => handleFieldBlur(fieldId)}
            error={error}
          />
        );

      case "financial_table":
        // Check if this is Net Worth table (needs computed fields)
        const isNetWorthTable = fieldId === "net_worth";
        const tableErrors = getTableErrors(fieldId, field.rows || []);
        
        // For Net Worth table, render computed fields instead of regular table
        if (isNetWorthTable) {
          return (
            <div key={fieldId} className="mb-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">{field.label}</h3>
              <div className="space-y-4">
                {field.rows?.map((row) => {
                  const jsonFieldId = `${fieldId}_${row.id}`;
                  const validatorId = getValidatorFieldId(jsonFieldId);
                  const computedValue = computedValues[validatorId as keyof typeof computedValues];
                  const warning = computedWarnings[jsonFieldId];
                  const rowError = getFieldError(jsonFieldId);
                  
                  // Check if this field should be computed
                  const computedFieldIds = [
                    "nw_total_assets_less_primary_residence",
                    "nw_total_net_worth_assets_less_pr_minus_liab",
                    "nw_total_net_worth_final",
                    "nw_total_potential_liquidity",
                  ];
                  
                  // Special handling for "Total Liabilities" - should reference liab_total from Liabilities table
                  if (row.id === "total_liabilities_net_worth") {
                    // Get liab_total value from Liabilities table (JSON field ID)
                    const liabTotalJsonFieldId = "liabilities_total_liabilities";
                    const liabTotalValue = (formData[liabTotalJsonFieldId] as string) || "";
                    
                    // Use liab_total value if available, otherwise use the Net Worth field value
                    const displayValue = liabTotalValue || (formData[jsonFieldId] as string) || "";
                    
                    return (
                      <CurrencyField
                        key={row.id}
                        id={jsonFieldId}
                        label={row.label}
                        value={displayValue}
                        onChange={(val) => {
                          // Update both the Net Worth field and the Liabilities table total
                          updateField(jsonFieldId, val);
                          updateField(liabTotalJsonFieldId, val);
                        }}
                        onBlur={() => {
                          handleFieldBlur(jsonFieldId);
                          handleFieldBlur(liabTotalJsonFieldId);
                        }}
                        error={rowError}
                        disabled={false} // Allow editing, but sync with liab_total
                      />
                    );
                  }
                  
                  if (computedFieldIds.includes(validatorId) && computedValue !== undefined) {
                    return (
                      <ComputedCurrencyField
                        key={row.id}
                        id={jsonFieldId}
                        label={row.label}
                        computedValue={computedValue}
                        formData={formData}
                        updateField={updateField}
                        mode="computed"
                        error={rowError}
                        warning={warning}
                        onBlur={() => handleFieldBlur(jsonFieldId)}
                      />
                    );
                  }
                  
                  return (
                    <CurrencyField
                      key={row.id}
                      id={jsonFieldId}
                      label={row.label}
                      value={(formData[jsonFieldId] as string) || ""}
                      onChange={(val) => updateField(jsonFieldId, val)}
                      onBlur={() => handleFieldBlur(jsonFieldId)}
                      error={rowError}
                    />
                  );
                })}
              </div>
            </div>
          );
        }
        
        return (
          <FinancialTableField
            key={fieldId}
            id={fieldId}
            label={field.label}
            columns={field.columns || []}
            rows={field.rows || []}
            formData={formData}
            updateField={updateField}
            allowAddRows={field.allow_add_rows}
            errors={tableErrors}
            onBlur={(mappedFieldId) => {
              // mappedFieldId is in format ${tableId}_${rowId} (from FinancialTableField)
              // This is already the JSON field ID format, so we can use it directly
              handleFieldBlur(mappedFieldId);
            }}
          />
        );

      case "acknowledgment":
        return (
          <div key={fieldId} className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">{field.label}</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-700">
              {field.bullets?.map((bullet, idx) => (
                <li key={idx} className="text-sm leading-relaxed">
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        );

      case "signatures":
        // Map signature field IDs (JSON uses account_owner_*, validator uses sig_account_owner_*)
        const hasJointOwner = formData.has_joint_owner === true;
        return (
          <StatementSignaturesSection
            key={fieldId}
            accountOwnerSignature={(formData["account_owner_signature"] as string) || ""}
            onAccountOwnerSignatureChange={(val) => updateField("account_owner_signature", val)}
            accountOwnerPrintedName={(formData["account_owner_printed_name"] as string) || ""}
            onAccountOwnerPrintedNameChange={(val) => updateField("account_owner_printed_name", val)}
            accountOwnerDate={(formData["account_owner_date"] as string) || ""}
            onAccountOwnerDateChange={(val) => updateField("account_owner_date", val)}
            accountOwnerErrors={{
              signature: getFieldError("account_owner_signature"),
              printedName: getFieldError("account_owner_printed_name"),
              date: getFieldError("account_owner_date"),
            }}
            onAccountOwnerBlur={(field) => {
              const fieldMap: Record<string, string> = {
                signature: "account_owner_signature",
                printedName: "account_owner_printed_name",
                date: "account_owner_date",
              };
              handleFieldBlur(fieldMap[field]);
            }}
            jointAccountOwnerSignature={(formData["joint_account_owner_signature"] as string) || ""}
            onJointAccountOwnerSignatureChange={(val) => updateField("joint_account_owner_signature", val)}
            jointAccountOwnerPrintedName={(formData["joint_account_owner_printed_name"] as string) || ""}
            onJointAccountOwnerPrintedNameChange={(val) => updateField("joint_account_owner_printed_name", val)}
            jointAccountOwnerDate={(formData["joint_account_owner_date"] as string) || ""}
            onJointAccountOwnerDateChange={(val) => updateField("joint_account_owner_date", val)}
            jointAccountOwnerErrors={{
              signature: getFieldError("joint_account_owner_signature"),
              printedName: getFieldError("joint_account_owner_printed_name"),
              date: getFieldError("joint_account_owner_date"),
            }}
            onJointAccountOwnerBlur={(field) => {
              const fieldMap: Record<string, string> = {
                signature: "joint_account_owner_signature",
                printedName: "joint_account_owner_printed_name",
                date: "joint_account_owner_date",
              };
              handleFieldBlur(fieldMap[field]);
            }}
            financialProfessionalSignature={(formData["financial_professional_signature"] as string) || ""}
            onFinancialProfessionalSignatureChange={(val) => updateField("financial_professional_signature", val)}
            financialProfessionalPrintedName={(formData["financial_professional_printed_name"] as string) || ""}
            onFinancialProfessionalPrintedNameChange={(val) => updateField("financial_professional_printed_name", val)}
            financialProfessionalDate={(formData["financial_professional_date"] as string) || ""}
            onFinancialProfessionalDateChange={(val) => updateField("financial_professional_date", val)}
            financialProfessionalErrors={{
              signature: getFieldError("financial_professional_signature"),
              printedName: getFieldError("financial_professional_printed_name"),
              date: getFieldError("financial_professional_date"),
            }}
            onFinancialProfessionalBlur={(field) => {
              const fieldMap: Record<string, string> = {
                signature: "financial_professional_signature",
                printedName: "financial_professional_printed_name",
                date: "financial_professional_date",
              };
              handleFieldBlur(fieldMap[field]);
            }}
            registeredPrincipalSignature={(formData["registered_principal_signature"] as string) || ""}
            onRegisteredPrincipalSignatureChange={(val) => updateField("registered_principal_signature", val)}
            registeredPrincipalPrintedName={(formData["registered_principal_printed_name"] as string) || ""}
            onRegisteredPrincipalPrintedNameChange={(val) => updateField("registered_principal_printed_name", val)}
            registeredPrincipalDate={(formData["registered_principal_date"] as string) || ""}
            onRegisteredPrincipalDateChange={(val) => updateField("registered_principal_date", val)}
            registeredPrincipalErrors={{
              signature: getFieldError("registered_principal_signature"),
              printedName: getFieldError("registered_principal_printed_name"),
              date: getFieldError("registered_principal_date"),
            }}
            onRegisteredPrincipalBlur={(field) => {
              const fieldMap: Record<string, string> = {
                signature: "registered_principal_signature",
                printedName: "registered_principal_printed_name",
                date: "registered_principal_date",
              };
              handleFieldBlur(fieldMap[field]);
            }}
            hasJointOwner={hasJointOwner}
          />
        );

      default:
        return null;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Authentication Required</h2>
          <p className="text-slate-600">Please log in to access the statement of financial condition form.</p>
        </div>
      </div>
    );
  }

  if (isLoading || !currentSection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 flex items-center justify-center">
        <div className="text-center text-slate-600">Loading statement...</div>
      </div>
    );
  }

  const documentInfo = (statementSchema as any).document;

  return (
    <div className="form-container">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <style>{`
        .form-container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 48px 24px 64px 24px;
        }
        .document-header {
          background: linear-gradient(180deg, #ffffff 0%, #f8faff 100%);
          border: 1px solid rgba(11,92,255,0.12);
          border-radius: 24px;
          padding: 24px 32px;
          margin-bottom: 24px;
          box-shadow: 0 8px 32px rgba(11,92,255,0.06);
        }
        .document-header h1 {
          font-size: 28px;
          font-weight: 300;
          letter-spacing: -0.02em;
          color: #0f172a;
          margin: 0 0 8px 0;
        }
        .document-header-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          font-size: 13px;
          color: #64748b;
        }
        .intro-bullets {
          background: #f8faff;
          border-left: 4px solid #0b5cff;
          padding: 20px 24px;
          margin-bottom: 32px;
          border-radius: 8px;
        }
        .intro-bullets p {
          margin: 0 0 12px 0;
          font-size: 14px;
          line-height: 1.6;
          color: #334155;
        }
        .intro-bullets p:last-child {
          margin-bottom: 0;
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
          color: #64748b;
          white-space: nowrap;
        }
        .form-nav-status.saving {
          color: #0b5cff;
        }
        .form-nav-status.saved {
          color: #22c55e;
        }
        .form-nav-status.error {
          color: #ef4444;
        }
        .form-save-button {
          height: 32px;
          padding: 0 16px;
          border-radius: 999px;
          background: #0b5cff;
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
          background: #0a4fd8;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(11,92,255,0.3);
        }
        .form-save-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
        @media (max-width: 768px) {
          .form-nav-actions {
            align-items: flex-start;
            width: 100%;
          }
          .form-save-button {
            width: 100%;
          }
        }
      `}</style>

      {/* Document Header - only show on page 1 */}
      {currentPage === 1 && (
        <div className="document-header">
          <h1>{documentInfo.title}</h1>
          <div className="document-header-info">
            <div>
              {documentInfo.company.name} • {documentInfo.company.phone} • Fax {documentInfo.company.fax} • {documentInfo.company.website}
            </div>
            <div>Document Code: {documentInfo.document_code}</div>
          </div>
        </div>
      )}

      {/* Intro Bullets - only show on page 1 */}
      {currentPage === 1 && (
        <div className="intro-bullets">
          <p>
            This document is intended to assist in determining (1) if a recommendation is suitable given an investors circumstance. (2) If an individual meets the definition of an accredited investor under the securities and Exchange Act of 33 Rule 506 Regulation D (Reg D) for the purpose of investing in a Private Placement (PP) or the suitability standards for certain non-traded REITS (REIT) or Business Development Companies (BDC). It is not intended to function as an individual balance sheet.
          </p>
          <p>
            Under Reg D, the investor must have a net worth greater than $1 million, either individually or jointly with the investors spouse. Investors should include all of their assets and all of their liabilities in calculating net worth. Further, the primary residence is not counted as an asset in the net worth calculation. In general, debt secured by the primary residence (such as a mortgage or home equity line of credit) is not counted as a liability in that net worth calculation if the fair market value (FMV) of the residence is greater than the amount secured by it.
          </p>
        </div>
      )}

      {/* Page Header for page 2 */}
      {currentPage === 2 && (
        <div className="document-header">
          <div className="document-header-info">
            <div>Page 2 of 2</div>
          </div>
        </div>
      )}

      {/* Save as Draft button and status - positioned at top right */}
      <div className="form-nav-actions" style={{ marginBottom: "24px", marginTop: currentPage === 2 ? "24px" : "0" }}>
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

      <StepContainer title={currentSection.title}>
        <div className="space-y-6">
          {currentSection.fields.map((field) => renderField(field))}
        </div>
      </StepContainer>

      <FormNavigation
        currentStep={currentPage - 1}
        totalSteps={totalPages}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

