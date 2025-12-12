import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useState } from "react";

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "tel";
  disabled?: boolean;
  required?: boolean;
  error?: string;
  isValid?: boolean;
  onBlur?: () => void;
}

export function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
  required = false,
  error,
  isValid,
  onBlur,
}: TextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value && value.length > 0;
  const showLabel = isFocused || hasValue;

  return (
    <div className="mb-6 relative">
      <div className="relative">
        <Input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          placeholder={showLabel ? undefined : placeholder || `Enter ${label.toLowerCase()}`}
          disabled={disabled}
          required={required}
          className={`
            ${showLabel ? "pt-6 pb-2" : ""}
            ${error ? "border-red-500" : isValid ? "border-green-500" : ""}
            transition-colors duration-100
          `}
        />
        {showLabel && (
          <Label
            htmlFor={id}
            className={`
              absolute left-3 top-2 text-xs font-medium
              ${error ? "text-red-600" : isValid ? "text-green-600" : "text-slate-600"}
            `}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}
        {isValid && !error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        {error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

