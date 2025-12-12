import SignatureCanvas from "../SignatureCanvas";

interface SignatureFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function SignatureField({ id, label, value, onChange }: SignatureFieldProps) {
  return <SignatureCanvas fieldId={id} label={label} value={value} onChange={onChange} />;
}

