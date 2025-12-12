// Validation utility to ensure all fields from JSON are rendered
import formSchema from "../REI-Investor-Profile-v20240101-1.json";

interface Field {
  id: string;
  label: string;
  type: string;
  page?: number;
  options?: string[] | { key: string; label: string }[];
  other_field_id?: string;
  fields?: Field[];
  repeatable?: boolean;
  notes?: string;
}

interface Section {
  sectionId: string;
  title: string;
  page: number;
  fields: Field[];
}

export function getAllFieldIds(): Set<string> {
  const allIds = new Set<string>();
  const sections = (formSchema as any).schema as Section[];

  function collectFields(fields: Field[], prefix = "") {
    fields.forEach((field) => {
      const fieldId = prefix ? `${prefix}.${field.id}` : field.id;
      allIds.add(fieldId);

      if (field.other_field_id) {
        const otherId = prefix ? `${prefix}.${field.other_field_id}` : field.other_field_id;
        allIds.add(otherId);
      }

      if (field.fields) {
        const groupPrefix = field.repeatable ? `${fieldId}[0]` : fieldId;
        collectFields(field.fields, groupPrefix);
      }
    });
  }

  sections.forEach((section) => {
    collectFields(section.fields);
  });

  return allIds;
}

export function validateAllFieldsPresent(formData: Record<string, any>): {
  missing: string[];
  total: number;
  present: number;
} {
  const allFieldIds = getAllFieldIds();
  const presentIds = new Set(Object.keys(formData));
  const missing: string[] = [];

  allFieldIds.forEach((id) => {
    if (!presentIds.has(id)) {
      missing.push(id);
    }
  });

  return {
    missing,
    total: allFieldIds.size,
    present: presentIds.size,
  };
}

