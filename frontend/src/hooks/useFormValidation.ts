import { useState, useCallback, useMemo } from "react";
import { ZodError } from "zod";
import { validateStep } from "../validators/investorProfileValidators";
import type { FormData } from "../types/form";

export interface ValidationErrors {
  [fieldId: string]: string;
}

export interface ValidationState {
  errors: ValidationErrors;
  touched: Set<string>;
  isValid: boolean;
  isValidating: boolean;
}

export interface UseFormValidationOptions {
  formData: FormData;
  currentStep?: number;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface UseFormValidationReturn {
  // State
  errors: ValidationErrors;
  touched: Set<string>;
  isValid: boolean;
  isValidating: boolean;

  // Actions
  validateField: (fieldId: string, value: any) => void;
  validateStep: (stepNumber: number) => { isValid: boolean; errors: ValidationErrors };
  validateAll: () => { isValid: boolean; errors: ValidationErrors };
  setTouched: (fieldId: string, touched: boolean) => void;
  clearErrors: () => void;
  clearFieldError: (fieldId: string) => void;
  getFieldError: (fieldId: string) => string | undefined;
  hasFieldError: (fieldId: string) => boolean;
}

/**
 * Hook for managing form validation state and validation logic
 */
export function useFormValidation({
  formData,
  currentStep,
  validateOnChange = false,
  validateOnBlur = true,
}: UseFormValidationOptions): UseFormValidationReturn {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouchedState] = useState<Set<string>>(new Set());
  const [isValidating, setIsValidating] = useState(false);

  // Check if form is currently valid
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  /**
   * Validate a single field
   */
  const validateField = useCallback(
    (fieldId: string, value: any) => {
      if (!currentStep) return;

      setIsValidating(true);

      try {
        // Validate the current step with updated field value
        const updatedFormData = { ...formData, [fieldId]: value };
        const result = validateStep(currentStep, updatedFormData);

        if (result.isValid) {
          // Remove error for this field
          setErrors((prev) => {
            const next = { ...prev };
            delete next[fieldId];
            return next;
          });
        } else {
          // Update errors for this field
          setErrors((prev) => {
            const next = { ...prev };
            // Find error for this field (may have different path due to prefix)
            const fieldError = Object.entries(result.errors).find(([path]) => {
              // Handle prefixed fields (primary_, secondary_)
              if (fieldId.startsWith("primary_")) {
                return path === fieldId.replace("primary_", "");
              }
              if (fieldId.startsWith("secondary_")) {
                return path === fieldId.replace("secondary_", "");
              }
              return path === fieldId;
            });

            if (fieldError) {
              next[fieldId] = fieldError[1];
            } else {
              delete next[fieldId];
            }
            return next;
          });
        }
      } catch (err) {
        console.error("Validation error:", err);
      } finally {
        setIsValidating(false);
      }
    },
    [formData, currentStep]
  );

  /**
   * Validate an entire step
   */
  const validateStepNumber = useCallback(
    (stepNumber: number): { isValid: boolean; errors: ValidationErrors } => {
      setIsValidating(true);

      try {
        const result = validateStep(stepNumber, formData);

        // Map errors to field IDs (handle prefix for step 3/4)
        const mappedErrors: ValidationErrors = {};
        Object.entries(result.errors).forEach(([path, message]) => {
          let fieldId = path;

          // Map step 3 errors to primary_ prefixed fields
          if (stepNumber === 3 && !path.startsWith("primary_")) {
            fieldId = `primary_${path}`;
          }

          // Map step 4 errors to secondary_ prefixed fields
          if (stepNumber === 4 && !path.startsWith("secondary_")) {
            fieldId = `secondary_${path}`;
          }

          mappedErrors[fieldId] = message;
        });

        setErrors(mappedErrors);
        setIsValidating(false);

        return {
          isValid: result.isValid,
          errors: mappedErrors,
        };
      } catch (err) {
        console.error("Step validation error:", err);
        setIsValidating(false);
        return { isValid: false, errors: {} };
      }
    },
    [formData]
  );

  /**
   * Validate all steps
   */
  const validateAll = useCallback((): { isValid: boolean; errors: ValidationErrors } => {
    setIsValidating(true);

    try {
      const allErrors: ValidationErrors = {};

      // Validate each step
      for (let step = 1; step <= 7; step++) {
        const result = validateStep(step, formData);

        // Map errors to field IDs
        Object.entries(result.errors).forEach(([path, message]) => {
          let fieldId = path;

          if (step === 3 && !path.startsWith("primary_")) {
            fieldId = `primary_${path}`;
          }

          if (step === 4 && !path.startsWith("secondary_")) {
            fieldId = `secondary_${path}`;
          }

          allErrors[fieldId] = message;
        });
      }

      setErrors(allErrors);
      setIsValidating(false);

      return {
        isValid: Object.keys(allErrors).length === 0,
        errors: allErrors,
      };
    } catch (err) {
      console.error("Full validation error:", err);
      setIsValidating(false);
      return { isValid: false, errors: {} };
    }
  }, [formData]);

  /**
   * Mark a field as touched
   */
  const setTouched = useCallback((fieldId: string, isTouched: boolean) => {
    setTouchedState((prev) => {
      const next = new Set(prev);
      if (isTouched) {
        next.add(fieldId);
      } else {
        next.delete(fieldId);
      }
      return next;
    });

    // Validate on blur if enabled
    if (isTouched && validateOnBlur && currentStep) {
      validateField(fieldId, formData[fieldId]);
    }
  }, [validateOnBlur, currentStep, validateField, formData]);

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * Clear error for a specific field
   */
  const clearFieldError = useCallback((fieldId: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  }, []);

  /**
   * Get error message for a field
   */
  const getFieldError = useCallback(
    (fieldId: string): string | undefined => {
      return errors[fieldId];
    },
    [errors]
  );

  /**
   * Check if a field has an error
   */
  const hasFieldError = useCallback(
    (fieldId: string): boolean => {
      return !!errors[fieldId];
    },
    [errors]
  );

  return {
    // State
    errors,
    touched,
    isValid,
    isValidating,

    // Actions
    validateField,
    validateStep: validateStepNumber,
    validateAll,
    setTouched,
    clearErrors,
    clearFieldError,
    getFieldError,
    hasFieldError,
  };
}

