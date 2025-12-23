import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import additionalHolderSchema from "../REI-Additional-Holder-v20240101-1.json";
import { StepContainer } from "./steps/StepContainer";
import { FormNavigation } from "./FormNavigation";
import { AdditionalHolderFieldRenderer } from "./AdditionalHolderFieldRenderer";
import { useAdditionalHolderValidation } from "../hooks/useAdditionalHolderValidation";
import { shouldShowAdditionalHolderField } from "../utils/additionalHolderFieldDependencies";
import { useToast, ToastContainer } from "./Toast";
import { StepErrorSummary } from "./ValidationError";
import { FormSkeleton } from "./FormSkeleton";
import { useAuth } from "../contexts/AuthContext";
import {
  createAdditionalHolder,
  getAdditionalHolder,
  updateAdditionalHolderStep,
  submitAdditionalHolder,
} from "../api";
import {
  transformAdditionalHolderStep1,
  transformAdditionalHolderStep2,
} from "../utils/additionalHolderFormDataToBackend";
import { transformBackendToAdditionalHolderForm } from "../utils/additionalHolderBackendToFormData";
import type { AdditionalHolderFormData, AdditionalHolderField, AdditionalHolderSection } from "../types/additionalHolderForm";
import type { FieldValue } from "../types/additionalHolderForm";

type SaveState =
  | { status: "idle"; error?: string }
  | { status: "saving"; error?: string }
  | { status: "success"; error?: string; timestamp: Date }
  | { status: "error"; error: string };

interface AdditionalHolderFormProps {
  clientId?: string;
}

export default function AdditionalHolderForm({ clientId }: AdditionalHolderFormProps = {}) {
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

  // Extract holderId from URL pathname (handles both /app/additional-holder/:id and /app/clients/:clientId/forms/additional-holder/:id)
  const holderIdFromUrl = useMemo(() => {
    const pathMatch = location.pathname.match(/\/additional-holder\/([^/]+)/);
    if (pathMatch && pathMatch[1]) {
      const id = pathMatch[1];
      return id === "new" ? null : id;
    }
    return null;
  }, [location.pathname]);

  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<AdditionalHolderFormData>({});
  const [holderId, setHolderId] = useState<string | null>(holderIdFromUrl);
  const [hasLoadedHolder, setHasLoadedHolder] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingNext, setIsSavingNext] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>({ status: "idle" });
  const [completedPages, setCompletedPages] = useState<Set<number>>(new Set());

  const allSections = (additionalHolderSchema as any).schema as AdditionalHolderSection[];
  const totalPages = 2;

  const currentSection = useMemo(() => {
    return allSections.find((section) => section.page === currentPage);
  }, [allSections, currentPage]);

  // Initialize validation hook
  const validation = useAdditionalHolderValidation({
    formData,
    currentPage,
  });

  const loadAdditionalHolder = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const response = await getAdditionalHolder(id);
      const backendData = response.data;
      const transformedData = transformBackendToAdditionalHolderForm(backendData);
      setFormData(transformedData);
      setHasLoadedHolder(id);

      // Set completed pages from backend
      if (backendData.pageCompletionStatus) {
        const completed = new Set<number>();
        Object.keys(backendData.pageCompletionStatus).forEach((key) => {
          const pageNum = parseInt(key, 10);
          if (pageNum && (backendData.pageCompletionStatus as any)[key]?.completed) {
            completed.add(pageNum);
          }
        });
        setCompletedPages(completed);
      }
    } catch (error: any) {
      console.error("Error loading additional holder:", error);
      showToast(error.message || "Failed to load additional holder", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // Load additional holder when holderIdFromUrl changes
  useEffect(() => {
    if (holderIdFromUrl && isAuthenticated && holderIdFromUrl !== hasLoadedHolder) {
      setHolderId(holderIdFromUrl);
      loadAdditionalHolder(holderIdFromUrl);
    } else if (!holderIdFromUrl && isAuthenticated && hasLoadedHolder !== null) {
      setHolderId(null);
      setFormData({});
      setHasLoadedHolder(null);
    }
  }, [holderIdFromUrl, isAuthenticated, hasLoadedHolder, loadAdditionalHolder]);

  // Render step status for timeline
  const renderStepStatus = (pageIndex: number): "completed" | "current" | "upcoming" => {
    if (completedPages.has(pageIndex + 1)) return "completed";
    if (pageIndex + 1 === currentPage) return "current";
    return "upcoming";
  };

  // Handle step click in timeline
  const handleStepClick = (page: number) => {
    if (page === currentPage) return;
    if (completedPages.has(page) || page < currentPage) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

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
    const value = formData[fieldId as keyof AdditionalHolderFormData];
    validation.validateField(fieldId, value);
  }, [validation, formData]);

  const handlePrevious = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage]);

  const saveCurrentPage = useCallback(async (showNotification = true, silent = false): Promise<boolean> => {
    if (showNotification && !silent) {
      setSaveState({ status: "saving" });
    }
    
    const stepData = currentPage === 1 
      ? transformAdditionalHolderStep1(formData)
      : transformAdditionalHolderStep2(formData);

    let lastError: any = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        let responseData;
        if (holderId) {
          const response = await updateAdditionalHolderStep(holderId, currentPage, stepData);
          responseData = response.data;
        } else {
          if (currentPage !== 1) {
            throw new Error("Please complete Page 1 to create an additional holder before saving other pages.");
          }
          const response = await createAdditionalHolder(stepData, effectiveClientId || undefined);
          responseData = response.data;
          const newHolderId = response.data.id;
          setHolderId(newHolderId);
          if (effectiveClientId) {
            navigate(`/app/clients/${effectiveClientId}/forms/additional-holder/${newHolderId}`, { replace: true });
          } else {
            navigate(`/app/additional-holder/${newHolderId}`, { replace: true });
          }
        }

        const statusMap = (responseData as any).pageCompletionStatus || {};
        const completed = new Set<number>();
        Object.entries(statusMap).forEach(([key, value]) => {
          const num = parseInt(key, 10);
          if ((value as any)?.completed) {
            completed.add(num);
          }
        });
        setCompletedPages(completed);

        setSaveState({ status: "success", timestamp: new Date() });
        if (showNotification && !silent) {
          showToast(`Page ${currentPage} saved successfully`, "success");
        }
        return true;
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
    return false;
  }, [formData, holderId, currentPage, showToast, navigate]);

  const handleNext = useCallback(async () => {
    // Validate current page before navigation
    const validationResult = validation.validatePage(currentPage);
    if (!validationResult.isValid) {
      showToast("Please fix validation errors before continuing", "error");
      // Mark all fields with errors as touched
      Object.keys(validationResult.errors).forEach((fieldId) => {
        validation.setTouched(fieldId, true);
      });
      return;
    }

    setIsSavingNext(true);
    try {
    // Save before moving forward
    const saved = await saveCurrentPage(false, true);
    if (!saved) {
      return;
    }

    // Mark page as completed
    setCompletedPages((prev) => new Set([...prev, currentPage]));

    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (error) {
      showToast("Failed to save page. Please try again.", "error");
    } finally {
      setIsSavingNext(false);
    }
  }, [currentPage, totalPages, validation, showToast, saveCurrentPage]);

  const handleSubmit = useCallback(async () => {
    if (!holderId) {
      showToast("Please save the form first before submitting.", "warning");
      return;
    }

    // Validate all pages
    const validationResult = validation.validateAll();
    if (!validationResult.isValid) {
      showToast("Please fix validation errors before submitting", "error");
      // Mark all fields with errors as touched
      Object.keys(validationResult.errors).forEach((fieldId) => {
        validation.setTouched(fieldId, true);
      });
      // Navigate to first page with errors
      const firstPageWithError = allSections.find((section) =>
        section.fields.some((field) => {
          const fieldId = field.id;
          return validationResult.errors[fieldId];
        })
      );
      if (firstPageWithError) {
        setCurrentPage(firstPageWithError.page || 1);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      // Save current page silently before submitting
      await saveCurrentPage(false, true);
      await submitAdditionalHolder(holderId);
      showToast("Form submitted successfully!", "success");
    } catch (error: any) {
      showToast(error.message || "Failed to submit form", "error");
    } finally {
      setIsSubmitting(false);
    }
  }, [holderId, formData, validation, showToast, allSections, saveCurrentPage]);

  const handleManualSave = useCallback(async () => {
    await saveCurrentPage(true);
  }, [saveCurrentPage]);

  const renderField = useCallback((field: AdditionalHolderField) => {
    // Check if field should be shown
    if (!shouldShowAdditionalHolderField(field.id, formData as Record<string, FieldValue>)) {
      return null;
    }

    const fieldValue = formData[field.id as keyof AdditionalHolderFormData] || "";
    const fieldError = validation.getFieldError(field.id);

    return (
      <AdditionalHolderFieldRenderer
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

.form-timeline-wrapper {
  flex: 1;
  min-width: 0;
  overflow-x: auto;
  padding-bottom: 8px;
}

.form-timeline-wrapper::-webkit-scrollbar {
  height: 4px;
}

.form-timeline-wrapper::-webkit-scrollbar-track {
  background: rgba(11,92,255,0.05);
  border-radius: 2px;
}

.form-timeline-wrapper::-webkit-scrollbar-thumb {
  background: rgba(11,92,255,0.2);
  border-radius: 2px;
}

.form-timeline-wrapper::-webkit-scrollbar-thumb:hover {
  background: rgba(11,92,255,0.3);
}

.form-steps-row {
  display: flex;
  align-items: flex-start;
  gap: 0;
  position: relative;
  padding: 8px 0 0 0;
}

.form-timeline-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex-shrink: 0;
  min-width: 100px;
  cursor: pointer;
  padding: 0 12px;
}

.form-timeline-step:first-child {
  padding-left: 0;
}

.form-timeline-step:last-child {
  padding-right: 0;
}

.form-timeline-connector {
  position: absolute;
  top: 20px;
  left: -12px;
  right: calc(100% - 20px);
  height: 2px;
  z-index: 0;
  pointer-events: none;
}

.form-timeline-step:first-child .form-timeline-connector {
  display: none;
}

.form-timeline-connector.completed {
  background: linear-gradient(90deg, rgba(34,197,94,0.4) 0%, #22c55e 100%);
}

.form-timeline-connector.upcoming {
  background: transparent;
  border-top: 1px dashed rgba(11,92,255,0.2);
  border-bottom: none;
  height: 1px;
}

.form-timeline-step-circle {
  position: relative;
  z-index: 1;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: var(--fg);
  background: rgba(11,92,255,0.08);
  border: 2px solid rgba(11,92,255,0.2);
  transition: all 0.15s ease;
  margin-bottom: 8px;
}

.form-timeline-step.current .form-timeline-step-circle {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
  box-shadow: 0 4px 12px rgba(11,92,255,0.35);
  transform: scale(1.1);
}

.form-timeline-step.completed .form-timeline-step-circle {
  background: rgba(34,197,94,0.15);
  color: #22c55e;
  border-color: rgba(34,197,94,0.4);
}

.form-timeline-step.completed .form-timeline-step-circle::after {
  content: "✓";
  font-size: 18px;
  font-weight: 700;
}

.form-timeline-step:hover .form-timeline-step-circle {
  transform: scale(1.05);
  border-color: rgba(11,92,255,0.4);
}

.form-timeline-step.current:hover .form-timeline-step-circle {
  transform: scale(1.15);
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
  .form-timeline-step {
    min-width: 80px;
    padding: 0 8px;
  }
  .form-timeline-step-circle {
    width: 36px;
    height: 36px;
    font-size: 13px;
  }
  .form-timeline-connector {
    left: -8px;
    right: calc(100% - 18px);
  }
}
      `}</style>
      <div className="form-container">
        {/* Top navigation with glassmorphism timeline */}
        <div className="form-top-nav">
          <div className="form-timeline-wrapper">
            <div className="form-steps-row">
              {Array.from({ length: totalPages }, (_, idx) => {
                const page = idx + 1;
                const status = renderStepStatus(idx);
                const isCompleted = status === "completed";
                const isCurrent = status === "current";
                const prevStatus = idx > 0 ? renderStepStatus(idx - 1) : null;
                const prevCompleted = prevStatus === "completed" || prevStatus === "current";
                const connectorCompleted = idx > 0 && prevCompleted;
                
                return (
                  <div
                    key={page}
                    className={`form-timeline-step ${status}`}
                    onClick={() => handleStepClick(page)}
                  >
                    {idx > 0 && (
                      <div className={`form-timeline-connector ${connectorCompleted ? 'completed' : 'upcoming'}`} />
                    )}
                    <div className="form-timeline-step-circle">
                      {!isCompleted && page}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
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
            <h1 className="form-title">{additionalHolderSchema.document.title}</h1>
            <p className="form-subtitle">{additionalHolderSchema.document.subtitle || "Complete all pages to submit"}</p>
          </div>

          {/* Form Card */}
          <div
            key={currentPage}
            style={{
              opacity: 1,
              transition: "opacity 150ms ease-in-out",
            }}
          >
            <StepContainer 
              title={currentSection.title}
              hideTitle={currentSection.sectionId === "step1_additional_holder_info" || 
                         currentSection.sectionId === "step2_signature"}
            >
              <div className="space-y-6">
                {/* Page-level error summary */}
                {Object.keys(validation.errors).length > 0 && (
                  <StepErrorSummary errors={validation.errors} />
                )}
                
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
              isSavingNext={isSavingNext}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

