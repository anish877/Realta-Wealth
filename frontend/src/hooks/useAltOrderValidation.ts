import { useState, useCallback, useMemo } from "react";
import { validateAltOrderForm } from "../validators/altOrderValidators";
import type { AltOrderFormData } from "../types/altOrderForm";

export interface ValidationErrors {
  [fieldId: string]: string;
}

export interface ValidationState {
  errors: ValidationErrors;
  touched: Set<string>;
  isValid: boolean;
  isValidating: boolean;
}

export interface UseAltOrderValidationOptions {
  formData: AltOrderFormData;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface UseAltOrderValidationReturn {
  // State
  errors: ValidationErrors;
  touched: Set<string>;
  isValid: boolean;
  isValidating: boolean;

  // Actions
  validateField: (fieldId: string, value: any) => void;
  validateAll: () => { isValid: boolean; errors: ValidationErrors };
  setTouched: (fieldId: string, touched: boolean) => void;
  clearErrors: () => void;
  clearFieldError: (fieldId: string) => void;
  getFieldError: (fieldId: string) => string | undefined;
  hasFieldError: (fieldId: string) => boolean;
}

/**
 * Hook for managing Alternative Investment Order form validation state and validation logic
 */
export function useAltOrderValidation({
  formData,
  validateOnChange = false,
  validateOnBlur = true,
}: UseAltOrderValidationOptions): UseAltOrderValidationReturn {
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
      setIsValidating(true);

      try {
        // Validate the entire form with updated field value
        const updatedFormData = { ...formData, [fieldId]: value };
        const result = validateAltOrderForm(updatedFormData);

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
            const fieldError = result.errors[fieldId];
            if (fieldError) {
              next[fieldId] = fieldError;
            } else {
              delete next[fieldId];
            }
            return next;
          });
        }
      } catch (error) {
        console.error("Validation error:", error);
      } finally {
        setIsValidating(false);
      }
    },
    [formData]
  );

  /**
   * Validate entire form
   */
  const validateAll = useCallback(() => {
    setIsValidating(true);

    try {
      const result = validateAltOrderForm(formData);
      setErrors(result.errors);
      return result;
    } catch (error) {
      console.error("Validation error:", error);
      return { isValid: false, errors: {} };
    } finally {
      setIsValidating(false);
    }
  }, [formData]);

  /**
   * Mark a field as touched
   */
  const setTouched = useCallback((fieldId: string, touched: boolean) => {
    setTouchedState((prev) => {
      const next = new Set(prev);
      if (touched) {
        next.add(fieldId);
      } else {
        next.delete(fieldId);
      }
      return next;
    });
  }, []);

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
   * Get error for a specific field
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
      return fieldId in errors;
    },
    [errors]
  );

  return {
    errors,
    touched,
    isValid,
    isValidating,
    validateField,
    validateAll,
    setTouched,
    clearErrors,
    clearFieldError,
    getFieldError,
    hasFieldError,
  };
}

