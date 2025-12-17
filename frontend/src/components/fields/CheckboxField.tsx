import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { ValidationError } from "../ValidationError";

interface CheckboxFieldProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  notes?: string;
  disabled?: boolean;
  error?: string;
}

export function CheckboxField({ id, label, checked, onChange, notes, disabled = false, error }: CheckboxFieldProps) {
  return (
    <div className={`mb-6 ${disabled ? "" : ""}`}>
      <div className="flex items-center gap-3">
        <Checkbox 
          id={id} 
          checked={checked} 
          onCheckedChange={(checked) => {
            if (!disabled) {
              onChange(checked === true);
            }
          }} 
          disabled={disabled}
        />
        <Label htmlFor={id} className={`font-medium ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
          {label}
        </Label>
      </div>
      {notes && <p className="mt-1 ml-8 text-xs text-slate-500">{notes}</p>}
      <ValidationError error={error} fieldId={id} />
    </div>
  );
}

