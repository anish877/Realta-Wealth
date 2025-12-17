import { TextField } from "./fields/TextField";
import { DateField } from "./fields/DateField";
import { CurrencyField } from "./fields/CurrencyField";
import { MulticheckField } from "./fields/MulticheckField";
import { SignatureField } from "./fields/SignatureField";
import { RangeCurrencyField } from "./fields/RangeCurrencyField";
import { ConditionalYesNoField } from "./fields/ConditionalYesNoField";
import { AddressFieldGroup } from "./fields/AddressFieldGroup";
import { KnowledgeTableField } from "./fields/KnowledgeTableField";
import { GovernmentIdTableField } from "./fields/GovernmentIdTableField";
import { shouldShowAdditionalHolderField } from "../utils/additionalHolderFieldDependencies";
import type { AdditionalHolderField, AdditionalHolderFormData, RangeCurrencyValue } from "../types/additionalHolderForm";
import type { FieldValue } from "../types/additionalHolderForm";

interface AdditionalHolderFieldRendererProps {
  field: AdditionalHolderField;
  value: FieldValue;
  onChange: (value: FieldValue) => void;
  formData: AdditionalHolderFormData;
  updateField: (fieldId: string, value: FieldValue) => void;
  disabled?: boolean;
  errors?: Record<string, string>;
  onBlur?: (fieldId: string) => void;
}

export function AdditionalHolderFieldRenderer({
  field,
  value,
  onChange,
  formData,
  updateField,
  disabled = false,
  errors = {},
  onBlur,
}: AdditionalHolderFieldRendererProps) {
  // Check if field should be visible
  if (!shouldShowAdditionalHolderField(field.id, formData)) {
    return null;
  }

  const fieldError = errors[field.id];
  const handleBlur = () => onBlur?.(field.id);

  // Handle address groups
  if (field.id === "legal_address" && field.fields) {
    return (
      <AddressFieldGroup
        prefix="legal"
        addressFieldId="legal_address"
        label="Legal Address (no P.O. Box)"
        values={{
          address: (formData.legal_address_line as string) || "",
          city: (formData.legal_city as string) || "",
          stateProvince: (formData.legal_state_province as string) || "",
          zipPostalCode: (formData.legal_zip_postal_code as string) || "",
          country: (formData.legal_country as string) || "",
        }}
        onChange={(fieldName, val) => {
          const fieldMap: Record<string, string> = {
            address: "legal_address_line",
            city: "legal_city",
            stateProvince: "legal_state_province",
            zipPostalCode: "legal_zip_postal_code",
            country: "legal_country",
          };
          updateField(fieldMap[fieldName], val);
        }}
        showMailingSameAsLegal={false}
      />
    );
  }

  if (field.id === "mailing_address" && field.fields) {
    return (
      <AddressFieldGroup
        prefix="mailing"
        addressFieldId="mailing_address"
        label="Mailing Address (if different from legal address)"
        values={{
          address: (formData.mailing_address_line as string) || "",
          city: (formData.mailing_city as string) || "",
          stateProvince: (formData.mailing_state_province as string) || "",
          zipPostalCode: (formData.mailing_zip_postal_code as string) || "",
          country: (formData.mailing_country as string) || "",
        }}
        onChange={(fieldName, val) => {
          const fieldMap: Record<string, string> = {
            address: "mailing_address_line",
            city: "mailing_city",
            stateProvince: "mailing_state_province",
            zipPostalCode: "mailing_zip_postal_code",
            country: "mailing_country",
          };
          updateField(fieldMap[fieldName], val);
        }}
        showMailingSameAsLegal={true}
        mailingSameAsLegal={(formData.mailing_same_as_legal as boolean) || false}
        onMailingSameAsLegalChange={(checked) => updateField("mailing_same_as_legal", checked)}
      />
    );
  }

  // Handle investment knowledge table
  if (field.id === "investment_knowledge_table_page1" || field.id === "investment_knowledge_table_page2") {
    const isPage1 = field.id === "investment_knowledge_table_page1";
    const knowledgeFields = isPage1
      ? [
          { id: "commodities_futures_knowledge", label: "Commodities, Futures", type: "radio" as const },
          { id: "commodities_futures_since_year", label: "", type: "text" as const },
          { id: "equities_knowledge", label: "Equities", type: "radio" as const },
          { id: "equities_since_year", label: "", type: "text" as const },
          { id: "exchange_traded_funds_knowledge", label: "Exchange Traded Funds", type: "radio" as const },
          { id: "exchange_traded_funds_since_year", label: "", type: "text" as const },
          { id: "fixed_annuities_knowledge", label: "Fixed Annuities", type: "radio" as const },
          { id: "fixed_annuities_since_year", label: "", type: "text" as const },
          { id: "fixed_insurance_knowledge", label: "Fixed Insurance", type: "radio" as const },
          { id: "fixed_insurance_since_year", label: "", type: "text" as const },
          { id: "mutual_funds_knowledge", label: "Mutual Funds", type: "radio" as const },
          { id: "mutual_funds_since_year", label: "", type: "text" as const },
        ]
      : [
          { id: "options_knowledge", label: "Options", type: "radio" as const },
          { id: "options_since_year", label: "", type: "text" as const },
          { id: "precious_metals_knowledge", label: "Precious Metals", type: "radio" as const },
          { id: "precious_metals_since_year", label: "", type: "text" as const },
          { id: "real_estate_knowledge", label: "Real Estate", type: "radio" as const },
          { id: "real_estate_since_year", label: "", type: "text" as const },
          { id: "unit_investment_trusts_knowledge", label: "Unit Investment Trusts", type: "radio" as const },
          { id: "unit_investment_trusts_since_year", label: "", type: "text" as const },
          { id: "variable_annuities_knowledge", label: "Variable Annuities", type: "radio" as const },
          { id: "variable_annuities_since_year", label: "", type: "text" as const },
          { id: "leveraged_inverse_etfs_knowledge", label: "Leveraged/Inverse ETF's", type: "radio" as const },
          { id: "leveraged_inverse_etfs_since_year", label: "", type: "text" as const },
          { id: "complex_products_knowledge", label: "Complex Products", type: "radio" as const },
          { id: "complex_products_since_year", label: "", type: "text" as const },
          { id: "alternative_investments_knowledge", label: "Alternative Investments", type: "radio" as const },
          { id: "alternative_investments_since_year", label: "", type: "text" as const },
          { id: "other_investments_knowledge", label: "Other", type: "radio" as const },
          { id: "other_investments_since_year", label: "", type: "text" as const },
        ];

    const knowledgeValues: Record<string, string> = {};
    knowledgeFields.forEach((f) => {
      knowledgeValues[f.id] = String(formData[f.id as keyof AdditionalHolderFormData] || "");
    });

    return (
      <KnowledgeTableField
        id={field.id}
        label={field.label}
        fields={knowledgeFields}
        values={knowledgeValues}
        onChange={(fieldId, val) => updateField(fieldId, val)}
        showOtherRow={!isPage1}
        otherLabelFieldId={!isPage1 ? "other_investments_label" : undefined}
        otherLabelValue={(formData.other_investments_label as string) || ""}
        onOtherLabelChange={!isPage1 ? (val) => updateField("other_investments_label", val) : undefined}
      />
    );
  }

  // Handle government ID blocks
  if (field.id === "unexpired_government_identification" && field.fields) {
    const govIdFields = [
      { id: "type", label: "Type of Unexpired Photo ID", type: "text" as const },
      { id: "number", label: "ID Number", type: "text" as const },
      { id: "country_of_issue", label: "Country of Issue", type: "text" as const },
      { id: "date_of_issue", label: "Date of Issue", type: "date" as const },
      { id: "date_of_expiration", label: "Date of Expiration", type: "date" as const },
    ];

    const govId1Values = {
      type: (formData.gov_id_1_type as string) || "",
      number: (formData.gov_id_1_number as string) || "",
      country_of_issue: (formData.gov_id_1_country_of_issue as string) || "",
      date_of_issue: (formData.gov_id_1_date_of_issue as string) || "",
      date_of_expiration: (formData.gov_id_1_date_of_expiration as string) || "",
    };

    const govId2Values = {
      type: (formData.gov_id_2_type as string) || "",
      number: (formData.gov_id_2_number as string) || "",
      country_of_issue: (formData.gov_id_2_country_of_issue as string) || "",
      date_of_issue: (formData.gov_id_2_date_of_issue as string) || "",
      date_of_expiration: (formData.gov_id_2_date_of_expiration as string) || "",
    };

    return (
      <GovernmentIdTableField
        id="government_ids"
        label={field.label}
        fields={govIdFields}
        values={[govId1Values, govId2Values]}
        onChange={(index, fieldId, val) => {
          const prefix = index === 0 ? "gov_id_1" : "gov_id_2";
          const fullFieldId = `${prefix}_${fieldId}`;
          updateField(fullFieldId, val);
        }}
        notes={field.notes}
      />
    );
  }

  // Handle range currency fields
  if (field.type === "range_currency") {
    const rangeValue = (formData[field.id] as { from?: string | number; to?: string | number }) || {};
    return (
      <RangeCurrencyField
        id={field.id}
        label={field.label}
        fromValue={rangeValue.from}
        toValue={rangeValue.to}
        onFromChange={(val) => {
          const current = (formData[field.id] as RangeCurrencyValue) || {};
          updateField(field.id, { ...current, from: val } as FieldValue);
        }}
        onToChange={(val) => {
          const current = (formData[field.id] as RangeCurrencyValue) || {};
          updateField(field.id, { ...current, to: val } as FieldValue);
        }}
        error={fieldError}
        onBlur={handleBlur}
        rangeLabels={field.range_labels}
        disabled={disabled}
      />
    );
  }

  // Handle conditional yes/no fields
  if (field.type === "conditional_yes_no") {
    return (
      <ConditionalYesNoField
        id={field.id}
        label={field.label}
        value={(formData[field.id] as "Yes" | "No" | "") || ""}
        onChange={(val) => updateField(field.id, val)}
        followUpFields={field.follow_up_fields || []}
        formData={formData}
        updateField={updateField}
        errors={errors}
        onBlur={onBlur}
        disabled={disabled}
        notes={field.notes}
      />
    );
  }

  // Handle regular field types
  switch (field.type) {
    case "text":
      return (
        <TextField
          id={field.id}
          label={field.label}
          value={(value as string) || ""}
          onChange={onChange}
          error={fieldError}
          onBlur={handleBlur}
          disabled={disabled}
        />
      );

    case "date":
      return (
        <DateField
          id={field.id}
          label={field.label}
          value={(value as string) || ""}
          onChange={onChange}
          error={fieldError}
          onBlur={handleBlur}
          disabled={disabled}
        />
      );

    case "currency":
      return (
        <CurrencyField
          id={field.id}
          label={field.label}
          value={(value as string) || ""}
          onChange={onChange}
          error={fieldError}
          onBlur={handleBlur}
          disabled={disabled}
        />
      );

    case "multicheck":
      return (
        <div>
          <MulticheckField
            id={field.id}
            label={field.label}
            value={(value as string[]) || []}
            onChange={onChange}
            options={field.options || []}
          />
          {fieldError && (
            <p className="mt-1 text-sm text-red-600">{fieldError}</p>
          )}
        </div>
      );

    case "signature":
      return (
        <div>
          <SignatureField
            id={field.id}
            label={field.label}
            value={(value as string) || ""}
            onChange={onChange}
          />
          {fieldError && (
            <p className="mt-1 text-sm text-red-600">{fieldError}</p>
          )}
        </div>
      );

    case "group":
      // Render nested fields
      if (field.fields) {
        return (
          <div className="mb-6">
            {field.label && <h3 className="text-lg font-semibold mb-4">{field.label}</h3>}
            <div className="space-y-4">
              {field.fields.map((subField) => (
                <AdditionalHolderFieldRenderer
                  key={subField.id}
                  field={subField}
                  value={formData[subField.id as keyof AdditionalHolderFormData] || ""}
                  onChange={(val) => updateField(subField.id, val)}
                  formData={formData}
                  updateField={updateField}
                  disabled={disabled}
                  errors={errors}
                  onBlur={onBlur}
                />
              ))}
            </div>
          </div>
        );
      }
      return null;

    default:
      return (
        <TextField
          id={field.id}
          label={field.label}
          value={(value as string) || ""}
          onChange={onChange}
          error={fieldError}
          onBlur={handleBlur}
          disabled={disabled}
        />
      );
  }
}

