import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { ValidationError } from "../ValidationError";

interface TextareaFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  rows?: number;
  disabled?: boolean;
  error?: string;
  onBlur?: () => void;
}

export function TextareaField({
  id,
  label,
  value,
  onChange,
  placeholder,
  readOnly = false,
  rows = 3,
  disabled = false,
  error,
  onBlur,
}: TextareaFieldProps) {
  return (
    <div className="mb-6">
      <Label htmlFor={id} className="mb-2 block">
        {label}
      </Label>
      <Textarea
        id={id}
        value={value}
        onChange={(e) => !readOnly && !disabled && onChange(e.target.value)}
        onBlur={onBlur}
        readOnly={readOnly || disabled}
        rows={rows}
        placeholder={placeholder || `Enter ${label.toLowerCase()}`}
        className={`${readOnly || disabled ? "opacity-75 cursor-not-allowed" : ""} ${error ? "border-red-500" : ""}`}
        disabled={disabled}
      />
      <ValidationError error={error} fieldId={id} />
    </div>
  );
}

