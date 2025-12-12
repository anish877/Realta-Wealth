import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";

interface RadioFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  disabled?: boolean;
}

export function RadioField({ id, label, value, onChange, options, disabled = false }: RadioFieldProps) {
  return (
    <div className="mb-6">
      <Label className="mb-3 block">{label}</Label>
      <RadioGroup value={value} onValueChange={(val) => !disabled && onChange(val)} disabled={disabled}>
        <div className="space-y-2">
          {options.map((option) => (
            <div key={option} className="flex items-center gap-3">
              <RadioGroupItem value={option} id={`${id}-${option}`} disabled={disabled} />
              <Label htmlFor={`${id}-${option}`} className={disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}>
                {option}
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
}

