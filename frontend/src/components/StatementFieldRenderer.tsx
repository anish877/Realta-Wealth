import { TextField } from "./fields/TextField";
import { TextareaField } from "./fields/TextareaField";
import { CurrencyField } from "./fields/CurrencyField";
import { DateField } from "./fields/DateField";
import { SignatureField } from "./fields/SignatureField";
import { ComputedCurrencyField } from "./fields/ComputedCurrencyField";
import { RepeatableRowsField } from "./fields/RepeatableRowsField";
import { FinancialTableField } from "./fields/FinancialTableField";
import { shouldShowStatementField } from "../utils/statementFieldDependencies";
import type { FieldValue, StatementField } from "../types/statementForm";

interface StatementFieldRendererProps {
  field: StatementField;
  formData: Record<string, FieldValue>;
  updateField: (fieldId: string, value: FieldValue) => void;
  errors?: Record<string, string>;
  onBlur?: (fieldId: string) => void;
  disabled?: boolean;
  computedValues?: Record<string, number>;
  computedWarnings?: Record<string, string>;
}

export function StatementFieldRenderer({
  field,
  formData,
  updateField,
  errors = {},
  onBlur,
  disabled = false,
  computedValues = {},
  computedWarnings = {},
}: StatementFieldRendererProps) {
  const fieldId = field.id || `${field.label.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
  const value = (formData[fieldId] as string) || "";
  const error = errors[fieldId];
  const computedValue = computedValues[fieldId];
  const warning = computedWarnings[fieldId];

  // Check if field should be visible
  if (!shouldShowStatementField(fieldId, formData)) {
    return null;
  }

  // Render based on field type
  switch (field.type) {
      case "textarea":
      return (
        <TextareaField
          id={fieldId}
          label={field.label}
          value={value}
          onChange={(val) => updateField(fieldId, val)}
          onBlur={() => onBlur?.(fieldId)}
          disabled={disabled}
          error={error}
          rows={5}
        />
      );

    case "currency":
      // Check if this is a computed field
      if (computedValue !== undefined) {
        return (
          <ComputedCurrencyField
            id={fieldId}
            label={field.label}
            computedValue={computedValue}
            formData={formData}
            updateField={updateField}
            mode="computed_or_manual"
            disabled={disabled}
            error={error}
            warning={warning}
            onBlur={onBlur}
          />
        );
      }
      return (
        <CurrencyField
          id={fieldId}
          label={field.label}
          value={value}
          onChange={(val) => updateField(fieldId, val)}
          onBlur={() => onBlur?.(fieldId)}
          disabled={disabled}
          error={error}
        />
      );

    case "date":
      return (
        <DateField
          id={fieldId}
          label={field.label}
          value={value}
          onChange={(val) => updateField(fieldId, val)}
          onBlur={() => onBlur?.(fieldId)}
          disabled={disabled}
          error={error}
        />
      );

    case "signature":
      return (
        <SignatureField
          id={fieldId}
          label={field.label}
          value={value}
          onChange={(val) => updateField(fieldId, val)}
        />
      );

    case "select":
      return (
        <div className="mb-4">
          <label htmlFor={fieldId} className="block text-sm font-medium text-slate-700 mb-1">
            {field.label}
          </label>
          <select
            id={fieldId}
            value={value}
            onChange={(e) => updateField(fieldId, e.target.value)}
            onBlur={() => onBlur?.(fieldId)}
            disabled={disabled}
            className={`w-full px-3 py-2 border rounded-md text-sm ${
              error ? "border-red-500" : "border-slate-300"
            } ${disabled ? "bg-slate-100" : ""}`}
          >
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
      );

    default:
      // Default to text field
      return (
        <TextField
          id={fieldId}
          label={field.label}
          value={value}
          onChange={(val) => updateField(fieldId, val)}
          onBlur={() => onBlur?.(fieldId)}
          disabled={disabled}
          error={error}
        />
      );
  }
}

