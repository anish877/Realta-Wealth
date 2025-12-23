/**
 * Transform backend Statement data back into frontend formData format
 */

type FormData = Record<string, any>;

/**
 * Map category to tableId (reverse of buildFinancialRows mapping)
 */
function getTableIdFromCategory(category: string): string {
  const categoryToTableId: Record<string, string> = {
    liquid_non_qualified: "liquid_non_qualified_assets",
    liabilities: "liabilities",
    net_worth: "net_worth",
    illiquid_non_qualified: "illiquid_non_qualified_assets",
    liquid_qualified: "liquid_qualified_assets",
    income_summary: "income_summary",
    illiquid_qualified: "illiquid_qualified_assets",
  };
  return categoryToTableId[category] || category;
}

/**
 * Convert backend financialRows back to formData format
 * Backend format: { category, rowKey, label?, value, isTotal? }
 * Frontend format: formData[`${tableId}_${rowKey}`] = value (as string/number)
 */
export function loadFinancialRowsToFormData(
  financialRows: Array<{
    category: string;
    rowKey: string;
    label?: string;
    value: number | string;
    isTotal?: boolean;
  }>
): FormData {
  const formData: FormData = {};

  // For illiquid_qualified category, we need to identify which rows are dynamic
  // Default rowKeys are: illiquid_qualified_1, illiquid_qualified_2, illiquid_qualified_3, illiquid_qualified_4, total_illiquid_qualified_assets
  const defaultIlliquidQualifiedRowKeys = new Set([
    "illiquid_qualified_1",
    "illiquid_qualified_2",
    "illiquid_qualified_3",
    "illiquid_qualified_4",
    "total_illiquid_qualified_assets"
  ]);

  const dynamicRowsForIlliquidQualified: Array<{ id: string; label?: string; value?: string }> = [];

  financialRows.forEach((row) => {
    const tableId = getTableIdFromCategory(row.category);
    const fieldId = `${tableId}_${row.rowKey}`;
    
    // Convert value to number (it might be a Decimal from Prisma)
    const numValue = typeof row.value === 'string' ? parseFloat(row.value) : Number(row.value);
    
    // Store as string representation for currency fields (preserve formatting if needed)
    // The FinancialTableField will handle display formatting
    formData[fieldId] = isNaN(numValue) ? "" : numValue;
    
    // Load custom label if it exists (for rows with allow_custom_label: true)
    // The label field ID format is: ${fieldId}_label
    if (row.label && row.label.trim() !== "") {
      formData[`${fieldId}_label`] = row.label;
    }

    // For illiquid_qualified category, identify dynamic rows
    if (row.category === "illiquid_qualified" && !row.isTotal && !defaultIlliquidQualifiedRowKeys.has(row.rowKey)) {
      // This is a dynamically added row
      dynamicRowsForIlliquidQualified.push({
        id: row.rowKey, // Use the rowKey as the id
        label: row.label || "",
        value: String(numValue)
      });
    }
  });

  // If we found dynamic rows for illiquid_qualified_assets, store them in the rows array
  if (dynamicRowsForIlliquidQualified.length > 0) {
    formData["illiquid_qualified_assets_rows"] = dynamicRowsForIlliquidQualified;
  }

  return formData;
}

/**
 * Convert backend signatures back to formData format
 */
export function loadSignaturesToFormData(
  signatures: Array<{
    signatureType: string;
    signatureData?: string;
    printedName?: string;
    signatureDate?: string;
  }>
): FormData {
  const formData: FormData = {};

  signatures.forEach((sig) => {
    const sigType = sig.signatureType;
    
    if (sig.signatureData) {
      formData[`${sigType}_signature`] = sig.signatureData;
    }
    if (sig.printedName) {
      formData[`${sigType}_printed_name`] = sig.printedName;
    }
    if (sig.signatureDate) {
      // Convert ISO date to YYYY-MM-DD format for date inputs
      // Field IDs match the pattern used in buildStatementStep2Payload: account_owner_date, joint_account_owner_date, etc.
      const date = new Date(sig.signatureDate);
      if (!isNaN(date.getTime())) {
        formData[`${sigType}_date`] = date.toISOString().split('T')[0];
      }
    }
  });

  return formData;
}

