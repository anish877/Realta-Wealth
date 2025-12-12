import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface InvestmentTableFieldProps {
  id: string;
  label: string;
  fields: Array<{ id: string; label: string }>;
  values: Record<string, string>;
  onChange: (fieldId: string, value: string) => void;
}

export function InvestmentTableField({
  id,
  label,
  fields,
  values,
  onChange,
}: InvestmentTableFieldProps) {
  // Group fields into rows of 2
  const rows: Array<Array<{ id: string; label: string }>> = [];
  for (let i = 0; i < fields.length; i += 2) {
    rows.push(fields.slice(i, i + 2));
  }

  return (
    <div className="mb-6">
      <Label className="mb-4 block text-base font-semibold">{label}</Label>
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Investment Type</TableHead>
              <TableHead>Value ($)</TableHead>
              <TableHead>Investment Type</TableHead>
              <TableHead>Value ($)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {row.map((field) => (
                  <React.Fragment key={field.id}>
                    <TableCell className="font-medium text-slate-700">
                      {field.label.replace(" - Value $", "")}
                    </TableCell>
                    <TableCell>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                        <Input
                          id={`${id}.${field.id}`}
                          type="text"
                          value={values[field.id] || ""}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9.]/g, "");
                            onChange(field.id, val);
                          }}
                          placeholder="0.00"
                          className="pl-8 h-10"
                        />
                      </div>
                    </TableCell>
                  </React.Fragment>
                ))}
                {row.length === 1 && (
                  <>
                    <TableCell />
                    <TableCell />
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

