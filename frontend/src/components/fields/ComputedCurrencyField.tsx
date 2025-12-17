import { CurrencyField } from "./CurrencyField";
import { formatCurrency } from "../../utils/statementValidation";
import type { FieldValue } from "../../types/statementForm";

export type ComputedFieldMode = "computed" | "computed_or_manual";

interface ComputedCurrencyFieldProps {
  id: string;
  label: string;
  computedValue: number;
  formData: Record<string, FieldValue>;
  updateField: (fieldId: string, value: FieldValue) => void;
  mode?: ComputedFieldMode;
  disabled?: boolean;
  error?: string;
  warning?: string;
  onBlur?: (fieldId: string) => void;
}

export function ComputedCurrencyField({
  id,
  label,
  computedValue,
  formData,
  updateField,
  mode = "computed_or_manual",
  disabled = false,
  error,
  warning,
  onBlur,
}: ComputedCurrencyFieldProps) {
  const currentValue = formData[id];
  const hasManualValue = currentValue !== null && currentValue !== undefined && currentValue !== "";
  const displayValue = hasManualValue ? String(currentValue) : computedValue.toFixed(2);
  const isComputed = mode === "computed" || (!hasManualValue && mode === "computed_or_manual");
  const showWarning = warning && hasManualValue;

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-1">
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
        </label>
        {isComputed && (
          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            Auto-calculated
          </span>
        )}
      </div>
      
      <CurrencyField
        id={id}
        label=""
        value={displayValue}
        onChange={(val) => updateField(id, val)}
        onBlur={() => onBlur?.(id)}
        disabled={disabled || isComputed}
        error={error}
      />
      
      {showWarning && (
        <p className="mt-1 text-xs text-amber-600">{warning}</p>
      )}
      
      {isComputed && !hasManualValue && (
        <p className="mt-1 text-xs text-slate-500">
          Computed value: {formatCurrency(computedValue)}
        </p>
      )}
    </div>
  );
}

