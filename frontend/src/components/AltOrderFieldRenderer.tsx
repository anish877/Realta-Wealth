import { TextField } from "./fields/TextField";
import { DateField } from "./fields/DateField";
import { CurrencyField } from "./fields/CurrencyField";
import { CurrencyWithSuffixField } from "./fields/CurrencyWithSuffixField";
import { YesNoField } from "./fields/YesNoField";
import { SelectField } from "./fields/SelectField";
import { SignatureField } from "./fields/SignatureField";
import { TextareaField } from "./fields/TextareaField";
import { CheckboxField } from "./fields/CheckboxField";
import { IntroBulletsSection } from "./fields/IntroBulletsSection";
import { AcknowledgementsSection } from "./fields/AcknowledgementsSection";
import { shouldShowAltOrderField } from "../utils/altOrderFieldDependencies";
import type { AltOrderField, AltOrderFormData } from "../types/altOrderForm";
import type { FieldValue } from "../types/altOrderForm";

interface AltOrderFieldRendererProps {
  field: AltOrderField;
  value: FieldValue;
  onChange: (value: FieldValue) => void;
  formData: AltOrderFormData;
  updateField: (fieldId: string, value: FieldValue) => void;
  disabled?: boolean;
  errors?: Record<string, string>;
  onBlur?: (fieldId: string) => void;
}

export function AltOrderFieldRenderer({
  field,
  value,
  onChange,
  formData,
  updateField,
  disabled = false,
  errors = {},
  onBlur,
}: AltOrderFieldRendererProps) {
  // Check if field should be visible
  if (!shouldShowAltOrderField(field.id, formData)) {
    return null;
  }

  const fieldError = errors[field.id];
  const handleBlur = () => onBlur?.(field.id);

  // Handle special field types
  if (field.type === "intro_bullets" && field.bullets) {
    return <IntroBulletsSection bullets={field.bullets} />;
  }

  if (field.type === "acknowledgements" && field.bullets) {
    return <AcknowledgementsSection bullets={field.bullets} />;
  }

  if (field.type === "section_header") {
    return (
      <div className="mt-8 mb-6">
        <h3 className="text-xl font-semibold text-slate-900">{field.label}</h3>
      </div>
    );
  }

  // Handle signature fields - they will be grouped in AltOrderSignaturesSection
  if (field.type === "signature") {
    return null; // Signatures are handled separately in the form component
  }

  // Handle regular field types
  switch (field.type) {
    case "text":
      return (
        <TextField
          id={field.id}
          label={field.label}
          value={(value as string) || ""}
          onChange={(val) => onChange(val)}
          onBlur={handleBlur}
          error={fieldError}
          disabled={disabled}
        />
      );

    case "currency":
      return (
        <CurrencyField
          id={field.id}
          label={field.label}
          value={(value as string) || ""}
          onChange={(val) => onChange(val)}
          onBlur={handleBlur}
          error={fieldError}
          disabled={disabled}
        />
      );

    case "percentage":
      return (
        <CurrencyWithSuffixField
          id={field.id}
          label={field.label}
          value={(value as string) || ""}
          onChange={(val) => onChange(val)}
          onBlur={handleBlur}
          error={fieldError}
          disabled={disabled}
          suffix={field.suffix || "%"}
        />
      );

    case "yes_no":
      return (
        <YesNoField
          id={field.id}
          label={field.label}
          value={(value as "Yes" | "No" | "") || ""}
          onChange={(val) => onChange(val)}
          onBlur={handleBlur}
          error={fieldError}
          disabled={disabled}
        />
      );

    case "dropdown":
      return (
        <SelectField
          id={field.id}
          label={field.label}
          value={(value as string) || ""}
          onChange={(val) => onChange(val)}
          options={field.options || []}
        />
      );

    case "date":
      return (
        <DateField
          id={field.id}
          label={field.label}
          value={(value as string) || ""}
          onChange={(val) => onChange(val)}
          onBlur={handleBlur}
          error={fieldError}
          disabled={disabled}
        />
      );

    case "textarea":
      return (
        <TextareaField
          id={field.id}
          label={field.label}
          value={(value as string) || ""}
          onChange={(val) => onChange(val)}
          onBlur={handleBlur}
          error={fieldError}
          disabled={disabled}
        />
      );

    case "checkbox":
      return (
        <CheckboxField
          id={field.id}
          label={field.label}
          checked={(value as boolean) || false}
          onChange={(checked) => onChange(checked)}
          error={fieldError}
          disabled={disabled}
        />
      );

    default:
      console.warn(`Unknown field type: ${field.type} for field ${field.id}`);
      return null;
  }
}

