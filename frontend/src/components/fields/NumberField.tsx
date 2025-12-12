import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ValidationError } from "../ValidationError";

interface NumberFieldProps {
  id: string;
  label: string;
  value: number | "";
  onChange: (value: number | "") => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  onBlur?: () => void;
}

export function NumberField({ id, label, value, onChange, placeholder, disabled = false, error, onBlur }: NumberFieldProps) {
  return (
    <div className="mb-6">
      <Label htmlFor={id} className="mb-2 block">
        {label}
      </Label>
      <Input
        id={id}
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : "")}
        onBlur={onBlur}
        placeholder={placeholder || `Enter ${label.toLowerCase()}`}
        disabled={disabled}
        className={error ? "border-red-500" : ""}
      />
      <ValidationError error={error} fieldId={id} />
    </div>
  );
}

