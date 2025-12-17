import { useState } from "react";
import { TextField } from "./TextField";
import { CurrencyField } from "./CurrencyField";
import { normalizeCurrency } from "../../utils/statementValidation";
import type { FieldValue } from "../../types/statementForm";

interface RepeatableRow {
  id: string;
  item_name: string;
  purchase_amount_value: string;
}

interface RepeatableRowsFieldProps {
  id: string;
  label: string;
  formData: Record<string, FieldValue>;
  updateField: (fieldId: string, value: FieldValue) => void;
  minRows?: number;
  maxRows?: number;
  defaultRows?: number;
  disabled?: boolean;
  errors?: Record<string, string>;
  onBlur?: (fieldId: string) => void;
}

export function RepeatableRowsField({
  id,
  label,
  formData,
  updateField,
  minRows = 0,
  maxRows = 50,
  defaultRows = 4,
  disabled = false,
  errors = {},
  onBlur,
}: RepeatableRowsFieldProps) {
  const rowsKey = `${id}_rows`;
  const totalKey = `${id}_total`;
  
  // Get rows from formData or initialize with default rows
  const getRows = (): RepeatableRow[] => {
    const storedRows = formData[rowsKey] as RepeatableRow[] | undefined;
    if (storedRows && Array.isArray(storedRows) && storedRows.length > 0) {
      return storedRows;
    }
    // Initialize with empty rows
    return Array.from({ length: defaultRows }, (_, i) => ({
      id: `${id}_row_${i}`,
      item_name: "",
      purchase_amount_value: "",
    }));
  };

  const [rows, setRows] = useState<RepeatableRow[]>(getRows());

  // Update formData when rows change
  const updateRows = (newRows: RepeatableRow[]) => {
    setRows(newRows);
    updateField(rowsKey, newRows);
    
    // Calculate total
    let total = 0;
    for (const row of newRows) {
      if (row.purchase_amount_value) {
        const normalized = normalizeCurrency(row.purchase_amount_value);
        if (normalized !== "") {
          const num = parseFloat(normalized);
          if (!isNaN(num)) {
            total += num;
          }
        }
      }
    }
    updateField(totalKey, total.toFixed(2));
  };

  const handleAddRow = () => {
    if (rows.length < maxRows) {
      const newRow: RepeatableRow = {
        id: `${id}_row_${Date.now()}`,
        item_name: "",
        purchase_amount_value: "",
      };
      updateRows([...rows, newRow]);
    }
  };

  const handleRemoveRow = (rowId: string) => {
    if (rows.length > minRows) {
      updateRows(rows.filter((row) => row.id !== rowId));
    }
  };

  const handleRowChange = (rowId: string, field: "item_name" | "purchase_amount_value", value: string) => {
    const updatedRows = rows.map((row) =>
      row.id === rowId ? { ...row, [field]: value } : row
    );
    updateRows(updatedRows);
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">{label}</h3>
        {rows.length < maxRows && (
          <button
            type="button"
            onClick={handleAddRow}
            disabled={disabled}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
          >
            Add Row
          </button>
        )}
      </div>

      <div className="space-y-4">
        {rows.map((row, index) => (
          <div
            key={row.id}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-slate-200 rounded-lg bg-white"
          >
            <div>
              <TextField
                id={`${row.id}_item_name`}
                label={`Item Name ${index + 1}`}
                value={row.item_name}
                onChange={(val) => handleRowChange(row.id, "item_name", val)}
                onBlur={() => onBlur?.(`${row.id}_item_name`)}
                disabled={disabled}
                error={errors[`${row.id}_item_name`]}
              />
            </div>
            <div>
              <CurrencyField
                id={`${row.id}_purchase_amount_value`}
                label="Purchase Amount / Value"
                value={row.purchase_amount_value}
                onChange={(val) => handleRowChange(row.id, "purchase_amount_value", val)}
                onBlur={() => onBlur?.(`${row.id}_purchase_amount_value`)}
                disabled={disabled}
                error={errors[`${row.id}_purchase_amount_value`]}
              />
            </div>
            {rows.length > minRows && (
              <div className="md:col-span-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleRemoveRow(row.id)}
                  disabled={disabled}
                  className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                >
                  Remove Row
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Total row */}
      <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-900">TOTAL ILLIQUID QUALIFIED ASSETS</span>
          <CurrencyField
            id={totalKey}
            label=""
            value={String(formData[totalKey] || "")}
            onChange={(val) => updateField(totalKey, val)}
            onBlur={() => onBlur?.(totalKey)}
            disabled={disabled}
            error={errors[totalKey]}
          />
        </div>
      </div>
    </div>
  );
}

