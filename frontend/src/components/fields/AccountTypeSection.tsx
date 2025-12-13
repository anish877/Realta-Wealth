import { CheckboxField } from "./CheckboxField";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

interface AccountTypeSectionProps {
  retailChecked: boolean;
  onRetailChange: (checked: boolean) => void;
  typeOfAccountValue: string[];
  onTypeOfAccountChange: (value: string[]) => void;
  additionalDesignationValue: string[];
  onAdditionalDesignationChange: (value: string[]) => void;
  trustChecked: boolean;
  onTrustChange: (checked: boolean) => void;
  trustEstablishmentDate: string;
  onTrustEstablishmentDateChange: (value: string) => void;
  trustTypeValue: string[];
  onTrustTypeChange: (value: string[]) => void;
  typeOfAccountRightValue: string[];
  onTypeOfAccountRightChange: (value: string[]) => void;
  otherAccountTypeText: string;
  onOtherAccountTypeTextChange: (value: string) => void;
  formData: Record<string, any>;
  updateField: (fieldId: string, value: any) => void;
  disabled?: boolean;
}

export function AccountTypeSection({
  retailChecked,
  onRetailChange,
  typeOfAccountValue,
  onTypeOfAccountChange,
  additionalDesignationValue,
  onAdditionalDesignationChange,
  trustChecked,
  onTrustChange,
  trustEstablishmentDate,
  onTrustEstablishmentDateChange,
  trustTypeValue,
  onTrustTypeChange,
  typeOfAccountRightValue,
  onTypeOfAccountRightChange,
  otherAccountTypeText,
  onOtherAccountTypeTextChange,
  formData,
  updateField,
  disabled = false,
}: AccountTypeSectionProps) {
  // Left column account types
  const leftAccountTypes = [
    { key: "individual", label: "Individual" },
    { key: "corporation", label: "Corporation" },
    { key: "corporate_pension_profit_sharing", label: "Corporate Pension/Profit Sharing" },
    { key: "custodial", label: "Custodial" },
    { key: "estate", label: "Estate" },
    { key: "joint_tenant", label: "Joint Tenant" },
    { key: "limited_liability_company", label: "Limited Liability/Company" },
    { key: "individual_single_member_llc", label: "Individual Single Member LLC" },
    { key: "sole_proprietorship", label: "Sole Proprietorship" },
    { key: "transfer_on_death_individual", label: "Transfer on Death Individual" },
    { key: "transfer_on_death_joint", label: "Transfer on Death Joint" },
  ];

  // Right column account types
  const rightAccountTypes = [
    { key: "trust", label: "Trust" },
    { key: "nonprofit_organization", label: "Nonprofit Organization" },
    { key: "partnership", label: "Partnership" },
    { key: "exempt_organization", label: "Exempt Organization" },
    { key: "other_account_type", label: "Other" },
  ];

  const trustTypeOptions = [
    { key: "charitable", label: "Charitable" },
    { key: "living", label: "Living" },
    { key: "irrevocable_living", label: "Irrevocable Living" },
    { key: "family", label: "Family" },
    { key: "revocable", label: "Revocable" },
    { key: "irrevocable", label: "Irrevocable" },
    { key: "testamentary", label: "Testamentary" },
  ];

  const handleToggle = (optionKey: string, checked: boolean, currentValues: string[], onChange: (val: string[]) => void) => {
    if (checked) {
      onChange([...currentValues, optionKey]);
    } else {
      onChange(currentValues.filter((v) => v !== optionKey));
    }
  };

  const renderAdditionalDesignation = (accountType: string, isChecked: boolean) => {
    // If not checked, show empty gray box
    if (!isChecked) {
      return <div className="h-8 bg-slate-100 rounded"></div>;
    }

    // Corporation - C Corp, S Corp
    if (accountType === "corporation") {
      return (
        <div className="space-y-2 py-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id={`additional-c-corp`}
              checked={additionalDesignationValue.includes("c_corp")}
              onCheckedChange={(checked) =>
                !disabled && handleToggle("c_corp", checked === true, additionalDesignationValue, onAdditionalDesignationChange)
              }
              disabled={disabled}
            />
            <label htmlFor={`additional-c-corp`} className="text-xs cursor-pointer">C Corp</label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id={`additional-s-corp`}
              checked={additionalDesignationValue.includes("s_corp")}
              onCheckedChange={(checked) =>
                !disabled && handleToggle("s_corp", checked === true, additionalDesignationValue, onAdditionalDesignationChange)
              }
              disabled={disabled}
            />
            <label htmlFor={`additional-s-corp`} className="text-xs cursor-pointer">S Corp</label>
          </div>
        </div>
      );
    }

    // Custodial - UGMA, UTMA
    if (accountType === "custodial") {
      return (
        <div className="space-y-2 py-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id={`additional-ugma`}
              checked={additionalDesignationValue.includes("ugma")}
              onCheckedChange={(checked) =>
                !disabled && handleToggle("ugma", checked === true, additionalDesignationValue, onAdditionalDesignationChange)
              }
              disabled={disabled}
            />
            <label htmlFor={`additional-ugma`} className="text-xs cursor-pointer">UGMA</label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id={`additional-utma`}
              checked={additionalDesignationValue.includes("utma")}
              onCheckedChange={(checked) =>
                !disabled && handleToggle("utma", checked === true, additionalDesignationValue, onAdditionalDesignationChange)
              }
              disabled={disabled}
            />
            <label htmlFor={`additional-utma`} className="text-xs cursor-pointer">UTMA</label>
          </div>
          <p className="text-xs text-slate-500 mt-1">Complete Custodian Section</p>
        </div>
      );
    }

    // Joint Tenant
    if (accountType === "joint_tenant") {
      return <p className="text-xs text-slate-500 py-2">Complete Joint Accounts Section</p>;
    }

    // Limited Liability/Company - C Corp, S Corp, Partnership
    if (accountType === "limited_liability_company") {
      return (
        <div className="space-y-2 py-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id={`additional-llc-c-corp`}
              checked={additionalDesignationValue.includes("c_corp")}
              onCheckedChange={(checked) =>
                !disabled && handleToggle("c_corp", checked === true, additionalDesignationValue, onAdditionalDesignationChange)
              }
              disabled={disabled}
            />
            <label htmlFor={`additional-llc-c-corp`} className="text-xs cursor-pointer">C Corp</label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id={`additional-llc-s-corp`}
              checked={additionalDesignationValue.includes("s_corp")}
              onCheckedChange={(checked) =>
                !disabled && handleToggle("s_corp", checked === true, additionalDesignationValue, onAdditionalDesignationChange)
              }
              disabled={disabled}
            />
            <label htmlFor={`additional-llc-s-corp`} className="text-xs cursor-pointer">S Corp</label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id={`additional-llc-partnership`}
              checked={additionalDesignationValue.includes("partnership")}
              onCheckedChange={(checked) =>
                !disabled && handleToggle("partnership", checked === true, additionalDesignationValue, onAdditionalDesignationChange)
              }
              disabled={disabled}
            />
            <label htmlFor={`additional-llc-partnership`} className="text-xs cursor-pointer">Partnership</label>
          </div>
        </div>
      );
    }

    // Transfer on Death Individual/Joint - Agreement Date
    if (accountType === "transfer_on_death_individual" || accountType === "transfer_on_death_joint") {
      const dateFieldId = accountType === "transfer_on_death_individual" 
        ? "transfer_on_death_individual_agreement_date" 
        : "transfer_on_death_joint_agreement_date";
      const dateValue = formData[dateFieldId] || "";
      return (
        <div className="py-2">
          <label className="text-xs text-slate-600 mb-1 block">Agreement Date:</label>
          <Input
            type="date"
            value={dateValue}
            onChange={(e) => !disabled && updateField(dateFieldId, e.target.value)}
            className="h-8 text-xs"
            disabled={disabled}
          />
        </div>
      );
    }

    // Trust - Establishment Date and Trust Type
    if (accountType === "trust") {
      return (
        <div className="space-y-3 py-2">
          <div>
            <label className="text-xs text-slate-600 mb-1 block">Establishment Date:</label>
                  <Input
                    type="date"
                    value={trustEstablishmentDate}
                    onChange={(e) => !disabled && onTrustEstablishmentDateChange(e.target.value)}
                    className="h-8 text-xs"
                    disabled={disabled}
                  />
          </div>
          <div>
            <label className="text-xs text-slate-600 mb-2 block">Trust Type:</label>
            <div className="space-y-1.5">
              {trustTypeOptions.map((option) => (
                <div key={option.key} className="flex items-center gap-2">
                  <Checkbox
                    id={`trust-type-${option.key}`}
                    checked={trustTypeValue.includes(option.key)}
                    onCheckedChange={(checked) =>
                      !disabled && handleToggle(option.key, checked === true, trustTypeValue, onTrustTypeChange)
                    }
                    disabled={disabled}
                  />
                  <label htmlFor={`trust-type-${option.key}`} className="text-xs cursor-pointer">
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Other - text input
    if (accountType === "other_account_type") {
      return (
        <div className="py-2">
                  <Input
                    type="text"
                    value={otherAccountTypeText}
                    onChange={(e) => !disabled && onOtherAccountTypeTextChange(e.target.value)}
                    placeholder="Specify..."
                    className="h-8 text-xs"
                    disabled={disabled}
                  />
        </div>
      );
    }

    // Default - grayed out box (for Individual, Individual Single Member LLC, Nonprofit, Exempt, etc.)
    return <div className="h-8 bg-slate-100 rounded"></div>;
  };

  return (
    <div className={`space-y-6 ${disabled ? "opacity-60" : ""}`}>
      {/* Retail Checkbox */}
      <CheckboxField
        id="retail_checkbox"
        label="Retail"
        checked={retailChecked}
        onChange={onRetailChange}
        notes="If Retail, additional documentation may be required."
        disabled={disabled}
      />

      {/* Two Side-by-Side Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Table */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>TYPE OF ACCOUNT</TableHead>
                <TableHead>ADDITIONAL DESIGNATION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leftAccountTypes.map((accountType) => {
                const isChecked = typeOfAccountValue.includes(accountType.key);
                return (
                  <TableRow key={accountType.key}>
                    <TableCell className="py-2">
                      <Checkbox
                        id={`account-type-left-${accountType.key}`}
                        checked={isChecked}
                        onCheckedChange={(checked) =>
                          !disabled && handleToggle(accountType.key, checked === true, typeOfAccountValue, onTypeOfAccountChange)
                        }
                        disabled={disabled}
                      />
                    </TableCell>
                    <TableCell className="py-2">
                      <label
                        htmlFor={`account-type-left-${accountType.key}`}
                        className="cursor-pointer text-sm text-slate-700"
                      >
                        {accountType.label}
                      </label>
                    </TableCell>
                    <TableCell className="min-w-[200px] py-2">
                      {renderAdditionalDesignation(accountType.key, isChecked)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Right Table */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>TYPE OF ACCOUNT</TableHead>
                <TableHead>ADDITIONAL DESIGNATION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rightAccountTypes.map((accountType) => {
                // For Trust, use trustChecked instead of typeOfAccountRightValue
                const isChecked = accountType.key === "trust" 
                  ? trustChecked 
                  : typeOfAccountRightValue.includes(accountType.key);
                
                const handleCheck = (checked: boolean) => {
                  if (accountType.key === "trust") {
                    onTrustChange(checked);
                    // Also update the type_of_account_right array
                    if (checked) {
                      onTypeOfAccountRightChange([...typeOfAccountRightValue, "trust"]);
                    } else {
                      onTypeOfAccountRightChange(typeOfAccountRightValue.filter((v) => v !== "trust"));
                    }
                  } else {
                    handleToggle(accountType.key, checked, typeOfAccountRightValue, onTypeOfAccountRightChange);
                  }
                };

                return (
                  <TableRow key={accountType.key}>
                    <TableCell className="py-2">
                      <Checkbox
                        id={`account-type-right-${accountType.key}`}
                        checked={isChecked}
                        onCheckedChange={(checked) => !disabled && handleCheck(checked === true)}
                        disabled={disabled}
                      />
                    </TableCell>
                    <TableCell className="py-2">
                      <label
                        htmlFor={`account-type-right-${accountType.key}`}
                        className="cursor-pointer text-sm text-slate-700"
                      >
                        {accountType.label}
                      </label>
                    </TableCell>
                    <TableCell className="min-w-[200px] py-2">
                      {renderAdditionalDesignation(accountType.key, isChecked)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
