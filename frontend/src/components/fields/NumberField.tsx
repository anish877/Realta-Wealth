import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface NumberFieldProps {
  id: string;
  label: string;
  value: number | "";
  onChange: (value: number | "") => void;
  placeholder?: string;
  disabled?: boolean;
}

export function NumberField({ id, label, value, onChange, placeholder, disabled = false }: NumberFieldProps) {
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
        placeholder={placeholder || `Enter ${label.toLowerCase()}`}
        disabled={disabled}
      />
    </div>
  );
}

