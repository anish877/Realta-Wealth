import { useState, useCallback, useMemo } from "react";
import { validateAccreditationForm } from "../validators/accreditationValidators";
import type { AccreditationFormData } from "../types/accreditationForm";

export interface ValidationErrors {
  [fieldId: string]: string;
}

export interface UseAccreditationValidationOptions {
  formData: AccreditationFormData;
}

export interface UseAccreditationValidationReturn {
  errors: ValidationErrors;
  touched: Set<string>;
  isValid: boolean;
  isValidating: boolean;
  validateField: (fieldId: string, value: any) => void;
  validateAll: () => { isValid: boolean; errors: ValidationErrors };
  setTouched: (fieldId: string, touched: boolean) => void;
  clearErrors: () => void;
  getFieldError: (fieldId: string) => string | undefined;
}

export function useAccreditationValidation({ formData }: UseAccreditationValidationOptions): UseAccreditationValidationReturn {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouchedState] = useState<Set<string>>(new Set());
  const [isValidating, setIsValidating] = useState(false);

  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  const validateAll = useCallback(() => {
    setIsValidating(true);
    try {
      const result = validateAccreditationForm(formData as Record<string, any>);
      setErrors(result.errors);
      return result;
    } finally {
      setIsValidating(false);
    }
  }, [formData]);

  const validateField = useCallback(
    (fieldId: string, value: any) => {
      setIsValidating(true);
      try {
        const updated = { ...formData, [fieldId]: value };
        const result = validateAccreditationForm(updated as Record<string, any>);
        setErrors((prev) => {
          const next = { ...prev };
          if (result.errors[fieldId]) {
            next[fieldId] = result.errors[fieldId];
          } else {
            delete next[fieldId];
          }
          return next;
        });
      } finally {
        setIsValidating(false);
      }
    },
    [formData]
  );

  const setTouched = useCallback((fieldId: string, isTouched: boolean) => {
    setTouchedState((prev) => {
      const next = new Set(prev);
      if (isTouched) next.add(fieldId);
      else next.delete(fieldId);
      return next;
    });
  }, []);

  const clearErrors = useCallback(() => setErrors({}), []);

  const getFieldError = useCallback((fieldId: string) => errors[fieldId], [errors]);

  return {
    errors,
    touched,
    isValid,
    isValidating,
    validateField,
    validateAll,
    setTouched,
    clearErrors,
    getFieldError,
  };
}

