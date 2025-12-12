import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ValidationError } from "../ValidationError";

interface DateFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  onBlur?: () => void;
}

export function DateField({ id, label, value, onChange, disabled = false, error, onBlur }: DateFieldProps) {
  return (
    <div className="mb-6">
      <Label htmlFor={id} className="mb-2 block">
        {label}
      </Label>
      <Input
        id={id}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        className={error ? "border-red-500" : ""}
      />
      <ValidationError error={error} fieldId={id} />
    </div>
  );
}

