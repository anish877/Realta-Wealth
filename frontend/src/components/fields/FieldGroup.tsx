import { ReactNode } from "react";
import { Button } from "../ui/button";

interface FieldGroupProps {
  id: string;
  label: string;
  children: ReactNode;
  repeatable?: boolean;
  onAdd?: () => void;
  canAdd?: boolean;
  index?: number;
}

export function FieldGroup({ id, label, children, repeatable, onAdd, canAdd, index }: FieldGroupProps) {
  return (
    <div className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-6">
      <h3 className="mb-4 text-base font-semibold text-slate-900">{label}</h3>
      {repeatable && index !== undefined && index > 0 && (
        <div className="mb-4 text-sm font-medium text-slate-600">ID #{index + 1}</div>
      )}
      <div className={index !== undefined && index > 0 ? "border-t border-slate-200 pt-6" : ""}>{children}</div>
      {repeatable && canAdd && onAdd && (
        <Button type="button" variant="outline" size="sm" onClick={onAdd} className="mt-4">
          + Add Another ID
        </Button>
      )}
    </div>
  );
}

