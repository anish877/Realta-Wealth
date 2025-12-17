import { SignatureField } from "./SignatureField";
import { TextField } from "./TextField";
import { DateField } from "./DateField";

interface StatementSignaturesSectionProps {
  // Account Owner
  accountOwnerSignature: string;
  onAccountOwnerSignatureChange: (value: string) => void;
  accountOwnerPrintedName: string;
  onAccountOwnerPrintedNameChange: (value: string) => void;
  accountOwnerDate: string;
  onAccountOwnerDateChange: (value: string) => void;
  accountOwnerErrors?: {
    signature?: string;
    printedName?: string;
    date?: string;
  };
  onAccountOwnerBlur?: (field: "signature" | "printedName" | "date") => void;
  
  // Joint Account Owner
  jointAccountOwnerSignature: string;
  onJointAccountOwnerSignatureChange: (value: string) => void;
  jointAccountOwnerPrintedName: string;
  onJointAccountOwnerPrintedNameChange: (value: string) => void;
  jointAccountOwnerDate: string;
  onJointAccountOwnerDateChange: (value: string) => void;
  jointAccountOwnerErrors?: {
    signature?: string;
    printedName?: string;
    date?: string;
  };
  onJointAccountOwnerBlur?: (field: "signature" | "printedName" | "date") => void;
  
  // Financial Professional
  financialProfessionalSignature: string;
  onFinancialProfessionalSignatureChange: (value: string) => void;
  financialProfessionalPrintedName: string;
  onFinancialProfessionalPrintedNameChange: (value: string) => void;
  financialProfessionalDate: string;
  onFinancialProfessionalDateChange: (value: string) => void;
  financialProfessionalErrors?: {
    signature?: string;
    printedName?: string;
    date?: string;
  };
  onFinancialProfessionalBlur?: (field: "signature" | "printedName" | "date") => void;
  
  // Registered Principal
  registeredPrincipalSignature: string;
  onRegisteredPrincipalSignatureChange: (value: string) => void;
  registeredPrincipalPrintedName: string;
  onRegisteredPrincipalPrintedNameChange: (value: string) => void;
  registeredPrincipalDate: string;
  onRegisteredPrincipalDateChange: (value: string) => void;
  registeredPrincipalErrors?: {
    signature?: string;
    printedName?: string;
    date?: string;
  };
  onRegisteredPrincipalBlur?: (field: "signature" | "printedName" | "date") => void;
  
  hasJointOwner?: boolean;
}

export function StatementSignaturesSection({
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
  hasJointOwner = false,
}: StatementSignaturesSectionProps) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">Signatures</h3>
      
      <div className="space-y-8">
        {/* Account Owner */}
        <div className="border-b border-slate-200 pb-6">
          <h4 className="text-base font-medium text-slate-700 mb-4">Account Owner</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <SignatureField
                id="account_owner_signature"
                label="Account Owner Signature"
                value={accountOwnerSignature}
                onChange={onAccountOwnerSignatureChange}
              />
            </div>
            <div>
              <TextField
                id="account_owner_printed_name"
                label="Printed Name"
                value={accountOwnerPrintedName}
                onChange={onAccountOwnerPrintedNameChange}
                onBlur={() => onAccountOwnerBlur?.("printedName")}
                error={accountOwnerErrors?.printedName}
              />
            </div>
            <div>
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
        </div>

        {/* Joint Account Owner - only show if has_joint_owner is true */}
        {hasJointOwner && (
          <div className="border-b border-slate-200 pb-6">
            <h4 className="text-base font-medium text-slate-700 mb-4">Joint Account Owner</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <SignatureField
                  id="joint_account_owner_signature"
                  label="Joint Account Owner Signature"
                  value={jointAccountOwnerSignature}
                  onChange={onJointAccountOwnerSignatureChange}
                />
                {jointAccountOwnerErrors?.signature && (
                  <p className="mt-1 text-xs text-red-600">{jointAccountOwnerErrors.signature}</p>
                )}
              </div>
              <div>
                <TextField
                  id="joint_account_owner_printed_name"
                  label="Printed Name"
                  value={jointAccountOwnerPrintedName}
                  onChange={onJointAccountOwnerPrintedNameChange}
                  onBlur={() => onJointAccountOwnerBlur?.("printedName")}
                  error={jointAccountOwnerErrors?.printedName}
                />
              </div>
              <div>
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
          </div>
        )}

        {/* Financial Professional */}
        <div className="border-b border-slate-200 pb-6">
          <h4 className="text-base font-medium text-slate-700 mb-4">Financial Professional</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <SignatureField
                id="financial_professional_signature"
                label="Financial Professional Signature"
                value={financialProfessionalSignature}
                onChange={onFinancialProfessionalSignatureChange}
              />
            </div>
            <div>
              <TextField
                id="financial_professional_printed_name"
                label="Printed Name"
                value={financialProfessionalPrintedName}
                onChange={onFinancialProfessionalPrintedNameChange}
                onBlur={() => onFinancialProfessionalBlur?.("printedName")}
                error={financialProfessionalErrors?.printedName}
              />
            </div>
            <div>
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
        </div>

        {/* Registered Principal */}
        <div>
          <h4 className="text-base font-medium text-slate-700 mb-4">Registered Principal</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <SignatureField
                id="registered_principal_signature"
                label="Registered Principal Signature"
                value={registeredPrincipalSignature}
                onChange={onRegisteredPrincipalSignatureChange}
              />
            </div>
            <div>
              <TextField
                id="registered_principal_printed_name"
                label="Printed Name"
                value={registeredPrincipalPrintedName}
                onChange={onRegisteredPrincipalPrintedNameChange}
                onBlur={() => onRegisteredPrincipalBlur?.("printedName")}
                error={registeredPrincipalErrors?.printedName}
              />
            </div>
            <div>
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
    </div>
  );
}

