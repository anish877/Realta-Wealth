import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface GovernmentIdField {
  id: string;
  label: string;
  type: "text" | "date";
}

interface GovernmentIdTableFieldProps {
  id: string;
  label: string;
  fields: GovernmentIdField[];
  values: Array<Record<string, string>>;
  onChange: (index: number, fieldId: string, value: string) => void;
  notes?: string;
}

export function GovernmentIdTableField({
  id,
  label,
  fields,
  values,
  onChange,
  notes,
}: GovernmentIdTableFieldProps) {
  // Initialize with 2 entries (ID #1 and ID #2)
  const tableData = values.length >= 2 ? values : [...values, ...Array(2 - values.length).fill({})];

  return (
    <div className="mb-6">
      <Label className="mb-4 block text-base font-semibold">{label}</Label>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">ID #</TableHead>
                  {fields.map((field) => (
                    <TableHead key={field.id}>{field.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.map((rowData, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium text-slate-700">
                      #{index + 1}
                    </TableCell>
                    {fields.map((field) => (
                      <TableCell key={field.id}>
                        <Input
                          id={`${id}[${index}].${field.id}`}
                          type={field.type === "date" ? "date" : "text"}
                          value={rowData[field.id] || ""}
                          onChange={(e) => onChange(index, field.id, e.target.value)}
                          placeholder={field.label}
                          className="h-10 text-sm"
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        {notes && (
          <div className="lg:col-span-1">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-xs text-slate-600 leading-relaxed">{notes}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

