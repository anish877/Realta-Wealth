import { useState, useCallback, useMemo } from "react";
import { z } from "zod";
import { step1Schema, step2Schema } from "../validators/statementValidators";
import type { FieldValue } from "../types/statementForm";

interface ValidationErrors {
  [fieldId: string]: string;
}

interface UseStatementFormValidationOptions {
  formData: Record<string, FieldValue>;
  currentPage: number;
}

export function useStatementFormValidation({
  formData,
  currentPage,
}: UseStatementFormValidationOptions) {
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Get the appropriate schema for the current page
  const currentSchema = useMemo(() => {
    if (currentPage === 0) {
      return step1Schema;
    } else if (currentPage === 1) {
      return step2Schema;
    }
    return null;
  }, [currentPage]);

  // Validate a single field
  const validateField = useCallback(
    (fieldId: string): string | undefined => {
      if (!currentSchema) {
        return undefined;
      }

      try {
        // Validate the entire form data to get accurate field-level errors
        // This ensures cross-field validation works correctly
        currentSchema.parse(formData);
        
        // If validation passes, check if there's a stored error for this field
        return validationErrors[fieldId];
      } catch (error) {
        if (error instanceof z.ZodError) {
          // Find the error for this specific field
          const fieldError = error.errors.find((e) => {
            const path = e.path.join(".");
            return path === fieldId || path.endsWith(`.${fieldId}`) || path.startsWith(`${fieldId}.`);
          });
          return fieldError?.message;
        }
        return undefined;
      }
    },
    [currentSchema, formData, validationErrors]
  );

  // Validate the entire current page
  const validatePage = useCallback((): { isValid: boolean; errors: ValidationErrors } => {
    if (!currentSchema) {
      return { isValid: true, errors: {} };
    }

    try {
      currentSchema.parse(formData);
      setValidationErrors({});
      return { isValid: true, errors: {} };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: ValidationErrors = {};
        
        error.errors.forEach((err) => {
          const fieldPath = err.path.join(".");
          if (fieldPath) {
            errors[fieldPath] = err.message;
          }
        });
        
        setValidationErrors(errors);
        return { isValid: false, errors };
      }
      
      return { isValid: true, errors: {} };
    }
  }, [currentSchema, formData]);

  // Mark a field as touched
  const setTouched = useCallback((fieldId: string, touched: boolean = true) => {
    setTouchedFields((prev) => {
      const next = new Set(prev);
      if (touched) {
        next.add(fieldId);
      } else {
        next.delete(fieldId);
      }
      return next;
    });
  }, []);

  // Get error for a specific field
  const getFieldError = useCallback(
    (fieldId: string): string | undefined => {
      if (!touchedFields.has(fieldId)) {
        return undefined;
      }
      return validationErrors[fieldId];
    },
    [touchedFields, validationErrors]
  );

  // Clear all errors
  const clearErrors = useCallback(() => {
    setValidationErrors({});
    setTouchedFields(new Set());
  }, []);

  // Validate on blur
  const handleBlur = useCallback(
    (fieldId: string) => {
      setTouched(fieldId, true);
      const error = validateField(fieldId);
      if (error) {
        setValidationErrors((prev) => ({ ...prev, [fieldId]: error }));
      } else {
        setValidationErrors((prev) => {
          const next = { ...prev };
          delete next[fieldId];
          return next;
        });
      }
    },
    [setTouched, validateField]
  );

  return {
    validatePage,
    validateField,
    getFieldError,
    setTouched,
    handleBlur,
    clearErrors,
    touchedFields,
    errors: validationErrors,
  };
}

