import { TextField } from "./fields/TextField";
import { TextareaField } from "./fields/TextareaField";
import { NumberField } from "./fields/NumberField";
import { DateField } from "./fields/DateField";
import { CurrencyField } from "./fields/CurrencyField";
import { CheckboxField } from "./fields/CheckboxField";
import { YesNoField } from "./fields/YesNoField";
import { RadioField } from "./fields/RadioField";
import { MulticheckField } from "./fields/MulticheckField";
import { SelectField } from "./fields/SelectField";
import { SignatureField } from "./fields/SignatureField";
import { FieldGroup } from "./fields/FieldGroup";
import { InvestmentTableField } from "./fields/InvestmentTableField";
import { KnowledgeTableField } from "./fields/KnowledgeTableField";
import { GovernmentIdTableField } from "./fields/GovernmentIdTableField";
import { AccountTypeSection } from "./fields/AccountTypeSection";
import { PatriotActSection } from "./fields/PatriotActSection";
import { FinancialInformationSection } from "./fields/FinancialInformationSection";
import { ObjectivesSection } from "./fields/ObjectivesSection";
import { TrustedContactSection } from "./fields/TrustedContactSection";
import { SignaturesSection } from "./fields/SignaturesSection";
import { ConditionalFieldManager } from "./ConditionalFieldManager";
import { AddressFieldGroup } from "./fields/AddressFieldGroup";
import { PhoneFieldsGroup } from "./fields/PhoneFieldsGroup";
import type { FieldValue } from "../types/form";

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

interface FieldRendererProps {
  field: Field;
  value: FieldValue;
  onChange: (value: FieldValue) => void;
  onRepeatableAdd?: (fieldId: string) => void;
  repeatableIndex?: number;
  prefix?: string;
  formData?: Record<string, FieldValue>;
  updateField?: (fieldId: string, value: FieldValue) => void;
  disabled?: boolean;
  error?: string;
  onBlur?: () => void;
}

export function FieldRenderer({
  field,
  value,
  onChange,
  onRepeatableAdd,
  repeatableIndex,
  prefix = "",
  formData = {},
  updateField,
  disabled = false,
  error,
  onBlur,
}: FieldRendererProps) {
  const fieldId = prefix ? `${prefix}.${field.id}` : field.id;
  
  // Check if field should be visible based on conditional rules
  const shouldShow = ConditionalFieldManager.shouldShow(field.id, formData);
  if (!shouldShow) {
    return null;
  }

  // Handle address field groups (Legal Address, Mailing Address, Employer Address)
  if (field.id === "primary_legal_address" || field.id === "primary_mailing_address" || 
      field.id === "secondary_legal_address" || field.id === "secondary_mailing_address" ||
      field.id === "primary_employer_address" || field.id === "secondary_employer_address") {
    const isPrimary = field.id.startsWith("primary_");
    const isMailing = field.id.includes("mailing");
    const isEmployer = field.id.includes("employer");
    const prefix = isPrimary ? "primary" : "secondary";
    const addressType = isMailing ? "mailing" : isEmployer ? "employer" : "legal";
    
    const addressPrefix = `${prefix}_${addressType}`;
    const sameAsLegalFieldId = isMailing ? `${prefix}_mailing_same_as_legal` : undefined;
    const mailingSameAsLegal = sameAsLegalFieldId ? (formData[sameAsLegalFieldId] as boolean) || false : false;
    
    return (
      <AddressFieldGroup
        prefix={addressPrefix}
        label={isMailing ? "Mailing Address" : isEmployer ? "Employer Address" : "Legal Address"}
        values={{
          address: (formData[`${addressPrefix}_address`] as string) || "",
          city: (formData[`${addressPrefix}_city`] as string) || "",
          stateProvince: (formData[`${addressPrefix}_state_province`] as string) || "",
          zipPostalCode: (formData[`${addressPrefix}_zip_postal_code`] as string) || "",
          country: (formData[`${addressPrefix}_country`] as string) || "",
        }}
        onChange={(fieldName, val) => {
          const fieldMap: Record<string, string> = {
            address: `${addressPrefix}_address`,
            city: `${addressPrefix}_city`,
            stateProvince: `${addressPrefix}_state_province`,
            zipPostalCode: `${addressPrefix}_zip_postal_code`,
            country: `${addressPrefix}_country`,
          };
          updateField?.(fieldMap[fieldName], val);
        }}
        showMailingSameAsLegal={isMailing}
        mailingSameAsLegal={mailingSameAsLegal}
        onMailingSameAsLegalChange={isMailing && updateField ? (checked) => {
          updateField(sameAsLegalFieldId!, checked);
        } : undefined}
      />
    );
  }

  // Handle phone field groups (Primary, Secondary, Trusted Contact)
  if (field.id === "primary_home_phone" || field.id === "secondary_home_phone" || 
      field.id === "trusted_contact_home_phone") {
    const prefix = field.id.startsWith("primary_") ? "primary" : 
                   field.id.startsWith("secondary_") ? "secondary" : "trusted_contact";
    
    return (
      <PhoneFieldsGroup
        prefix={prefix}
        values={{
          home: (formData[`${prefix}_home_phone`] as string) || "",
          business: (formData[`${prefix}_business_phone`] as string) || "",
          mobile: (formData[`${prefix}_mobile_phone`] as string) || "",
        }}
        onChange={(fieldName, val) => {
          const fieldMap: Record<string, string> = {
            home: `${prefix}_home_phone`,
            business: `${prefix}_business_phone`,
            mobile: `${prefix}_mobile_phone`,
          };
          updateField?.(fieldMap[fieldName], val);
        }}
      />
    );
  }

  // Special handling for Step 5 Objectives section - render as complete section
  if (field.id === "risk_exposure" && !prefix && formData && updateField) {
    const riskExposureValue = (formData["risk_exposure"] as string[]) || [];
    const accountObjectivesValue = (formData["account_investment_objectives"] as string[]) || [];
    const seeAttachedChecked = (formData["other_investments_see_attached"] as boolean) || false;
    const investmentTableData = (formData["other_investments_table"] as Record<string, any>) || {};
    const timeHorizonData = (formData["investment_time_horizon_liquidity"] as Record<string, any>) || {};
    const liquidityNeedsValue = (formData["liquidity_needs"] as string[]) || [];
    
    // Build investment values object from the other_investments_table group
    const investmentValues: Record<string, string> = {};
    Object.keys(investmentTableData).forEach((key) => {
      investmentValues[key] = (investmentTableData[key] as string) || "";
    });
    
    return (
      <ObjectivesSection
        riskExposureValue={riskExposureValue}
        onRiskExposureChange={(val) => updateField("risk_exposure", val)}
        accountInvestmentObjectivesValue={accountObjectivesValue}
        onAccountInvestmentObjectivesChange={(val) => updateField("account_investment_objectives", val)}
        seeAttachedStatementChecked={seeAttachedChecked}
        onSeeAttachedStatementChange={(checked) => updateField("other_investments_see_attached", checked)}
        investmentValues={investmentValues}
        onInvestmentValueChange={(key, val) => {
          const updated = { ...investmentTableData, [key]: val };
          updateField("other_investments_table", updated);
        }}
        timeHorizonFrom={(timeHorizonData["investment_time_horizon_from"] as string) || ""}
        timeHorizonTo={(timeHorizonData["investment_time_horizon_to"] as string) || ""}
        onTimeHorizonFromChange={(val) => {
          const updated = { ...timeHorizonData, investment_time_horizon_from: val };
          updateField("investment_time_horizon_liquidity", updated);
        }}
        onTimeHorizonToChange={(val) => {
          const updated = { ...timeHorizonData, investment_time_horizon_to: val };
          updateField("investment_time_horizon_liquidity", updated);
        }}
        liquidityNeedsValue={liquidityNeedsValue}
        onLiquidityNeedsChange={(val) => updateField("liquidity_needs", val)}
      />
    );
  }

  // Special handling for Step 7 Signatures section - render as complete section
  if (field.id === "taxpayer_certification" && !prefix && formData && updateField) {
    return (
      <SignaturesSection
        accountOwnerSignature={(formData["account_owner_signature"] as string) || ""}
        onAccountOwnerSignatureChange={(val) => updateField("account_owner_signature", val)}
        accountOwnerPrintedName={(formData["account_owner_printed_name"] as string) || ""}
        onAccountOwnerPrintedNameChange={(val) => updateField("account_owner_printed_name", val)}
        accountOwnerDate={(formData["account_owner_date"] as string) || ""}
        onAccountOwnerDateChange={(val) => updateField("account_owner_date", val)}
        jointAccountOwnerSignature={(formData["joint_account_owner_signature"] as string) || ""}
        onJointAccountOwnerSignatureChange={(val) => updateField("joint_account_owner_signature", val)}
        jointAccountOwnerPrintedName={(formData["joint_account_owner_printed_name"] as string) || ""}
        onJointAccountOwnerPrintedNameChange={(val) => updateField("joint_account_owner_printed_name", val)}
        jointAccountOwnerDate={(formData["joint_account_owner_date"] as string) || ""}
        onJointAccountOwnerDateChange={(val) => updateField("joint_account_owner_date", val)}
        financialProfessionalSignature={(formData["financial_professional_signature"] as string) || ""}
        onFinancialProfessionalSignatureChange={(val) => updateField("financial_professional_signature", val)}
        financialProfessionalPrintedName={(formData["financial_professional_printed_name"] as string) || ""}
        onFinancialProfessionalPrintedNameChange={(val) => updateField("financial_professional_printed_name", val)}
        financialProfessionalDate={(formData["financial_professional_date"] as string) || ""}
        onFinancialProfessionalDateChange={(val) => updateField("financial_professional_date", val)}
        supervisorPrincipalSignature={(formData["supervisor_principal_signature"] as string) || ""}
        onSupervisorPrincipalSignatureChange={(val) => updateField("supervisor_principal_signature", val)}
        supervisorPrincipalPrintedName={(formData["supervisor_principal_printed_name"] as string) || ""}
        onSupervisorPrincipalPrintedNameChange={(val) => updateField("supervisor_principal_printed_name", val)}
        supervisorPrincipalDate={(formData["supervisor_principal_date"] as string) || ""}
        onSupervisorPrincipalDateChange={(val) => updateField("supervisor_principal_date", val)}
      />
    );
  }

  // Special handling for Step 6 Trusted Contact section - render as two-column layout
  if (field.id === "trusted_contact_decline_to_provide" && !prefix && formData && updateField) {
    return (
      <TrustedContactSection
        declineToProvide={(formData["trusted_contact_decline_to_provide"] as boolean) || false}
        onDeclineToProvideChange={(checked) => updateField("trusted_contact_decline_to_provide", checked)}
        name={(formData["trusted_contact_name"] as string) || ""}
        onNameChange={(val) => updateField("trusted_contact_name", val)}
        email={(formData["trusted_contact_email"] as string) || ""}
        onEmailChange={(val) => updateField("trusted_contact_email", val)}
        homePhone={(formData["trusted_contact_home_phone"] as string) || ""}
        onHomePhoneChange={(val) => updateField("trusted_contact_home_phone", val)}
        businessPhone={(formData["trusted_contact_business_phone"] as string) || ""}
        onBusinessPhoneChange={(val) => updateField("trusted_contact_business_phone", val)}
        mobilePhone={(formData["trusted_contact_mobile_phone"] as string) || ""}
        onMobilePhoneChange={(val) => updateField("trusted_contact_mobile_phone", val)}
        mailingAddress={(formData["trusted_contact_mailing_address"] as string) || ""}
        onMailingAddressChange={(val) => updateField("trusted_contact_mailing_address", val)}
        city={(formData["trusted_contact_city"] as string) || ""}
        onCityChange={(val) => updateField("trusted_contact_city", val)}
        stateProvince={(formData["trusted_contact_state_province"] as string) || ""}
        onStateProvinceChange={(val) => updateField("trusted_contact_state_province", val)}
        zipPostalCode={(formData["trusted_contact_zip_postal_code"] as string) || ""}
        onZipPostalCodeChange={(val) => updateField("trusted_contact_zip_postal_code", val)}
        country={(formData["trusted_contact_country"] as string) || ""}
        onCountryChange={(val) => updateField("trusted_contact_country", val)}
      />
    );
  }

  // Special handling for Step 2 Patriot Act section - render as 3-column grid
  if (field.id === "initial_source_of_funds" && !prefix) {
    return (
      <PatriotActSection
        initialSourceOfFundsValue={(formData["initial_source_of_funds"] as string[]) || []}
        onInitialSourceOfFundsChange={(val) => updateField?.("initial_source_of_funds", val)}
        otherSourceOfFundsText={(formData["initial_source_of_funds_other_text"] as string) || ""}
        onOtherSourceOfFundsTextChange={(val) => updateField?.("initial_source_of_funds_other_text", val)}
      />
    );
  }

  // Special handling for Step 1 account registration section - render as two-table layout
  if (field.id === "type_of_account" && !prefix) {
    const trustBlock = (formData["trust_block"] as Record<string, any>) || {};
    return (
      <AccountTypeSection
        retailChecked={(formData["retail_checkbox"] as boolean) || false}
        onRetailChange={(val) => updateField?.("retail_checkbox", val)}
        typeOfAccountValue={(formData["type_of_account"] as string[]) || []}
        onTypeOfAccountChange={(val) => updateField?.("type_of_account", val)}
        additionalDesignationValue={(formData["additional_designation_left"] as string[]) || []}
        onAdditionalDesignationChange={(val) => updateField?.("additional_designation_left", val)}
        trustChecked={trustBlock.trust_checkbox || false}
        onTrustChange={(val) => {
          updateField?.("trust_block", { ...trustBlock, trust_checkbox: val });
        }}
        trustEstablishmentDate={trustBlock.trust_establishment_date || ""}
        onTrustEstablishmentDateChange={(val) => {
          updateField?.("trust_block", { ...trustBlock, trust_establishment_date: val });
        }}
        trustTypeValue={trustBlock.trust_type || []}
        onTrustTypeChange={(val) => {
          updateField?.("trust_block", { ...trustBlock, trust_type: val });
        }}
        typeOfAccountRightValue={(formData["type_of_account_right"] as string[]) || []}
        onTypeOfAccountRightChange={(val) => updateField?.("type_of_account_right", val)}
        otherAccountTypeText={(formData["other_account_type_text"] as string) || ""}
        onOtherAccountTypeTextChange={(val) => updateField?.("other_account_type_text", val)}
        formData={formData}
        updateField={updateField || (() => {})}
        disabled={disabled}
      />
    );
  }

  switch (field.type) {
    case "text":
      return (
        <TextField
          id={fieldId}
          label={field.label}
          value={(value as string) || ""}
          onChange={(val) => onChange(val)}
          onBlur={onBlur}
          error={error}
          disabled={disabled}
        />
      );

    case "textarea":
      const isReadOnly = field.id === "taxpayer_certification" || field.id === "agreement_text";
      return (
        <TextareaField
          id={fieldId}
          label={field.label}
          value={(value as string) || ""}
          onChange={(val) => onChange(val)}
          onBlur={onBlur}
          readOnly={isReadOnly}
          rows={isReadOnly ? 8 : 3}
          disabled={disabled}
          error={error}
        />
      );

    case "number":
      return (
        <NumberField
          id={fieldId}
          label={field.label}
          value={(value as number) || ""}
          onChange={(val) => onChange(val)}
          onBlur={onBlur}
          disabled={disabled}
          error={error}
        />
      );

    case "date":
      return (
        <DateField
          id={fieldId}
          label={field.label}
          value={(value as string) || ""}
          onChange={(val) => onChange(val)}
          onBlur={onBlur}
          disabled={disabled}
          error={error}
        />
      );

    case "currency":
      return (
        <CurrencyField
          id={fieldId}
          label={field.label}
          value={(value as string) || ""}
          onChange={(val) => onChange(val)}
          onBlur={onBlur}
          disabled={disabled}
          error={error}
        />
      );

    case "checkbox":
      return (
        <CheckboxField
          id={fieldId}
          label={field.label}
          checked={(value as boolean) || false}
          onChange={(val) => onChange(val)}
          notes={field.notes}
          disabled={disabled}
        />
      );

    case "yesno":
      return (
        <YesNoField
          id={fieldId}
          label={field.label}
          value={(value as "Yes" | "No") || ""}
          onChange={(val) => onChange(val)}
          disabled={disabled}
        />
      );

    case "radio":
      return (
        <RadioField
          id={fieldId}
          label={field.label}
          value={(value as string) || ""}
          onChange={(val) => onChange(val)}
          options={field.options as string[]}
          disabled={disabled}
        />
      );

    case "multicheck": {
      const otherFieldId = field.other_field_id ? (prefix ? `${prefix}.${field.other_field_id}` : field.other_field_id) : undefined;
      return (
        <MulticheckField
          id={fieldId}
          label={field.label}
          value={(value as string[]) || []}
          onChange={(val) => onChange(val)}
          options={field.options || []}
          otherFieldId={otherFieldId}
          otherValue={otherFieldId && formData && updateField ? (formData[otherFieldId] as string) || "" : ""}
          onOtherChange={otherFieldId && updateField ? (val) => updateField(otherFieldId, val) : undefined}
        />
      );
    }

    case "select":
      return (
        <SelectField
          id={fieldId}
          label={field.label}
          value={(value as string) || ""}
          onChange={(val) => onChange(val)}
          options={field.options as string[]}
        />
      );

    case "signature":
      return (
        <SignatureField
          id={fieldId}
          label={field.label}
          value={(value as string) || ""}
          onChange={(val) => onChange(val)}
        />
      );

    case "group": {
      // Check if this is the investments table
      if (field.id === "other_investments_table") {
        const groupData = (value as Record<string, any>) || {};
        const fieldValues: Record<string, string> = {};
        field.fields?.forEach((subField) => {
          fieldValues[subField.id] = (groupData[subField.id] as string) || "";
        });

        return (
          <InvestmentTableField
            id={fieldId}
            label={field.label}
            fields={field.fields?.map((f) => ({ id: f.id, label: f.label })) || []}
            values={fieldValues}
            onChange={(subFieldId, val) => {
              const updated = { ...groupData, [subFieldId]: val };
              onChange(updated);
            }}
          />
        );
      }

      // Check if this is an investment knowledge table
      if (
        field.id === "primary_investment_knowledge_by_type" ||
        field.id === "secondary_investment_knowledge_by_type"
      ) {
        const groupData = (value as Record<string, any>) || {};
        const fieldValues: Record<string, string> = {};
        field.fields?.forEach((subField) => {
          fieldValues[subField.id] = (groupData[subField.id] as string) || "";
        });

        // For secondary, we need to include additional fields from the continued section
        let allFields = field.fields || [];
        if (field.id === "secondary_investment_knowledge_by_type" && formData && updateField) {
          // Add Alternative Investments and Other from the continued section
          const altInvKnowledge = (formData["secondary_alternative_investments_knowledge"] as string) || "";
          const altInvSince = (formData["secondary_alternative_investments_since"] as string) || "";
          const otherKnowledge = (formData["secondary_other_investments_knowledge"] as string) || "";
          const otherSince = (formData["secondary_other_investments_since"] as string) || "";
          
          allFields = [
            ...allFields,
            {
              id: "secondary_alternative_investments_knowledge",
              label: "Alternative Investments - Knowledge",
              type: "radio",
              options: ["Limited", "Moderate", "Extensive", "None"],
            },
            {
              id: "secondary_alternative_investments_since",
              label: "Since Year",
              type: "text",
            },
            {
              id: "secondary_other_investments_knowledge",
              label: "Other - Knowledge",
              type: "radio",
              options: ["Limited", "Moderate", "Extensive", "None"],
            },
            {
              id: "secondary_other_investments_since",
              label: "Since Year",
              type: "text",
            },
          ];
          
          // Merge values from continued section (always include, even if empty)
          fieldValues["secondary_alternative_investments_knowledge"] = altInvKnowledge;
          fieldValues["secondary_alternative_investments_since"] = altInvSince;
          fieldValues["secondary_other_investments_knowledge"] = otherKnowledge;
          fieldValues["secondary_other_investments_since"] = otherSince;
        }

        // Check if we have Other investment fields for primary
        const isPrimary = field.id === "primary_investment_knowledge_by_type";
        let otherLabelFieldId: string | undefined;
        let otherLabelValue = "";
        let showOtherRow = false;
        
        if (isPrimary && formData) {
          // Add Other investment fields from continued section for primary
          const otherKnowledge = (formData["other_investment_knowledge_value"] as string) || "";
          const otherSince = (formData["other_investment_since_year"] as string) || "";
          otherLabelFieldId = "other_investment_knowledge_label";
          otherLabelValue = (formData[otherLabelFieldId] as string) || "";
          
          // Merge Other investment values
          fieldValues["other_investment_knowledge_value"] = otherKnowledge;
          fieldValues["other_investment_since_year"] = otherSince;
          
          // Add Other fields to allFields for the table
          allFields = [
            ...allFields,
            {
              id: "other_investment_knowledge_value",
              label: "Other - Knowledge",
              type: "radio",
              options: ["Limited", "Moderate", "Extensive", "None"],
            },
            {
              id: "other_investment_since_year",
              label: "Since Year",
              type: "text",
            },
          ];
          
          showOtherRow = true;
        }
        
        return (
          <KnowledgeTableField
            id={fieldId}
            label={field.label}
            fields={allFields.map((f) => ({
              id: f.id,
              label: f.label,
              type: f.type as "radio" | "text",
              options: f.options as string[],
            }))}
            values={fieldValues}
            onChange={(subFieldId, val) => {
              // If it's a continued section field, update formData directly
              if (
                subFieldId === "secondary_alternative_investments_knowledge" ||
                subFieldId === "secondary_alternative_investments_since" ||
                subFieldId === "secondary_other_investments_knowledge" ||
                subFieldId === "secondary_other_investments_since"
              ) {
                updateField?.(subFieldId, val);
              } else if (subFieldId === "other_investment_knowledge_value" || subFieldId === "other_investment_since_year") {
                // Update Other investment fields directly in formData
                updateField?.(subFieldId, val);
              } else {
                const updated = { ...groupData, [subFieldId]: val };
                onChange(updated);
              }
            }}
            showOtherRow={showOtherRow}
            otherLabelFieldId={otherLabelFieldId}
            otherLabelValue={otherLabelValue}
            onOtherLabelChange={otherLabelFieldId && updateField ? (val) => updateField(otherLabelFieldId, val) : undefined}
          />
        );
      }

      // Check if this is a government ID table (repeatable)
      if (
        field.repeatable &&
        (field.id === "unexpired_government_identification" ||
          field.id === "secondary_unexpired_government_identification")
      ) {
        const currentData = (value as Record<string, any>[]) || [];
        const tableData = currentData.length >= 2 ? currentData : [...currentData, ...Array(2 - currentData.length).fill({})];

        return (
          <GovernmentIdTableField
            id={fieldId}
            label={field.label}
            fields={
              field.fields?.map((f) => ({
                id: f.id,
                label: f.label,
                type: f.type as "text" | "date",
              })) || []
            }
            values={tableData}
            onChange={(index, subFieldId, val) => {
              const updated = [...tableData];
              if (!updated[index]) updated[index] = {};
              updated[index][subFieldId] = val;
              onChange(updated);
            }}
            notes={field.notes}
          />
        );
      }

      // Check if this is financial information group
      if (
        field.id === "financial_information" ||
        field.id === "secondary_financial_information"
      ) {
        const groupData = (value as Record<string, any>) || {};
        // Handle different field name patterns for secondary
        const incomeFromKey = groupData.annual_income_from ? "annual_income_from" : "annual_income_from_2";
        const incomeToKey = groupData.annual_income_to ? "annual_income_to" : "annual_income_to_2";
        const netWorthFromKey = groupData.net_worth_from ? "net_worth_from" : "net_worth_from_2";
        const netWorthToKey = groupData.net_worth_to ? "net_worth_to" : "net_worth_to_2";
        const liquidFromKey = groupData.liquid_net_worth_from ? "liquid_net_worth_from" : "liquid_net_worth_from_2";
        const liquidToKey = groupData.liquid_net_worth_to ? "liquid_net_worth_to" : "liquid_net_worth_to_2";
        const taxBracketKey = groupData.tax_bracket ? "tax_bracket" : "tax_bracket_2";
        
        return (
          <FinancialInformationSection
            annualIncomeFrom={(groupData[incomeFromKey] as string) || ""}
            annualIncomeTo={(groupData[incomeToKey] as string) || ""}
            onAnnualIncomeFromChange={(val) => {
              const updated = { ...groupData, [incomeFromKey]: val };
              onChange(updated);
            }}
            onAnnualIncomeToChange={(val) => {
              const updated = { ...groupData, [incomeToKey]: val };
              onChange(updated);
            }}
            netWorthFrom={(groupData[netWorthFromKey] as string) || ""}
            netWorthTo={(groupData[netWorthToKey] as string) || ""}
            onNetWorthFromChange={(val) => {
              const updated = { ...groupData, [netWorthFromKey]: val };
              onChange(updated);
            }}
            onNetWorthToChange={(val) => {
              const updated = { ...groupData, [netWorthToKey]: val };
              onChange(updated);
            }}
            liquidNetWorthFrom={(groupData[liquidFromKey] as string) || ""}
            liquidNetWorthTo={(groupData[liquidToKey] as string) || ""}
            onLiquidNetWorthFromChange={(val) => {
              const updated = { ...groupData, [liquidFromKey]: val };
              onChange(updated);
            }}
            onLiquidNetWorthToChange={(val) => {
              const updated = { ...groupData, [liquidToKey]: val };
              onChange(updated);
            }}
            taxBracket={(groupData[taxBracketKey] as string) || ""}
            onTaxBracketChange={(val) => {
              const updated = { ...groupData, [taxBracketKey]: val };
              onChange(updated);
            }}
          />
        );
      }

      // Default group rendering (non-table)
      const currentData = (value as Record<string, any>[]) || [];
      const initialData: Record<string, any>[] = field.repeatable ? [{}, {}] : [{}];
      const groupData: Record<string, any>[] = currentData.length > 0 ? currentData : initialData;

      return (
        <FieldGroup
          id={fieldId}
          label={field.label}
          repeatable={field.repeatable}
          canAdd={false}
          onAdd={() => onRepeatableAdd?.(fieldId)}
          index={repeatableIndex}
        >
          {groupData.map((_, index) => (
            <div key={index} className={index > 0 ? "mt-6 border-t border-slate-200 pt-6" : ""}>
              {field.repeatable && (
                <div className="mb-4 text-sm font-medium text-slate-600">ID #{index + 1}</div>
              )}
              {field.fields?.map((subField) => {
                const subFieldValue = groupData[index]?.[subField.id] ?? "";
                return (
                  <FieldRenderer
                    key={`${subField.id}-${index}`}
                    field={subField}
                    value={subFieldValue}
                    onChange={(val) => {
                      const updated = [...groupData];
                      if (!updated[index]) updated[index] = {};
                      updated[index][subField.id] = val;
                      onChange(updated);
                    }}
                    prefix={field.repeatable ? `${fieldId}[${index}]` : fieldId}
                    repeatableIndex={field.repeatable ? index : undefined}
                    formData={formData}
                    updateField={updateField}
                  />
                );
              })}
            </div>
          ))}
        </FieldGroup>
      );
    }

    default:
      return null;
  }
}

