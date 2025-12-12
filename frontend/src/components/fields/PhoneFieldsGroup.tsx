import { TextField } from "./TextField";

interface PhoneFieldsGroupProps {
  prefix: string;
  values: {
    home: string;
    business: string;
    mobile: string;
  };
  onChange: (field: string, value: string) => void;
}

export function PhoneFieldsGroup({
  prefix,
  values,
  onChange,
}: PhoneFieldsGroupProps) {
  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TextField
          id={`${prefix}_home_phone`}
          label="Home Phone"
          value={values.home}
          onChange={(val) => onChange("home", val)}
          type="tel"
        />
        <TextField
          id={`${prefix}_business_phone`}
          label="Business Phone"
          value={values.business}
          onChange={(val) => onChange("business", val)}
          type="tel"
        />
        <TextField
          id={`${prefix}_mobile_phone`}
          label="Mobile Phone"
          value={values.mobile}
          onChange={(val) => onChange("mobile", val)}
          type="tel"
        />
      </div>
    </div>
  );
}

