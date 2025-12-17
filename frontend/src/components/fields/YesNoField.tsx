import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { ValidationError } from "../ValidationError";

interface YesNoFieldProps {
  id: string;
  label: string;
  value: "Yes" | "No" | "";
  onChange: (value: "Yes" | "No") => void;
  disabled?: boolean;
  error?: string;
  onBlur?: () => void;
}

export function YesNoField({ id, label, value, onChange, disabled = false, error, onBlur }: YesNoFieldProps) {
  return (
    <div className="mb-6">
      <Label className="mb-3 block">{label}</Label>
      <RadioGroup
        value={value}
        onValueChange={(val) => !disabled && onChange(val as "Yes" | "No")}
        disabled={disabled}
        onBlur={onBlur}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="Yes" id={`${id}-yes`} disabled={disabled} />
            <Label htmlFor={`${id}-yes`} className={disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}>
              Yes
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="No" id={`${id}-no`} disabled={disabled} />
            <Label htmlFor={`${id}-no`} className={disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}>
              No
            </Label>
          </div>
        </div>
      </RadioGroup>
      <ValidationError error={error} fieldId={id} />
    </div>
  );
}

