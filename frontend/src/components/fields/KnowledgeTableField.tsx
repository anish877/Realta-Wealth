import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface KnowledgeField {
  id: string;
  label: string;
  type: "radio" | "text";
  options?: string[];
}

interface KnowledgeTableFieldProps {
  id: string;
  label: string;
  fields: KnowledgeField[];
  values: Record<string, string>;
  onChange: (fieldId: string, value: string) => void;
  showOtherRow?: boolean;
  otherLabelFieldId?: string;
  otherLabelValue?: string;
  onOtherLabelChange?: (value: string) => void;
}

export function KnowledgeTableField({
  id,
  label,
  fields,
  values,
  onChange,
  showOtherRow = false,
  otherLabelFieldId,
  otherLabelValue = "",
  onOtherLabelChange,
}: KnowledgeTableFieldProps) {
  // Group fields into pairs: [knowledge, since_year]
  const rows: Array<{ knowledge: KnowledgeField; sinceYear: KnowledgeField }> = [];
  for (let i = 0; i < fields.length; i += 2) {
    if (fields[i] && fields[i + 1]) {
      rows.push({
        knowledge: fields[i],
        sinceYear: fields[i + 1],
      });
    }
  }
  
  // Find Other investment fields if they exist
  const otherKnowledgeField = fields.find(f => f.id.includes("other") && f.type === "radio");
  const otherSinceField = fields.find(f => f.id.includes("other") && f.type === "text" && f.id.includes("since"));

  return (
    <div className="mb-6">
      <Label className="mb-4 block text-base font-semibold">{label}</Label>
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/3">Investment</TableHead>
              <TableHead className="w-1/3">Investment Knowledge</TableHead>
              <TableHead className="w-1/3">Investment Experience</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const investmentType = row.knowledge.label
                .replace(" - Knowledge", "")
                .replace("Knowledge and Experience by Investment Type (primary)", "")
                .replace("Knowledge and Experience by Investment Type (secondary)", "")
                .trim();
              
              const knowledgeValue = values[row.knowledge.id] || "";
              const sinceYearValue = values[row.sinceYear.id] || "";
              
              return (
                <TableRow key={row.knowledge.id}>
                  <TableCell className="font-medium text-slate-700">
                    {investmentType}
                  </TableCell>
                  <TableCell>
                    <RadioGroup
                      value={knowledgeValue}
                      onValueChange={(val) => onChange(row.knowledge.id, val)}
                    >
                      <div className="flex flex-wrap gap-4">
                        {(row.knowledge.options || []).map((option) => (
                          <div key={option} className="flex items-center gap-2">
                            <RadioGroupItem value={option} id={`${id}-${row.knowledge.id}-${option}`} />
                            <label
                              htmlFor={`${id}-${row.knowledge.id}-${option}`}
                              className="text-xs cursor-pointer"
                            >
                              {option}
                            </label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-slate-600">Since Year:</label>
                      <Input
                        id={`${id}.${row.sinceYear.id}`}
                        type="text"
                        value={sinceYearValue}
                        onChange={(e) => onChange(row.sinceYear.id, e.target.value)}
                        placeholder="Year"
                        className="h-8 w-20 text-xs"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {/* Other Investment Row - if enabled */}
            {showOtherRow && otherKnowledgeField && otherSinceField && (
              <TableRow>
                <TableCell className="font-medium text-slate-700">
                  {otherLabelFieldId && onOtherLabelChange ? (
                    <Input
                      type="text"
                      value={otherLabelValue}
                      onChange={(e) => onOtherLabelChange(e.target.value)}
                      placeholder="Specify investment type"
                      className="h-8 w-40 text-xs"
                    />
                  ) : (
                    "Other"
                  )}
                </TableCell>
                <TableCell>
                  <RadioGroup
                    value={values[otherKnowledgeField.id] || ""}
                    onValueChange={(val) => onChange(otherKnowledgeField.id, val)}
                  >
                    <div className="flex flex-wrap gap-4">
                      {(otherKnowledgeField.options || []).map((option) => (
                        <div key={option} className="flex items-center gap-2">
                          <RadioGroupItem value={option} id={`${id}-${otherKnowledgeField.id}-${option}`} />
                          <label
                            htmlFor={`${id}-${otherKnowledgeField.id}-${option}`}
                            className="text-xs cursor-pointer"
                          >
                            {option}
                          </label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-600">Since Year:</label>
                    <Input
                      id={`${id}.${otherSinceField.id}`}
                      type="text"
                      value={values[otherSinceField.id] || ""}
                      onChange={(e) => onChange(otherSinceField.id, e.target.value)}
                      placeholder="Year"
                      className="h-8 w-20 text-xs"
                    />
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

