import { SignatureField } from "./SignatureField";
import { TextField } from "./TextField";
import { DateField } from "./DateField";

interface SignatureErrors {
  signature?: string;
  printedName?: string;
  date?: string;
}

interface AccreditationSignaturesSectionProps {
  accountOwnerSignature: string;
  onAccountOwnerSignatureChange: (value: string) => void;
  accountOwnerPrintedName: string;
  onAccountOwnerPrintedNameChange: (value: string) => void;
  accountOwnerDate: string;
  onAccountOwnerDateChange: (value: string) => void;
  accountOwnerErrors?: SignatureErrors;

  jointAccountOwnerSignature: string;
  onJointAccountOwnerSignatureChange: (value: string) => void;
  jointAccountOwnerPrintedName: string;
  onJointAccountOwnerPrintedNameChange: (value: string) => void;
  jointAccountOwnerDate: string;
  onJointAccountOwnerDateChange: (value: string) => void;
  jointAccountOwnerErrors?: SignatureErrors;
  hasJointOwner?: boolean;

  financialProfessionalSignature: string;
  onFinancialProfessionalSignatureChange: (value: string) => void;
  financialProfessionalPrintedName: string;
  onFinancialProfessionalPrintedNameChange: (value: string) => void;
  financialProfessionalDate: string;
  onFinancialProfessionalDateChange: (value: string) => void;
  financialProfessionalErrors?: SignatureErrors;

  registeredPrincipalSignature: string;
  onRegisteredPrincipalSignatureChange: (value: string) => void;
  registeredPrincipalPrintedName: string;
  onRegisteredPrincipalPrintedNameChange: (value: string) => void;
  registeredPrincipalDate: string;
  onRegisteredPrincipalDateChange: (value: string) => void;
  registeredPrincipalErrors?: SignatureErrors;

  onAccountOwnerBlur?: (field: "signature" | "printedName" | "date") => void;
  onJointAccountOwnerBlur?: (field: "signature" | "printedName" | "date") => void;
  onFinancialProfessionalBlur?: (field: "signature" | "printedName" | "date") => void;
  onRegisteredPrincipalBlur?: (field: "signature" | "printedName" | "date") => void;
}

export function AccreditationSignaturesSection({
  accountOwnerSignature,
  onAccountOwnerSignatureChange,
  accountOwnerPrintedName,
  onAccountOwnerPrintedNameChange,
  accountOwnerDate,
  onAccountOwnerDateChange,
  accountOwnerErrors,
  onAccountOwnerBlur,
  jointAccountOwnerSignature,
  onJointAccountOwnerSignatureChange,
  jointAccountOwnerPrintedName,
  onJointAccountOwnerPrintedNameChange,
  jointAccountOwnerDate,
  onJointAccountOwnerDateChange,
  jointAccountOwnerErrors,
  onJointAccountOwnerBlur,
  hasJointOwner = false,
  financialProfessionalSignature,
  onFinancialProfessionalSignatureChange,
  financialProfessionalPrintedName,
  onFinancialProfessionalPrintedNameChange,
  financialProfessionalDate,
  onFinancialProfessionalDateChange,
  financialProfessionalErrors,
  onFinancialProfessionalBlur,
  registeredPrincipalSignature,
  onRegisteredPrincipalSignatureChange,
  registeredPrincipalPrintedName,
  onRegisteredPrincipalPrintedNameChange,
  registeredPrincipalDate,
  onRegisteredPrincipalDateChange,
  registeredPrincipalErrors,
  onRegisteredPrincipalBlur,
}: AccreditationSignaturesSectionProps) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">Signatures</h3>

      <div className="space-y-8">
        {/* Account Owner */}
        <div className="border-b border-slate-200 pb-6">
          <h4 className="text-base font-medium text-slate-700 mb-4">Account Owner</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SignatureField
              id="account_owner_signature"
              label="Signature"
              value={accountOwnerSignature}
              onChange={onAccountOwnerSignatureChange}
            />
            <TextField
              id="account_owner_printed_name"
              label="Printed Name"
              value={accountOwnerPrintedName}
              onChange={onAccountOwnerPrintedNameChange}
              floatingLabel={false}
              onBlur={() => onAccountOwnerBlur?.("printedName")}
              error={accountOwnerErrors?.printedName}
            />
            <DateField
              id="account_owner_date"
              label="Date"
              value={accountOwnerDate}
              onChange={onAccountOwnerDateChange}
              onBlur={() => onAccountOwnerBlur?.("date")}
              error={accountOwnerErrors?.date}
            />
          </div>
        </div>

        {/* Joint Account Owner */}
        {hasJointOwner && (
          <div className="border-b border-slate-200 pb-6">
            <h4 className="text-base font-medium text-slate-700 mb-4">Joint Account Owner</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SignatureField
                id="joint_account_owner_signature"
                label="Signature"
                value={jointAccountOwnerSignature}
                onChange={onJointAccountOwnerSignatureChange}
              />
              <TextField
                id="joint_account_owner_printed_name"
                label="Printed Name"
                value={jointAccountOwnerPrintedName}
                onChange={onJointAccountOwnerPrintedNameChange}
              floatingLabel={false}
                onBlur={() => onJointAccountOwnerBlur?.("printedName")}
                error={jointAccountOwnerErrors?.printedName}
              />
              <DateField
                id="joint_account_owner_date"
                label="Date"
                value={jointAccountOwnerDate}
                onChange={onJointAccountOwnerDateChange}
                onBlur={() => onJointAccountOwnerBlur?.("date")}
                error={jointAccountOwnerErrors?.date}
              />
            </div>
          </div>
        )}

        {/* Financial Professional */}
        <div className="border-b border-slate-200 pb-6">
          <h4 className="text-base font-medium text-slate-700 mb-4">Financial Professional</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SignatureField
              id="financial_professional_signature"
              label="Signature"
              value={financialProfessionalSignature}
              onChange={onFinancialProfessionalSignatureChange}
            />
            <TextField
              id="financial_professional_printed_name"
              label="Printed Name"
              value={financialProfessionalPrintedName}
              onChange={onFinancialProfessionalPrintedNameChange}
              floatingLabel={false}
              onBlur={() => onFinancialProfessionalBlur?.("printedName")}
              error={financialProfessionalErrors?.printedName}
            />
            <DateField
              id="financial_professional_date"
              label="Date"
              value={financialProfessionalDate}
              onChange={onFinancialProfessionalDateChange}
              onBlur={() => onFinancialProfessionalBlur?.("date")}
              error={financialProfessionalErrors?.date}
            />
          </div>
        </div>

        {/* Registered Principal */}
        <div>
          <h4 className="text-base font-medium text-slate-700 mb-4">REALTA INTERNAL USE ONLY — Registered Principal</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SignatureField
              id="registered_principal_signature"
              label="Signature"
              value={registeredPrincipalSignature}
              onChange={onRegisteredPrincipalSignatureChange}
            />
            <TextField
              id="registered_principal_printed_name"
              label="Printed Name"
              value={registeredPrincipalPrintedName}
              onChange={onRegisteredPrincipalPrintedNameChange}
              floatingLabel={false}
              onBlur={() => onRegisteredPrincipalBlur?.("printedName")}
              error={registeredPrincipalErrors?.printedName}
            />
            <DateField
              id="registered_principal_date"
              label="Date"
              value={registeredPrincipalDate}
              onChange={onRegisteredPrincipalDateChange}
              onBlur={() => onRegisteredPrincipalBlur?.("date")}
              error={registeredPrincipalErrors?.date}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

