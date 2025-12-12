import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ValidationError } from "../ValidationError";

interface CurrencyFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  onBlur?: () => void;
}

export function CurrencyField({ id, label, value, onChange, placeholder = "0.00", disabled = false, error, onBlur }: CurrencyFieldProps) {
  return (
    <div className="mb-6">
      <Label htmlFor={id} className="mb-2 block">
        {label}
      </Label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
        <Input
          id={id}
          type="text"
          value={value}
          onChange={(e) => {
            const val = e.target.value.replace(/[^0-9.]/g, "");
            onChange(val);
          }}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`pl-8 ${error ? "border-red-500" : ""}`}
          disabled={disabled}
        />
      </div>
      <ValidationError error={error} fieldId={id} />
    </div>
  );
}

