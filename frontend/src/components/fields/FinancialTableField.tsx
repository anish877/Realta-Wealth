import { useEffect, useMemo } from "react";
import type { FinancialTableRow, FieldValue } from "../../types/statementForm";
import { normalizeCurrency, validateCurrency, calculateTotal, validateTotalMatches } from "../../utils/statementValidation";

interface FinancialTableFieldProps {
  id: string;
  label: string;
  columns: string[];
  rows: FinancialTableRow[];
  formData: Record<string, FieldValue>;
  updateField: (fieldId: string, value: FieldValue) => void;
  allowAddRows?: boolean;
  disabled?: boolean;
  errors?: Record<string, string>;
  onBlur?: (fieldId: string) => void;
}

export function FinancialTableField({
  id,
  label,
  columns,
  rows,
  formData,
  updateField,
  allowAddRows = false,
  disabled = false,
  errors = {},
  onBlur,
}: FinancialTableFieldProps) {
  const getFieldId = (rowId: string) => {
    return `${id}_${rowId}`;
  };

  // Find total row
  const totalRow = rows.find((row) => row.is_total);
  const dataRows = rows.filter((row) => !row.is_total);

  // Calculate total when data changes
  // Create a dependency string from all data row values
  const dataFieldValuesKey = useMemo(() => {
    return dataRows.map((row) => {
      const fieldId = getFieldId(row.id);
      const value = formData[fieldId];
      return `${fieldId}:${String(value || "")}`;
    }).join("|");
  }, [dataRows, formData, id]);

  useEffect(() => {
    if (totalRow) {
      const fieldIds = dataRows.map((row) => getFieldId(row.id));
      const calculated = calculateTotal(fieldIds, formData as Record<string, string | number | null | undefined>, getFieldId(totalRow.id));
      const totalFieldId = getFieldId(totalRow.id);
      const currentTotal = formData[totalFieldId];
      
      // Always update the total to show calculated value
      // Use a small tolerance (0.01) to avoid unnecessary updates when values match
      const tolerance = 0.01;
      
      if (!currentTotal || currentTotal === "" || currentTotal === null || currentTotal === undefined) {
        // Empty - always update
        updateField(totalFieldId, calculated.toFixed(2));
      } else {
        // Normalize current total for comparison
        const currentTotalNum = parseFloat(normalizeCurrency(String(currentTotal)));
        if (isNaN(currentTotalNum)) {
          // Invalid number - update with calculated
          updateField(totalFieldId, calculated.toFixed(2));
        } else {
          const difference = Math.abs(currentTotalNum - calculated);
          
          // Always update if there's any difference (within floating point precision)
          // This ensures totals are always up-to-date when data rows change
          if (difference >= tolerance) {
            updateField(totalFieldId, calculated.toFixed(2));
          }
        }
      }
    }
  }, [dataFieldValuesKey, totalRow?.id, updateField]);

  const handleCurrencyChange = (fieldId: string, value: string) => {
    // Normalize input
    const normalized = normalizeCurrency(value);
    updateField(fieldId, normalized);
  };

  const handleCurrencyBlur = (fieldId: string) => {
    const value = formData[fieldId];
    const validation = validateCurrency(String(value || ""), { min: 0, max: 999999999999.99 });
    
    if (!validation.isValid && validation.error) {
      // Error will be shown via errors prop
    }
    
    // Validate total if this is a data row and total row exists
    if (totalRow && !fieldId.includes(totalRow.id)) {
      const fieldIds = dataRows.map((row) => getFieldId(row.id));
      const calculated = calculateTotal(fieldIds, formData as Record<string, string | number | null | undefined>, getFieldId(totalRow.id));
      const enteredTotal = formData[getFieldId(totalRow.id)];
      const totalValidation = validateTotalMatches(calculated, String(enteredTotal || ""), 0.01);
      
      if (!totalValidation.isValid) {
        // Error will be shown via errors prop
      }
    }
    
    onBlur?.(fieldId);
  };

  const handleAddRow = () => {
    if (!allowAddRows) return;
    const newRowId = `${id}_row_${Date.now()}`;
    const currentRows = (formData[`${id}_rows`] as Array<{ id: string; label?: string; value?: string }>) || [];
    updateField(`${id}_rows`, [...currentRows, { id: newRowId, label: "", value: "" }]);
  };

  const handleRemoveRow = (rowId: string) => {
    if (!allowAddRows) return;
    const currentRows = (formData[`${id}_rows`] as Array<{ id: string; label?: string; value?: string }>) || [];
    updateField(`${id}_rows`, currentRows.filter((row) => row.id !== rowId));
  };

  const handleRowLabelChange = (rowId: string, label: string) => {
    const currentRows = (formData[`${id}_rows`] as Array<{ id: string; label?: string; value?: string }>) || [];
    const updatedRows = currentRows.map((row) =>
      row.id === rowId ? { ...row, label } : row
    );
    updateField(`${id}_rows`, updatedRows);
  };

  const dynamicRows = (formData[`${id}_rows`] as Array<{ id: string; label?: string; value?: string }>) || [];

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">{label}</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-slate-300">
          <thead>
            <tr className="bg-slate-100">
              {columns.map((column, idx) => (
                <th
                  key={idx}
                  className="border border-slate-300 px-4 py-3 text-left text-sm font-semibold text-slate-900"
                >
                  {column}
                </th>
              ))}
              {allowAddRows && <th className="border border-slate-300 px-4 py-3 text-left text-sm font-semibold text-slate-900 w-24">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const fieldId = getFieldId(row.id);
              const value = (formData[fieldId] as string) || "";
              const isTotal = row.is_total || false;

              return (
                <tr key={row.id} className={isTotal ? "bg-slate-50 font-semibold" : ""}>
                  <td className="border border-slate-300 px-4 py-3 text-sm text-slate-700">
                    {row.allow_custom_label ? (
                      <input
                        type="text"
                        value={(formData[`${fieldId}_label`] as string) || row.label || ""}
                        onChange={(e) => updateField(`${fieldId}_label`, e.target.value)}
                        disabled={disabled}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                        placeholder="Enter label"
                      />
                    ) : (
                      <span className="text-sm">{row.label}</span>
                    )}
                  </td>
                  <td className="border border-slate-300 px-4 py-3">
                    {row.field_type === "currency" ? (
                      <div className="w-full">
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => {
                              // Allow manual override for total row
                              handleCurrencyChange(fieldId, e.target.value);
                            }}
                            onBlur={() => handleCurrencyBlur(fieldId)}
                            disabled={disabled}
                            readOnly={isTotal && !disabled}
                            className={`w-full pl-6 pr-2 py-1 border rounded text-sm ${
                              errors[fieldId] ? "border-red-500" : "border-slate-300"
                            } ${isTotal ? "bg-slate-50 font-semibold" : ""} ${disabled ? "bg-slate-100" : ""}`}
                            placeholder="0.00"
                          />
                        </div>
                        {errors[fieldId] && (
                          <p className="mt-1 text-xs text-red-600">{errors[fieldId]}</p>
                        )}
                      </div>
                    ) : (
                      <div className="w-full">
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => updateField(fieldId, e.target.value)}
                          onBlur={() => onBlur?.(fieldId)}
                          disabled={disabled}
                          readOnly={isTotal && !disabled}
                          className={`w-full px-2 py-1 border rounded text-sm ${
                            errors[fieldId] ? "border-red-500" : "border-slate-300"
                          } ${isTotal ? "bg-slate-50 font-semibold" : ""} ${disabled ? "bg-slate-100" : ""}`}
                        />
                        {errors[fieldId] && (
                          <p className="mt-1 text-xs text-red-600">{errors[fieldId]}</p>
                        )}
                      </div>
                    )}
                  </td>
                  {allowAddRows && !isTotal && (
                    <td className="border border-slate-300 px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(row.id)}
                        disabled={disabled}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </td>
                  )}
                  {allowAddRows && isTotal && <td className="border border-slate-300 px-4 py-3"></td>}
                </tr>
              );
            })}
            {allowAddRows &&
              dynamicRows.map((dynamicRow) => {
                const fieldId = getFieldId(dynamicRow.id);
                const value = (formData[fieldId] as string) || "";

                return (
                  <tr key={dynamicRow.id}>
                    <td className="border border-slate-300 px-4 py-3">
                      <input
                        type="text"
                        value={dynamicRow.label || ""}
                        onChange={(e) => handleRowLabelChange(dynamicRow.id, e.target.value)}
                        disabled={disabled}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                        placeholder="Enter label"
                      />
                    </td>
                    <td className="border border-slate-300 px-4 py-3">
                      <div className="w-full">
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => handleCurrencyChange(fieldId, e.target.value)}
                            onBlur={() => handleCurrencyBlur(fieldId)}
                            disabled={disabled}
                            className={`w-full pl-6 pr-2 py-1 border rounded text-sm ${
                              errors[fieldId] ? "border-red-500" : "border-slate-300"
                            }`}
                            placeholder="0.00"
                          />
                        </div>
                        {errors[fieldId] && (
                          <p className="mt-1 text-xs text-red-600">{errors[fieldId]}</p>
                        )}
                      </div>
                    </td>
                    <td className="border border-slate-300 px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(dynamicRow.id)}
                        disabled={disabled}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      {allowAddRows && (
        <button
          type="button"
          onClick={handleAddRow}
          disabled={disabled}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
        >
          Add Row
        </button>
      )}
    </div>
  );
}

