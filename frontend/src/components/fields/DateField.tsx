import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface DateFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function DateField({ id, label, value, onChange, disabled = false }: DateFieldProps) {
  return (
    <div className="mb-6">
      <Label htmlFor={id} className="mb-2 block">
        {label}
      </Label>
      <Input id={id} type="date" value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} />
    </div>
  );
}

