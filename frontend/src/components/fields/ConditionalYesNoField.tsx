import { YesNoField } from "./YesNoField";
import { TextField } from "./TextField";
import { DateField } from "./DateField";
import type { FieldValue } from "../../types/additionalHolderForm";

interface FollowUpField {
  id: string;
  label: string;
  type: string;
}

interface ConditionalYesNoFieldProps {
  id: string;
  label: string;
  value: "Yes" | "No" | "";
  onChange: (value: "Yes" | "No") => void;
  followUpFields?: FollowUpField[];
  formData: Record<string, FieldValue>;
  updateField: (fieldId: string, value: FieldValue) => void;
  errors?: Record<string, string>;
  onBlur?: (fieldId: string) => void;
  disabled?: boolean;
  notes?: string;
}

export function ConditionalYesNoField({
  id,
  label,
  value,
  onChange,
  followUpFields = [],
  formData,
  updateField,
  errors = {},
  onBlur,
  disabled = false,
  notes,
}: ConditionalYesNoFieldProps) {
  const showFollowUps = value === "Yes";

  return (
    <div className="mb-6">
      <YesNoField id={id} label={label} value={value} onChange={onChange} disabled={disabled} />
      {notes && (
        <p className="mt-1 text-sm text-slate-600 italic">{notes}</p>
      )}
      {showFollowUps && followUpFields.length > 0 && (
        <div className="mt-4 ml-6 pl-4 border-l-2 border-slate-200">
          {followUpFields.map((field) => {
            const fieldId = `${id}_${field.id}`;
            const fieldValue = (formData[fieldId] as string) || "";
            const fieldError = errors[fieldId];

            switch (field.type) {
              case "text":
                return (
                  <TextField
                    key={field.id}
                    id={fieldId}
                    label={field.label}
                    value={fieldValue}
                    onChange={(val) => updateField(fieldId, val)}
                    error={fieldError}
                    onBlur={() => onBlur?.(fieldId)}
                    disabled={disabled}
                  />
                );
              case "date":
                return (
                  <DateField
                    key={field.id}
                    id={fieldId}
                    label={field.label}
                    value={fieldValue}
                    onChange={(val) => updateField(fieldId, val)}
                    error={fieldError}
                    onBlur={() => onBlur?.(fieldId)}
                    disabled={disabled}
                  />
                );
              default:
                return (
                  <TextField
                    key={field.id}
                    id={fieldId}
                    label={field.label}
                    value={fieldValue}
                    onChange={(val) => updateField(fieldId, val)}
                    error={fieldError}
                    onBlur={() => onBlur?.(fieldId)}
                    disabled={disabled}
                  />
                );
            }
          })}
        </div>
      )}
    </div>
  );
}

