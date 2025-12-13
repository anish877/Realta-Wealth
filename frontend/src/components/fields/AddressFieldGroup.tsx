import { TextareaField } from "./TextareaField";
import { TextField } from "./TextField";
import { CheckboxField } from "./CheckboxField";

interface AddressFieldGroupProps {
  prefix: string;
  label: string;
  addressFieldId?: string; // Optional: if different from prefix_address (e.g., primary_legal_address vs primary_address)
  values: {
    address: string;
    city: string;
    stateProvince: string;
    zipPostalCode: string;
    country: string;
  };
  onChange: (field: string, value: string) => void;
  showMailingSameAsLegal?: boolean;
  mailingSameAsLegal?: boolean;
  onMailingSameAsLegalChange?: (checked: boolean) => void;
}

export function AddressFieldGroup({
  prefix,
  label,
  addressFieldId,
  values,
  onChange,
  showMailingSameAsLegal = false,
  mailingSameAsLegal = false,
  onMailingSameAsLegalChange,
}: AddressFieldGroupProps) {
  const shouldHideFields = showMailingSameAsLegal && mailingSameAsLegal;
  const addressId = addressFieldId || `${prefix}_address`;

  return (
    <div className="mb-6 space-y-4">
      <h3 className="text-base font-semibold text-slate-900 mb-4">{label}</h3>
      
      {showMailingSameAsLegal && onMailingSameAsLegalChange && (
        <CheckboxField
          id={`${prefix}_same_as_legal`}
          label="Mailing address same as legal address"
          checked={mailingSameAsLegal}
          onChange={onMailingSameAsLegalChange}
        />
      )}
      
      {!shouldHideFields && (
        <>
          <TextareaField
            id={addressId}
            label={showMailingSameAsLegal ? "Mailing Address (if different from legal address)" : "Address"}
            value={values.address}
            onChange={(val) => onChange("address", val)}
            rows={3}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TextField
              id={`${prefix}_city`}
              label="City"
              value={values.city}
              onChange={(val) => onChange("city", val)}
            />
            <TextField
              id={`${prefix}_state_province`}
              label="State/Province"
              value={values.stateProvince}
              onChange={(val) => onChange("stateProvince", val)}
            />
            <TextField
              id={`${prefix}_zip_postal_code`}
              label="Zip/Postal Code"
              value={values.zipPostalCode}
              onChange={(val) => onChange("zipPostalCode", val)}
            />
          </div>
          
          <TextField
            id={`${prefix}_country`}
            label="Country"
            value={values.country}
            onChange={(val) => onChange("country", val)}
          />
        </>
      )}
    </div>
  );
}

