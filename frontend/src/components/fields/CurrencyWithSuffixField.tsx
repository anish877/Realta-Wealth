import React from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ValidationError } from "../ValidationError";

interface CurrencyWithSuffixFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  onBlur?: () => void;
  suffix?: string;
}

export function CurrencyWithSuffixField({ 
  id, 
  label, 
  value, 
  onChange, 
  placeholder = "0.00", 
  disabled = false, 
  error, 
  onBlur,
  suffix = "%"
}: CurrencyWithSuffixFieldProps) {
  return (
    <div className="mb-6">
      <Label htmlFor={id} className="mb-2 block">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type="text"
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const val = e.target.value.replace(/[^0-9.]/g, "");
            onChange(val);
          }}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`pr-8 ${error ? "border-red-500" : ""}`}
          disabled={disabled}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
          {suffix}
        </span>
      </div>
      <ValidationError error={error} fieldId={id} />
    </div>
  );
}

