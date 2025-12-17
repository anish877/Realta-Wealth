import SignatureCanvas from "../SignatureCanvas";

interface SignatureFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
}

export function SignatureField({ id, label, value, onChange }: SignatureFieldProps) {
  // SignatureCanvas currently handles input interactions; onBlur/error are accepted for API parity.
  return <SignatureCanvas fieldId={id} label={label} value={value} onChange={onChange} />;
}

