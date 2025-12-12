import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { TextareaField } from "./TextareaField";
import { TextField } from "./TextField";

interface TrustedContactSectionProps {
  declineToProvide: boolean;
  onDeclineToProvideChange: (checked: boolean) => void;
  name: string;
  onNameChange: (value: string) => void;
  email: string;
  onEmailChange: (value: string) => void;
  homePhone: string;
  onHomePhoneChange: (value: string) => void;
  businessPhone: string;
  onBusinessPhoneChange: (value: string) => void;
  mobilePhone: string;
  onMobilePhoneChange: (value: string) => void;
  mailingAddress: string;
  onMailingAddressChange: (value: string) => void;
  city: string;
  onCityChange: (value: string) => void;
  stateProvince: string;
  onStateProvinceChange: (value: string) => void;
  zipPostalCode: string;
  onZipPostalCodeChange: (value: string) => void;
  country: string;
  onCountryChange: (value: string) => void;
}

export function TrustedContactSection({
  declineToProvide,
  onDeclineToProvideChange,
  name,
  onNameChange,
  email,
  onEmailChange,
  homePhone,
  onHomePhoneChange,
  businessPhone,
  onBusinessPhoneChange,
  mobilePhone,
  onMobilePhoneChange,
  mailingAddress,
  onMailingAddressChange,
  city,
  onCityChange,
  stateProvince,
  onStateProvinceChange,
  zipPostalCode,
  onZipPostalCodeChange,
  country,
  onCountryChange,
}: TrustedContactSectionProps) {
  return (
    <div>
      {/* Gray Header Bar */}
      <div className="bg-slate-200 px-6 py-3 rounded-t-xl">
        <h3 className="text-base font-semibold text-slate-900">STEP 6. TRUSTED CONTACT</h3>
      </div>

      {/* Content */}
      <div className="bg-white px-6 py-4 border-x border-b border-slate-200 rounded-b-xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Section - Contact Information Fields */}
          {!declineToProvide && (
          <div className="space-y-4">
            <TextField
              id="trusted_contact_name"
              label="Name"
              value={name}
              onChange={onNameChange}
            />
            
            <TextField
              id="trusted_contact_email"
              label="Email"
              value={email}
              onChange={onEmailChange}
            />
            
            {/* Three phone fields on same line */}
            <div className="grid grid-cols-3 gap-4">
              <TextField
                id="trusted_contact_home_phone"
                label="Home Phone"
                value={homePhone}
                onChange={onHomePhoneChange}
              />
              <TextField
                id="trusted_contact_business_phone"
                label="Business Phone"
                value={businessPhone}
                onChange={onBusinessPhoneChange}
              />
              <TextField
                id="trusted_contact_mobile_phone"
                label="Mobile Phone"
                value={mobilePhone}
                onChange={onMobilePhoneChange}
              />
            </div>
            
            <TextareaField
              id="trusted_contact_mailing_address"
              label="Mailing Address"
              value={mailingAddress}
              onChange={onMailingAddressChange}
              rows={3}
            />
            
            {/* City, State/Province, Zip/Postal Code on same line */}
            <div className="grid grid-cols-3 gap-4">
              <TextField
                id="trusted_contact_city"
                label="City"
                value={city}
                onChange={onCityChange}
              />
              <TextField
                id="trusted_contact_state_province"
                label="State/Province"
                value={stateProvince}
                onChange={onStateProvinceChange}
              />
              <TextField
                id="trusted_contact_zip_postal_code"
                label="Zip/Postal Code"
                value={zipPostalCode}
                onChange={onZipPostalCodeChange}
              />
            </div>
            
            <TextField
              id="trusted_contact_country"
              label="Country"
              value={country}
              onChange={onCountryChange}
            />
          </div>
          )}

          {/* Right Section - Decline Option and Disclaimer */}
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <Checkbox
                id="trusted_contact_decline"
                checked={declineToProvide}
                onCheckedChange={(checked) => onDeclineToProvideChange(checked === true)}
              />
              <label
                htmlFor="trusted_contact_decline"
                className="text-sm font-medium text-slate-700 cursor-pointer"
              >
                I/We Decline to Provide
              </label>
            </div>
            
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                If you provide a trusted contact, you authorize us to contact the Trusted Contact and to disclose to the Trusted Contact information about your account to address possible financial exploitation, to confirm the specifics of your current contact information, health status, or the identity of any legal guardian, executor, trustee or holder of a power of attorney.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

