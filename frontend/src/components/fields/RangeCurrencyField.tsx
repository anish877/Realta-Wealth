import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ValidationError } from "../ValidationError";
import type { RangeCurrencyValue } from "../../types/additionalHolderForm";

interface RangeCurrencyFieldProps {
  id: string;
  label: string;
  fromValue: string | number | null | undefined;
  toValue: string | number | null | undefined;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  onBlur?: () => void;
  rangeLabels?: string[];
}

export function RangeCurrencyField({
  id,
  label,
  fromValue,
  toValue,
  onFromChange,
  onToChange,
  placeholder = "0.00",
  disabled = false,
  error,
  onBlur,
  rangeLabels = ["From $", "To $"],
}: RangeCurrencyFieldProps) {
  const fromStr = fromValue !== null && fromValue !== undefined ? String(fromValue) : "";
  const toStr = toValue !== null && toValue !== undefined ? String(toValue) : "";

  return (
    <div className="mb-6">
      <Label htmlFor={`${id}_from`} className="mb-2 block">
        {label}
      </Label>
      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <Label htmlFor={`${id}_from`} className="mb-1 block text-sm text-slate-600">
            {rangeLabels[0] || "From $"}
          </Label>
          <span className="absolute left-4 top-[2.1rem] text-slate-500">$</span>
          <Input
            id={`${id}_from`}
            type="text"
            value={fromStr}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9.]/g, "");
              onFromChange(val);
            }}
            onBlur={onBlur}
            placeholder={placeholder}
            className={`pl-8 ${error ? "border-red-500" : ""}`}
            disabled={disabled}
          />
        </div>
        <div className="relative">
          <Label htmlFor={`${id}_to`} className="mb-1 block text-sm text-slate-600">
            {rangeLabels[1] || "To $"}
          </Label>
          <span className="absolute left-4 top-[2.1rem] text-slate-500">$</span>
          <Input
            id={`${id}_to`}
            type="text"
            value={toStr}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9.]/g, "");
              onToChange(val);
            }}
            onBlur={onBlur}
            placeholder={placeholder}
            className={`pl-8 ${error ? "border-red-500" : ""}`}
            disabled={disabled}
          />
        </div>
      </div>
      <ValidationError error={error} fieldId={id} />
    </div>
  );
}

