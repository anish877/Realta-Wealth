import { FieldRenderer } from "../FieldRenderer";

interface Step1AccountRegistrationProps {
  fields: any[];
  formData: Record<string, any>;
  updateField: (fieldId: string, value: any) => void;
  addRepeatableGroup: (fieldId: string) => void;
}

export function Step1AccountRegistration({
  fields,
  formData,
  updateField,
  addRepeatableGroup,
}: Step1AccountRegistrationProps) {
  return (
    <div className="space-y-6">
      {fields.map((field) => (
        <FieldRenderer
          key={field.id}
          field={field}
          value={formData[field.id] || ""}
          onChange={(value) => updateField(field.id, value)}
          onRepeatableAdd={addRepeatableGroup}
        />
      ))}
    </div>
  );
}

