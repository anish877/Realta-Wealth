import { TextField } from "./fields/TextField";
import { DateField } from "./fields/DateField";
import { PolicyGuidanceSection } from "./fields/PolicyGuidanceSection";
import { VerificationOptionsSection } from "./fields/VerificationOptionsSection";
import { AccreditationCategoriesSection } from "./fields/AccreditationCategoriesSection";
import { AcknowledgementsSection } from "./fields/AcknowledgementsSection";
import { shouldShowAccreditationField } from "../utils/accreditationFieldDependencies";
import type { AccreditationField, AccreditationFormData } from "../types/accreditationForm";
import type { FieldValue } from "../types/accreditationForm";

interface AccreditationFieldRendererProps {
  field: AccreditationField;
  value: FieldValue;
  onChange: (value: FieldValue) => void;
  formData: AccreditationFormData;
  updateField: (fieldId: string, value: FieldValue) => void;
  disabled?: boolean;
  errors?: Record<string, string>;
  onBlur?: (fieldId: string) => void;
}

export function AccreditationFieldRenderer({
  field,
  value,
  onChange,
  formData,
  updateField,
  disabled = false,
  errors = {},
  onBlur,
}: AccreditationFieldRendererProps) {
  if (!shouldShowAccreditationField(field.id, formData)) {
    return null;
  }

  const fieldError = errors[field.id];
  const handleBlur = () => onBlur?.(field.id);

  // Read-only special sections
  if (field.type === "policy_guidance" && field.content?.bullets) {
    return <PolicyGuidanceSection bullets={field.content.bullets} />;
  }

  if (field.type === "verification_options" && field.content) {
    return <VerificationOptionsSection content={field.content} />;
  }

  if (field.type === "accreditation_categories" && field.categories) {
    return <AccreditationCategoriesSection categories={field.categories} />;
  }

  if (field.type === "acknowledgements" && field.bullets) {
    return <AcknowledgementsSection bullets={field.bullets} />;
  }

  if (field.type === "text_block" && field.text) {
    return (
      <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{field.text}</p>
      </div>
    );
  }

  if (field.type === "section_header") {
    return (
      <div className="mt-8 mb-6">
        <h3 className="text-xl font-semibold text-slate-900">{field.label}</h3>
      </div>
    );
  }

  // Signatures handled separately in main form
  if (field.type === "signatures_block") {
    return null;
  }

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
    default:
      console.warn(`Unknown field type ${field.type} for field ${field.id}`);
      return null;
  }
}

