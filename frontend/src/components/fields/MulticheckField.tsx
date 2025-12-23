import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { TextField } from "./TextField";

interface MulticheckFieldProps {
  id: string;
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: string[] | { key: string; label: string }[];
  otherFieldId?: string;
  otherValue?: string;
  onOtherChange?: (value: string) => void;
  singleSelect?: boolean;
}

export function MulticheckField({
  id,
  label,
  value,
  onChange,
  options,
  otherFieldId,
  otherValue = "",
  onOtherChange,
  singleSelect = false,
}: MulticheckFieldProps) {
  const selectedValues = value || [];
  const hasOther = options.some((opt) => {
    const optStr = typeof opt === "string" ? opt : opt.label;
    return optStr.toLowerCase().includes("other");
  });
  const otherSelected = selectedValues.some((v) => v.toLowerCase().includes("other"));

  const handleToggle = (optionKey: string, checked: boolean) => {
    if (singleSelect) {
      onChange(checked ? [optionKey] : []);
      return;
    }

    if (checked) {
      onChange([...selectedValues, optionKey]);
    } else {
      onChange(selectedValues.filter((v) => v !== optionKey));
    }
  };

  return (
    <div className="mb-6">
      <Label className="mb-3 block">{label}</Label>
      <div className="space-y-2">
        {options.map((option) => {
          const optKey = typeof option === "string" ? option : option.key;
          const optLabel = typeof option === "string" ? option : option.label;
          const isChecked = selectedValues.includes(optKey);

          return (
            <div key={optKey} className="flex items-center gap-3">
              <Checkbox
                id={`${id}-${optKey}`}
                checked={isChecked}
                onCheckedChange={(checked) => handleToggle(optKey, checked === true)}
              />
              <Label htmlFor={`${id}-${optKey}`} className="cursor-pointer">
                {optLabel}
              </Label>
            </div>
          );
        })}
      </div>
      {hasOther && otherSelected && otherFieldId && onOtherChange && (
        <div className="mt-3 ml-8">
          <TextField
            id={otherFieldId}
            label="Other - specify"
            value={otherValue}
            onChange={onOtherChange}
            placeholder="Please specify"
          />
        </div>
      )}
    </div>
  );
}

