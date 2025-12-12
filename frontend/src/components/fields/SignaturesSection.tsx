import { SignatureField } from "./SignatureField";
import { TextField } from "./TextField";
import { DateField } from "./DateField";

interface SignaturesSectionProps {
  // Account Owner
  accountOwnerSignature: string;
  onAccountOwnerSignatureChange: (value: string) => void;
  accountOwnerPrintedName: string;
  onAccountOwnerPrintedNameChange: (value: string) => void;
  accountOwnerDate: string;
  onAccountOwnerDateChange: (value: string) => void;
  
  // Joint Account Owner
  jointAccountOwnerSignature: string;
  onJointAccountOwnerSignatureChange: (value: string) => void;
  jointAccountOwnerPrintedName: string;
  onJointAccountOwnerPrintedNameChange: (value: string) => void;
  jointAccountOwnerDate: string;
  onJointAccountOwnerDateChange: (value: string) => void;
  
  // Financial Professional
  financialProfessionalSignature: string;
  onFinancialProfessionalSignatureChange: (value: string) => void;
  financialProfessionalPrintedName: string;
  onFinancialProfessionalPrintedNameChange: (value: string) => void;
  financialProfessionalDate: string;
  onFinancialProfessionalDateChange: (value: string) => void;
  
  // Supervisor/Principal
  supervisorPrincipalSignature: string;
  onSupervisorPrincipalSignatureChange: (value: string) => void;
  supervisorPrincipalPrintedName: string;
  onSupervisorPrincipalPrintedNameChange: (value: string) => void;
  supervisorPrincipalDate: string;
  onSupervisorPrincipalDateChange: (value: string) => void;
}

export function SignaturesSection({
  accountOwnerSignature,
  onAccountOwnerSignatureChange,
  accountOwnerPrintedName,
  onAccountOwnerPrintedNameChange,
  accountOwnerDate,
  onAccountOwnerDateChange,
  jointAccountOwnerSignature,
  onJointAccountOwnerSignatureChange,
  jointAccountOwnerPrintedName,
  onJointAccountOwnerPrintedNameChange,
  jointAccountOwnerDate,
  onJointAccountOwnerDateChange,
  financialProfessionalSignature,
  onFinancialProfessionalSignatureChange,
  financialProfessionalPrintedName,
  onFinancialProfessionalPrintedNameChange,
  financialProfessionalDate,
  onFinancialProfessionalDateChange,
  supervisorPrincipalSignature,
  onSupervisorPrincipalSignatureChange,
  supervisorPrincipalPrintedName,
  onSupervisorPrincipalPrintedNameChange,
  supervisorPrincipalDate,
  onSupervisorPrincipalDateChange,
}: SignaturesSectionProps) {
  return (
    <div className="space-y-6">
      {/* Header + summary */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-slate-100/70 px-6 py-4 border-b border-slate-200">
          <h3 className="text-base font-semibold text-slate-900">STEP 7. SIGNATURES</h3>
        </div>
        <div className="px-6 py-5 space-y-5">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-900">Attestations</p>
            <ul className="list-disc list-inside space-y-2 text-sm text-slate-700 ml-2">
              <li>
                I/we attest that the data above is accurate and complete, and I understand and agree that you may rely upon this information in making any investment or portfolio recommendation to me.
              </li>
              <li>
                I/we agree to report changes in my financial and personal circumstances to my financial professional in a timely fashion to assure my investor profile is accurate and complete.
              </li>
              <li>
                I/we affirm that I/we have received and reviewed the firm's Form CRS, Form ADV II, Retirement Investor Disclosure, Privacy Policy, and my advisor’s representative Form ADV IIB.
              </li>
            </ul>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-200">
            <p className="text-sm font-semibold text-slate-900">Taxpayer Certification – Under penalties of perjury, I certify that:</p>
            <ul className="list-disc list-inside space-y-2 text-sm text-slate-700 ml-2">
              <li>The number shown on this form in Step 3 is my correct Social Security Number or Taxpayer Identification Number.</li>
              <li>I am a U.S. citizen or other U.S. Person (defined below).</li>
            </ul>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-200">
            <p className="text-sm font-semibold text-slate-900">Definition of a U.S. Person:</p>
            <ul className="list-disc list-inside space-y-2 text-sm text-slate-700 ml-2">
              <li>An individual who is a U.S. citizen or U.S. resident alien</li>
              <li>A partnership, corporation, company or association created or organized in the U.S. or under U.S. law</li>
              <li>An estate (other than a foreign estate)</li>
              <li>A domestic trust (as defined in regulations section 301.7701-7)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Signature blocks */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Account Owner */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-900">Account Owner Signature</p>
              <span className="text-xs text-slate-500">Required</span>
            </div>
            <SignatureField
              id="account_owner_signature"
              label=""
              value={accountOwnerSignature}
              onChange={onAccountOwnerSignatureChange}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:items-end">
              <TextField
                id="account_owner_printed_name"
                label="Printed Name"
                value={accountOwnerPrintedName}
                onChange={onAccountOwnerPrintedNameChange}
              />
              <DateField
                id="account_owner_date"
                label="Date"
                value={accountOwnerDate}
                onChange={onAccountOwnerDateChange}
              />
            </div>
          </div>

          {/* Joint Account Owner */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-900">Joint Account Owner Signature</p>
              <span className="text-xs text-slate-500">If applicable</span>
            </div>
            <SignatureField
              id="joint_account_owner_signature"
              label=""
              value={jointAccountOwnerSignature}
              onChange={onJointAccountOwnerSignatureChange}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:items-end">
              <TextField
                id="joint_account_owner_printed_name"
                label="Printed Name"
                value={jointAccountOwnerPrintedName}
                onChange={onJointAccountOwnerPrintedNameChange}
              />
              <DateField
                id="joint_account_owner_date"
                label="Date"
                value={jointAccountOwnerDate}
                onChange={onJointAccountOwnerDateChange}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Financial Professional */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-900">Financial Professional Signature</p>
              <span className="text-xs text-slate-500">Required</span>
            </div>
            <SignatureField
              id="financial_professional_signature"
              label=""
              value={financialProfessionalSignature}
              onChange={onFinancialProfessionalSignatureChange}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:items-end">
              <TextField
                id="financial_professional_printed_name"
                label="Printed Name"
                value={financialProfessionalPrintedName}
                onChange={onFinancialProfessionalPrintedNameChange}
              />
              <DateField
                id="financial_professional_date"
                label="Date"
                value={financialProfessionalDate}
                onChange={onFinancialProfessionalDateChange}
              />
            </div>
          </div>

          {/* Supervisor / Principal */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-900">Supervisor / Principal Signature</p>
              <span className="text-xs text-slate-500">Required</span>
            </div>
            <SignatureField
              id="supervisor_principal_signature"
              label=""
              value={supervisorPrincipalSignature}
              onChange={onSupervisorPrincipalSignatureChange}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:items-end">
              <TextField
                id="supervisor_principal_printed_name"
                label="Printed Name"
                value={supervisorPrincipalPrintedName}
                onChange={onSupervisorPrincipalPrintedNameChange}
              />
              <DateField
                id="supervisor_principal_date"
                label="Date"
                value={supervisorPrincipalDate}
                onChange={onSupervisorPrincipalDateChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

