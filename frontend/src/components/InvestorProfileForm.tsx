import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import formSchema from "../REI-Investor-Profile-v20240101-1.json";
import { EnhancedProgressBar } from "./EnhancedProgressBar";
import { StepContainer } from "./steps/StepContainer";
import { FormNavigation } from "./FormNavigation";
import { FieldRenderer } from "./FieldRenderer";
import { ConditionalFieldManager } from "./ConditionalFieldManager";
import { useAuth } from "../contexts/AuthContext";
import {
  createProfile,
  getProfile,
  updateStep,
  submitProfile,
} from "../api";
import {
  transformStep1,
  transformStep2,
  transformStep3,
  transformStep4,
  transformStep5,
  transformStep6,
  transformStep7,
} from "../utils/formDataToBackend";
import { transformProfileToFormData } from "../utils/backendToFormData";
import { useToast, ToastContainer } from "./Toast";
import { Button } from "./ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import type { FieldValue, FormData } from "../types/form";
import { useFormValidation } from "../hooks/useFormValidation";
import { StepErrorSummary } from "./ValidationError";
import { FormSkeleton } from "./FormSkeleton";

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
  options?: string[] | { key: string; label: string }[];
  other_field_id?: string;
  fields?: Field[];
  repeatable?: boolean;
  notes?: string;
}

interface Section {
  sectionId: string;
  title: string;
  page: number;
  fields: Field[];
}

interface InvestorProfileFormProps {
  clientId?: string;
}

export default function InvestorProfileForm({ clientId }: InvestorProfileFormProps = {}) {
  const { isAuthenticated } = useAuth();
  const { toasts, showToast, removeToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract profileId from URL pathname (handles both /app/profile/:id and /app/clients/:clientId/forms/profile/:id)
  const profileIdFromUrl = useMemo(() => {
    const pathMatch = location.pathname.match(/\/profile\/([^/]+)/);
    if (pathMatch && pathMatch[1]) {
      const id = pathMatch[1];
      return id === "new" ? null : id;
    }
    return null;
  }, [location.pathname]);

  // Extract clientId from URL if not provided as prop
  const clientIdFromUrl = useMemo(() => {
    const pathMatch = location.pathname.match(/\/clients\/([^/]+)/);
    return pathMatch ? pathMatch[1] : null;
  }, [location.pathname]);

  const effectiveClientId = clientId || clientIdFromUrl;
  
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({});
  const [profileId, setProfileId] = useState<string | null>(profileIdFromUrl);
  const [hasLoadedProfile, setHasLoadedProfile] = useState<string | null>(null); // Track which profile we've loaded
  const [isLoading, setIsLoading] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>({ status: "idle" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingNext, setIsSavingNext] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [lastCompletedStep, setLastCompletedStep] = useState<number>(0);

  const getStepNumberFromSection = (sectionId: string | undefined): number | null => {
    if (!sectionId) return null;
    const match = sectionId.match(/step(\d+)/);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    return null;
  };

  const allSections = (formSchema as any).schema as Section[];
  
  // Filter sections based on conditional logic (but keep Step 1 even if Retirement is checked)
  const sections = useMemo(() => {
    return allSections.filter((section) => {
      // Don't skip Step 1 - we'll disable fields instead
      // Step 4 should only show if Joint Account or Trust is selected
      if (section.sectionId === "step4_secondary_account_holder" || 
          section.sectionId === "step4_secondary_continued") {
        return ConditionalFieldManager.shouldShowStep(4, formData);
      }
      return true;
    });
  }, [allSections, formData]);
  
  const totalSteps = sections.length;
  
  // Check if Step 1 should be disabled (Retirement checked)
  const isStep1Disabled = ConditionalFieldManager.shouldSkipStep1(formData);
  
  // Map current step to actual section index
  const effectiveStep = currentStep >= sections.length ? sections.length - 1 : currentStep;
  const currentSection = sections[effectiveStep];

  // Get current step number for validation
  const currentStepNumber = getStepNumberFromSection(currentSection?.sectionId);

  // Form validation hook
  const validation = useFormValidation({
    formData,
    currentStep: currentStepNumber || undefined,
    validateOnBlur: true,
    validateOnChange: false,
  });

  // Load profile when profileIdFromUrl changes - this ensures we load saved data when clicking Continue
  // Note: Since there's only one profile per user, "new" will actually update the existing profile
  useEffect(() => {
    if (profileIdFromUrl && isAuthenticated && profileIdFromUrl !== hasLoadedProfile) {
      // URL has a profileId and we haven't loaded it yet - load it now
      setProfileId(profileIdFromUrl);
      loadProfile(profileIdFromUrl);
    } else if (!profileIdFromUrl && isAuthenticated) {
      // URL doesn't have profileId (new profile route) - reset state
      // The backend will handle updating existing profile when createProfile is called
      setProfileId(null);
      setFormData({});
      setHasLoadedProfile(null);
    }
  }, [profileIdFromUrl, isAuthenticated, hasLoadedProfile]);

  const loadProfile = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await getProfile(id);
      const backendData = response.data;
      const transformedData = transformProfileToFormData(backendData);
      console.log("Loading profile:", id, "Transformed data:", transformedData);
      
      // Set form data FIRST before updating other state
      setFormData(transformedData);
      setProfileId(id);
      setHasLoadedProfile(id);

      const statusMap = (backendData as any).stepCompletionStatus || {};
      const completed = new Set<number>();
      Object.entries(statusMap).forEach(([key, value]) => {
        if ((value as any)?.completed) {
          completed.add(parseInt(key, 10));
        }
      });
      setCompletedSteps(completed);
      const backendLast = backendData.lastCompletedStep || (completed.size ? Math.max(...completed) : 0);
      setLastCompletedStep(backendLast);

      // determine resume step
      const resumeStep = Math.min(
        sections.length,
        Math.max(1, backendLast ? backendLast + 1 : completed.size + 1)
      );
      setCurrentStep(resumeStep - 1);
    } catch (error: any) {
      console.error("Error loading profile:", error);
      showToast("Failed to load profile data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const saveStep = useCallback(
    async (stepNumber: number, showNotification = true, silent = false) => {
      setSaveState({ status: "saving" });

      const buildPayload = () => {
        switch (stepNumber) {
          case 1:
            return transformStep1(formData);
          case 2:
            return transformStep2(formData);
          case 3:
            return transformStep3(formData);
          case 4:
            return transformStep4(formData);
          case 5:
            return transformStep5(formData);
          case 6:
            return transformStep6(formData);
          case 7:
            return transformStep7(formData);
          default:
            return null;
        }
      };

      const payload = buildPayload();
      if (!payload) return;

      let lastError: any = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          let responseData;
          if (profileId) {
            const response = await updateStep(profileId, stepNumber, payload);
            responseData = response.data;
          } else {
            if (stepNumber !== 1) {
              throw new Error("Please complete Step 1 to create a profile before saving other steps.");
            }
            const response = await createProfile(payload, effectiveClientId);
            responseData = response.data;
            const newProfileId = response.data.id;
            setProfileId(newProfileId);
            // Update URL to include profileId so form reloads correctly when navigating back
            if (effectiveClientId) {
              navigate(`/app/clients/${effectiveClientId}/forms/profile/${newProfileId}`, { replace: true });
            } else {
              navigate(`/app/profile/${newProfileId}`, { replace: true });
            }
          }

          const statusMap = (responseData as any).stepCompletionStatus || {};
          const completed = new Set<number>();
          Object.entries(statusMap).forEach(([key, value]) => {
            const num = parseInt(key, 10);
            if ((value as any)?.completed) {
              completed.add(num);
            }
          });

          setCompletedSteps(completed);
          setLastCompletedStep(responseData.lastCompletedStep || completed.size || stepNumber);
          setSaveState({ status: "success", timestamp: new Date() });
          if (showNotification && !silent) {
            showToast(`Step ${stepNumber} saved successfully`, "success");
          }
          return;
        } catch (error: any) {
          lastError = error;
          await new Promise((resolve) => setTimeout(resolve, 300 * Math.pow(2, attempt)));
        }
      }

      const message = lastError?.message || "Failed to save step";
      setSaveState({ status: "error", error: message });
      if (!silent) {
        showToast(message, "error");
      }
      console.error("Error saving step:", lastError);
    },
    [formData, profileId, showToast]
  );


  const saveCurrentStep = useCallback(async (showNotification = true) => {
    const stepNumber = getStepNumberFromSection(currentSection?.sectionId);
    if (stepNumber) {
      await saveStep(stepNumber, showNotification);
    }
  }, [currentSection, saveStep]);

  // Validate current step using Zod
  const validateCurrentStep = useCallback((): { isValid: boolean; errors: string[] } => {
    if (!currentStepNumber) {
      return { isValid: true, errors: [] };
    }

    const result = validation.validateStep(currentStepNumber);
    const errorMessages = Object.values(result.errors);

    return {
      isValid: result.isValid,
      errors: errorMessages,
    };
  }, [currentStepNumber, validation]);

  const updateField = (fieldId: string, value: FieldValue) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    // Validate field on change if it's been touched
    if (validation.touched.has(fieldId)) {
      validation.validateField(fieldId, value);
    }
  };

  const updateArrayField = (fieldId: string, option: string, checked: boolean) => {
    setFormData((prev) => {
      const current = (prev[fieldId] as string[]) || [];
      if (checked) {
        return { ...prev, [fieldId]: [...current, option] };
      } else {
        return { ...prev, [fieldId]: current.filter((v) => v !== option) };
      }
    });
  };

  const addRepeatableGroup = (fieldId: string) => {
    setFormData((prev) => {
      const current = (prev[fieldId] as Record<string, any>[]) || [];
      return { ...prev, [fieldId]: [...current, {}] };
    });
  };

  const progress = ((effectiveStep + 1) / totalSteps) * 100;

  const handleNext = () => {
    // Validate current step before allowing navigation
    if (currentStepNumber) {
      const validationResult = validation.validateStep(currentStepNumber);
      if (!validationResult.isValid) {
        // Mark all fields as touched to show errors
        Object.keys(validationResult.errors).forEach((fieldId) => {
          validation.setTouched(fieldId, true);
        });
        showToast("Please fix the errors before continuing", "error");
        return;
      }
    }

    if (effectiveStep < totalSteps - 1) {
      setCurrentStep(effectiveStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleManualSave = async () => {
    await saveCurrentStep(true);
  };

  const handlePrevious = () => {
    if (effectiveStep > 0) {
      setCurrentStep(effectiveStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async () => {
    if (!profileId) {
      showToast("Please save the form first before submitting.", "warning");
      return;
    }

    // Validate all steps before final submit
    const allValidation = validation.validateAll();
    if (!allValidation.isValid) {
      // Mark all fields with errors as touched so they show inline
      Object.keys(allValidation.errors).forEach((fieldId) => {
        validation.setTouched(fieldId, true);
      });
      showToast("Please fix the errors before submitting.", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      // Save current step first
      await saveCurrentStep(false);
      
      // Submit profile
      await submitProfile(profileId);
      showToast("Profile submitted successfully!", "success");
      
      // Update completed steps
      setCompletedSteps((prev) => new Set([...prev, getStepNumberFromSection(currentSection?.sectionId) || 0]));
    } catch (error: any) {
      showToast(error.message || "Failed to submit profile", "error");
      console.error("Error submitting profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStepClick = useCallback(
    (step: number) => {
      const targetStep = step - 1;
      if (targetStep < 0 || targetStep >= totalSteps || targetStep === effectiveStep) return;

      setCurrentStep(targetStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [effectiveStep, totalSteps]
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Authentication Required</h2>
          <p className="text-slate-600">Please log in to access the investor profile form.</p>
        </div>
      </div>
    );
  }

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
    return <div>Loading...</div>;
  }

  const renderStepStatus = (stepIndex: number) => {
    const stepNumber = stepIndex + 1;
    const isCompleted = completedSteps.has(stepNumber);
    const isCurrent = effectiveStep === stepIndex;
    if (isCurrent) return "current";
    if (isCompleted) return "completed";
    return "upcoming";
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

.form-status-bar {
  background: linear-gradient(180deg, #ffffff 0%, #f8faff 100%);
  border: 1px solid rgba(11,92,255,0.12);
  border-radius: 16px;
  padding: 16px 20px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  box-shadow: 0 4px 16px rgba(11,92,255,0.04);
}

.form-status-text {
  font-size: 13px;
  font-weight: 500;
  color: var(--muted);
}

.form-status-text.saving {
  color: var(--primary);
}

.form-status-text.saved {
  color: #22c55e;
}

.form-status-text.error {
  color: #ef4444;
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
              {sections.map((section, idx) => {
                const status = renderStepStatus(idx);
                const isCompleted = status === "completed";
                const isCurrent = status === "current";
                const prevStatus = idx > 0 ? renderStepStatus(idx - 1) : null;
                const prevCompleted = prevStatus === "completed" || prevStatus === "current";
                const connectorCompleted = idx > 0 && prevCompleted;
                
                return (
                  <div
                    key={section.sectionId}
                    className={`form-timeline-step ${status}`}
                    onClick={() => handleStepClick(getStepNumberFromSection(section.sectionId) || idx + 1)}
                  >
                    {idx > 0 && (
                      <div className={`form-timeline-connector ${connectorCompleted ? 'completed' : 'upcoming'}`} />
                    )}
                    <div className="form-timeline-step-circle">
                      {!isCompleted && idx + 1}
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
            <h1 className="form-title">Investor Profile</h1>
            <p className="form-subtitle">Complete all steps to submit your profile</p>
          </div>

        {/* Form Card */}
        <div
          key={effectiveStep}
          style={{
            opacity: 1,
            transition: "opacity 150ms ease-in-out",
          }}
        >
          <StepContainer 
          title={currentSection.title}
          hideTitle={currentSection.sectionId === "step2_patriot_act" || 
                     currentSection.sectionId === "step5_objectives_investment_detail" ||
                     currentSection.sectionId === "step6_trusted_contact" ||
                     currentSection.sectionId === "step7_signatures"}
          isDisabled={currentSection.sectionId === "step1_account_registration" && isStep1Disabled}
        >
          {currentSection.sectionId === "step1_account_registration" && isStep1Disabled && (
            <div className="form-notification">
              <style>{`
.form-notification {
  margin-bottom: 24px;
  padding: 16px 20px;
  background: rgba(11,92,255,0.08);
  border: 1px solid rgba(11,92,255,0.2);
  border-radius: 12px;
}

.form-notification p {
  font-size: 13px;
  font-weight: 500;
  color: var(--primary);
  margin: 0;
  line-height: 1.5;
}

.form-notification strong {
  font-weight: 600;
}
              `}</style>
              <p>
                <strong>Retirement Account Selected:</strong> Step 1 fields are disabled. Uncheck "Retirement" above to enable Step 1 fields.
              </p>
            </div>
          )}
          <div className="space-y-6">
            {/* Step-level error summary */}
            {currentStepNumber && Object.keys(validation.errors).length > 0 && (
              <StepErrorSummary errors={validation.errors} />
            )}
            
            {currentSection.fields.map((field) => {
              // Skip rendering individual fields that are part of AccountTypeSection
              if (
                currentSection.sectionId === "step1_account_registration" &&
                (field.id === "additional_designation_left" ||
                  field.id === "trust_block" ||
                  field.id === "retail_checkbox" ||
                  field.id === "type_of_account_right" ||
                  field.id === "other_account_type_text")
              ) {
                return null;
              }
              
              // Skip rendering individual fields that are part of PatriotActSection
              if (
                currentSection.sectionId === "step2_patriot_act" &&
                field.id === "initial_source_of_funds_other_text"
              ) {
                return null;
              }
              
              // Skip rendering individual investment knowledge fields from continued section that are merged into the table
              if (
                currentSection.sectionId === "step4_secondary_continued" &&
                (field.id === "secondary_alternative_investments_knowledge" ||
                  field.id === "secondary_other_investments_knowledge" ||
                  field.id === "secondary_alternative_investments_since" ||
                  field.id === "secondary_other_investments_since")
              ) {
                return null;
              }
              
              // Skip rendering primary Other investment fields that are merged into the knowledge table
              if (
                currentSection.sectionId === "step3_primary_continued" &&
                (field.id === "other_investment_knowledge_value" ||
                  field.id === "other_investment_since_year")
              ) {
                return null;
              }
              
              // Skip rendering individual fields that are part of ObjectivesSection
              if (
                currentSection.sectionId === "step5_objectives_investment_detail" &&
                (field.id === "account_investment_objectives" ||
                  field.id === "other_investments_see_attached" ||
                  field.id === "other_investments_table" ||
                  field.id === "investment_time_horizon_liquidity")
              ) {
                return null;
              }
              
              // Skip rendering individual fields that are part of TrustedContactSection
              if (
                currentSection.sectionId === "step6_trusted_contact" &&
                (field.id === "trusted_contact_name" ||
                  field.id === "trusted_contact_email" ||
                  field.id === "trusted_contact_home_phone" ||
                  field.id === "trusted_contact_business_phone" ||
                  field.id === "trusted_contact_mobile_phone" ||
                  field.id === "trusted_contact_mailing_address" ||
                  field.id === "trusted_contact_city" ||
                  field.id === "trusted_contact_state_province" ||
                  field.id === "trusted_contact_zip_postal_code" ||
                  field.id === "trusted_contact_country")
              ) {
                return null;
              }
              
              // Skip rendering individual fields that are part of SignaturesSection (handled together)
              if (
                currentSection.sectionId === "step7_signatures" &&
                (field.id === "account_owner_signature" ||
                  field.id === "account_owner_printed_name" ||
                  field.id === "account_owner_date" ||
                  field.id === "joint_account_owner_signature" ||
                  field.id === "joint_account_owner_printed_name" ||
                  field.id === "joint_account_owner_date" ||
                  field.id === "financial_professional_signature" ||
                  field.id === "financial_professional_printed_name" ||
                  field.id === "financial_professional_date" ||
                  field.id === "supervisor_principal_signature" ||
                  field.id === "supervisor_principal_printed_name" ||
                  field.id === "supervisor_principal_date")
              ) {
                return null;
              }
              
              // Skip rendering individual address component fields (handled as AddressFieldGroup)
              // Note: We keep primary_legal_address, primary_mailing_address, secondary_legal_address, 
              // secondary_mailing_address, and employer_address fields so AddressFieldGroup can render
              if (
                (currentSection.sectionId === "step3_primary_account_holder" ||
                 currentSection.sectionId === "step3_primary_continued" ||
                 currentSection.sectionId === "step4_secondary_account_holder" ||
                 currentSection.sectionId === "step4_secondary_continued") &&
                (field.id === "primary_city" ||
                  field.id === "primary_state_province" ||
                  field.id === "primary_zip_postal_code" ||
                  field.id === "primary_country" ||
                  field.id === "primary_mailing_same_as_legal" ||
                  field.id === "primary_mailing_city" ||
                  field.id === "primary_mailing_state_province" ||
                  field.id === "primary_mailing_zip_postal_code" ||
                  field.id === "primary_mailing_country" ||
                  field.id === "primary_employer_city" ||
                  field.id === "primary_employer_state_province" ||
                  field.id === "primary_employer_zip_postal_code" ||
                  field.id === "primary_employer_country" ||
                  field.id === "secondary_city" ||
                  field.id === "secondary_state_province" ||
                  field.id === "secondary_zip_postal_code" ||
                  field.id === "secondary_country" ||
                  field.id === "secondary_mailing_same_as_legal" ||
                  field.id === "secondary_mailing_address" ||
                  field.id === "secondary_mailing_city" ||
                  field.id === "secondary_mailing_state_province" ||
                  field.id === "secondary_mailing_zip_postal_code" ||
                  field.id === "secondary_mailing_country" ||
                  field.id === "secondary_employer_city" ||
                  field.id === "secondary_employer_state_province" ||
                  field.id === "secondary_employer_zip_postal_code" ||
                  field.id === "secondary_employer_country")
              ) {
                return null;
              }
              
              // Skip rendering individual phone fields (handled as PhoneFieldsGroup)
              if (
                (currentSection.sectionId === "step3_primary_account_holder" ||
                 currentSection.sectionId === "step4_secondary_account_holder" ||
                 currentSection.sectionId === "step6_trusted_contact") &&
                (field.id === "primary_home_phone" ||
                  field.id === "primary_business_phone" ||
                  field.id === "primary_mobile_phone" ||
                  field.id === "secondary_home_phone" ||
                  field.id === "secondary_business_phone" ||
                  field.id === "secondary_mobile_phone" ||
                  field.id === "trusted_contact_home_phone" ||
                  field.id === "trusted_contact_business_phone" ||
                  field.id === "trusted_contact_mobile_phone")
              ) {
                return null;
              }
              
              // Allow Retirement checkbox and header fields to be changed even when Step 1 is disabled
              // These fields should remain enabled even when Retirement is checked
              const alwaysEnabledFields = ["retirement_checkbox", "rr_name", "rr_no", "customer_names", "account_no"];
              const isAlwaysEnabled = alwaysEnabledFields.includes(field.id);
              // Disable Step 1 fields when Retirement is checked, except for the always-enabled fields
              const isDisabled = currentSection.sectionId === "step1_account_registration" && 
                                isStep1Disabled && 
                                !isAlwaysEnabled;
              
              // Render always-enabled fields (Retirement checkbox and header fields) with explicit disabled={false}
              if (isAlwaysEnabled) {
                return (
                  <FieldRenderer
                    key={field.id}
                    field={field}
                    value={formData[field.id] || ""}
                    onChange={(value) => updateField(field.id, value)}
                  onBlur={() => validation.setTouched(field.id, true)}
                    onRepeatableAdd={addRepeatableGroup}
                    formData={formData}
                    updateField={updateField}
                    disabled={false}
                  error={validation.getFieldError(field.id)}
                  />
                );
              }
              
              return (
                <FieldRenderer
                  key={field.id}
                  field={field}
                  value={formData[field.id] || ""}
                  onChange={(value) => updateField(field.id, value)}
                  onBlur={() => validation.setTouched(field.id, true)}
                  onRepeatableAdd={addRepeatableGroup}
                  formData={formData}
                  updateField={updateField}
                  disabled={isDisabled}
                  error={validation.getFieldError(field.id)}
                />
              );
            })}
          </div>
        </StepContainer>
        </div>

        {/* Navigation */}
        <FormNavigation
          currentStep={effectiveStep}
          totalSteps={totalSteps}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          isSavingNext={isSavingNext}
        />
        </div>
      </div>
    </div>
  );
}

