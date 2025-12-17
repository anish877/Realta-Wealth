import { useState, useCallback, useMemo } from "react";
import { validatePage } from "../validators/additionalHolderValidators";
import type { AdditionalHolderFormData } from "../types/additionalHolderForm";

export interface ValidationErrors {
  [fieldId: string]: string;
}

export interface ValidationState {
  errors: ValidationErrors;
  touched: Set<string>;
  isValid: boolean;
  isValidating: boolean;
}

export interface UseAdditionalHolderValidationOptions {
  formData: AdditionalHolderFormData;
  currentPage?: number;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface UseAdditionalHolderValidationReturn {
  // State
  errors: ValidationErrors;
  touched: Set<string>;
  isValid: boolean;
  isValidating: boolean;

  // Actions
  validateField: (fieldId: string, value: any) => void;
  validatePage: (pageNumber: number) => { isValid: boolean; errors: ValidationErrors };
  validateAll: () => { isValid: boolean; errors: ValidationErrors };
  setTouched: (fieldId: string, touched: boolean) => void;
  clearErrors: () => void;
  clearFieldError: (fieldId: string) => void;
  getFieldError: (fieldId: string) => string | undefined;
  hasFieldError: (fieldId: string) => boolean;
}

/**
 * Hook for managing Additional Holder form validation state and validation logic
 */
export function useAdditionalHolderValidation({
  formData,
  currentPage,
  validateOnChange = false,
  validateOnBlur = true,
}: UseAdditionalHolderValidationOptions): UseAdditionalHolderValidationReturn {
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
      if (!currentPage) return;

      setIsValidating(true);

      try {
        // Validate the current page with updated field value
        const updatedFormData = { ...formData, [fieldId]: value };
        const result = validatePage(currentPage, updatedFormData);

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
    [formData, currentPage]
  );

  /**
   * Validate a specific page
   */
  const validatePageNumber = useCallback(
    (pageNumber: number) => {
      setIsValidating(true);

      try {
        const result = validatePage(pageNumber, formData);
        setErrors(result.errors);
        return result;
      } catch (error) {
        console.error("Validation error:", error);
        return { isValid: false, errors: {} };
      } finally {
        setIsValidating(false);
      }
    },
    [formData]
  );

  /**
   * Validate all pages
   */
  const validateAll = useCallback(() => {
    setIsValidating(true);

    try {
      const allErrors: ValidationErrors = {};
      const page1Result = validatePage(1, formData);
      const page2Result = validatePage(2, formData);

      Object.assign(allErrors, page1Result.errors, page2Result.errors);
      setErrors(allErrors);

      return {
        isValid: Object.keys(allErrors).length === 0,
        errors: allErrors,
      };
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
    validatePage: validatePageNumber,
    validateAll,
    setTouched,
    clearErrors,
    clearFieldError,
    getFieldError,
    hasFieldError,
  };
}

