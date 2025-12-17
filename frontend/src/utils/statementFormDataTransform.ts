/**
 * Form data transformation layer for Statement of Financial Condition form
 * Handles bidirectional transformation between JSON schema IDs and validator IDs
 */

import {
  transformToValidatorData,
  transformValidatorErrors,
  mapToValidatorId,
  mapToJsonId,
} from "./statementFieldMapping";
import type { FieldValue } from "../types/statementForm";

/**
 * Transform form data from JSON schema format to validator format
 */
export function transformFormDataForValidation(
  formData: Record<string, FieldValue>
): Record<string, FieldValue> {
  return transformToValidatorData(formData);
}

/**
 * Transform validator errors back to JSON schema field IDs for display
 */
export function transformErrorsForDisplay(
  validatorErrors: Record<string, string>
): Record<string, string> {
  return transformValidatorErrors(validatorErrors);
}

/**
 * Get validator field ID for a JSON schema field ID
 */
export function getValidatorFieldId(jsonFieldId: string): string {
  return mapToValidatorId(jsonFieldId);
}

/**
 * Get JSON schema field ID for a validator field ID
 */
export function getJsonFieldId(validatorFieldId: string): string {
  return mapToJsonId(validatorFieldId);
}

/**
 * Transform a single field value from JSON to validator format
 */
export function transformFieldForValidation(
  jsonFieldId: string,
  value: FieldValue
): { validatorId: string; value: FieldValue } {
  return {
    validatorId: mapToValidatorId(jsonFieldId),
    value,
  };
}

/**
 * Transform a single field value from validator to JSON format
 */
export function transformFieldForDisplay(
  validatorFieldId: string,
  value: FieldValue
): { jsonId: string; value: FieldValue } {
  return {
    jsonId: mapToJsonId(validatorFieldId),
    value,
  };
}

