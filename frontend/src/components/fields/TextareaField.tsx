import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";

interface TextareaFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  rows?: number;
  disabled?: boolean;
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
        readOnly={readOnly || disabled}
        rows={rows}
        placeholder={placeholder || `Enter ${label.toLowerCase()}`}
        className={readOnly || disabled ? "opacity-75 cursor-not-allowed" : ""}
        disabled={disabled}
      />
    </div>
  );
}

