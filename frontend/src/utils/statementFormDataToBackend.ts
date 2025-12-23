import type { FieldValue } from "../types/statementForm";

/**
 * Transform flat Statement form data (JSON field IDs) into backend payloads
 * for each step/page.
 */

type FormData = Record<string, FieldValue>;

// Helper to parse currency-like strings into numbers
function parseCurrency(value: FieldValue): number {
  if (value === null || value === undefined || value === "") return 0;
  const str = String(value);
  const cleaned = str.replace(/[$,\s]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

type StatementFinancialRowPayload = {
  category: "liquid_non_qualified" | "liabilities" | "net_worth" | "illiquid_non_qualified" | "liquid_qualified" | "income_summary" | "illiquid_qualified";
  rowKey: string;
  label?: string;
  value: number;
  isTotal?: boolean;
};

/**
 * Build financial row payloads from the schema IDs + row IDs.
 */
function buildFinancialRows(formData: FormData): StatementFinancialRowPayload[] {
  const rows: StatementFinancialRowPayload[] = [];

  const addRow = (
    category: StatementFinancialRowPayload["category"],
    tableId: string,
    rowId: string,
    opts: { label?: string; isTotal?: boolean; useCustomLabel?: boolean } = {}
  ) => {
    const fieldId = `${tableId}_${rowId}`;
    const raw = formData[fieldId];
    const value = parseCurrency(raw);
    if (value === 0 && !opts.isTotal) {
      // Skip zero non-total rows to avoid clutter
      return;
    }
    
    // If useCustomLabel is true, read the custom label from formData
    // Custom labels are stored as ${fieldId}_label
    let label = opts.label;
    if (opts.useCustomLabel) {
      const customLabelFieldId = `${fieldId}_label`;
      const customLabel = (formData[customLabelFieldId] as string) || "";
      if (customLabel.trim() !== "") {
        label = customLabel.trim();
      }
    }
    
    rows.push({
      category,
      rowKey: rowId,
      label: label,
      value,
      isTotal: opts.isTotal,
    });
  };

  // Liquid Non-Qualified Assets
  [
    "cash_money_markets",
    "brokerage_non_managed",
    "managed_accounts",
    "mutual_funds_direct",
    "annuities_less_surrender",
    "cash_value_life_insurance",
    "other_business_assets",
    "total_liquid_assets",
  ].forEach((rowId) => {
    addRow("liquid_non_qualified", "liquid_non_qualified_assets", rowId, {
      isTotal: rowId === "total_liquid_assets",
    });
  });

  // Liabilities
  [
    "mortgage_primary_residence",
    "mortgages_secondary_investment",
    "home_equity_loans",
    "credit_cards",
    "other_liabilities",
    "total_liabilities",
  ].forEach((rowId) => {
    addRow("liabilities", "liabilities", rowId, {
      isTotal: rowId === "total_liabilities",
    });
  });

  // Net Worth
  [
    "total_assets_less_primary_residence",
    "total_liabilities_net_worth",
    "total_net_worth_assets_less_pr",
    "total_illiquid_securities",
    "total_net_worth",
    "total_potential_liquidity",
  ].forEach((rowId) => {
    addRow("net_worth", "net_worth", rowId);
  });

  // Illiquid Non-Qualified Assets
  [
    "primary_residence",
    "investment_real_estate",
    "private_business",
    "total_illiquid_assets_equity",
  ].forEach((rowId) => {
    addRow("illiquid_non_qualified", "illiquid_non_qualified_assets", rowId, {
      isTotal: rowId === "total_illiquid_assets_equity",
    });
  });

  // Liquid Qualified Assets
  [
    "qualified_cash_money_markets",
    "retirement_plans",
    "qualified_brokerage_non_managed",
    "qualified_managed_accounts",
    "qualified_mutual_funds_direct",
    "qualified_annuities",
    "total_liquid_qualified_assets",
  ].forEach((rowId) => {
    addRow("liquid_qualified", "liquid_qualified_assets", rowId, {
      isTotal: rowId === "total_liquid_qualified_assets",
    });
  });

  // Income Summary
  [
    "salary_commissions",
    "investment_income",
    "pension",
    "social_security",
    "net_rental_income",
    "other_income",
    "total_annual_income",
  ].forEach((rowId) => {
    addRow("income_summary", "income_summary", rowId, {
      isTotal: rowId === "total_annual_income",
    });
  });

  // Illiquid Qualified Assets (custom labels allowed)
  const tableId = "illiquid_qualified_assets";
  [
    "illiquid_qualified_1",
    "illiquid_qualified_2",
    "illiquid_qualified_3",
    "illiquid_qualified_4",
    "total_illiquid_qualified_assets",
  ].forEach((rowId) => {
    addRow("illiquid_qualified", tableId, rowId, {
      isTotal: rowId === "total_illiquid_qualified_assets",
      useCustomLabel: rowId !== "total_illiquid_qualified_assets", // Allow custom labels for data rows, not total
    });
  });

  // Handle dynamically added rows for illiquid_qualified_assets
  const dynamicRowsKey = `${tableId}_rows`;
  const dynamicRows = (formData[dynamicRowsKey] as Array<{ id: string; label?: string; value?: string }>) || [];
  dynamicRows.forEach((dynamicRow) => {
    const fieldId = `${tableId}_${dynamicRow.id}`;
    const raw = formData[fieldId];
    const value = parseCurrency(raw);
    
    // Only save if value is not zero
    if (value !== 0) {
      rows.push({
        category: "illiquid_qualified",
        rowKey: dynamicRow.id, // Use the dynamic row's id as rowKey
        label: dynamicRow.label || "",
        value,
        isTotal: false,
      });
    }
  });

  return rows;
}

// Step 1 payload
export function buildStatementStep1Payload(formData: FormData) {
  return {
    rrName: (formData["rr_name"] as string) || "",
    rrNo: (formData["rr_no"] as string) || "",
    customerNames: (formData["customer_names"] as string) || "",
    notesPage1: (formData["notes_page1"] as string) || "",
    financialRows: buildFinancialRows(formData),
  };
}

// Step 2 payload
export function buildStatementStep2Payload(formData: FormData) {
  const signatures: any[] = [];

  const pushSig = (
    type: "account_owner" | "joint_account_owner" | "financial_professional" | "registered_principal",
    sigId: string,
    nameId: string,
    dateId: string
  ) => {
    const signatureData = (formData[sigId] as string) || "";
    const printedName = (formData[nameId] as string) || "";
    const date = (formData[dateId] as string) || "";
    if (!signatureData || !printedName || !date) return;

    signatures.push({
      signatureType: type,
      signatureData,
      printedName,
      signatureDate: new Date(date).toISOString(),
    });
  };

  pushSig(
    "account_owner",
    "account_owner_signature",
    "account_owner_printed_name",
    "account_owner_date"
  );
  pushSig(
    "joint_account_owner",
    "joint_account_owner_signature",
    "joint_account_owner_printed_name",
    "joint_account_owner_date"
  );
  pushSig(
    "financial_professional",
    "financial_professional_signature",
    "financial_professional_printed_name",
    "financial_professional_date"
  );
  pushSig(
    "registered_principal",
    "registered_principal_signature",
    "registered_principal_printed_name",
    "registered_principal_date"
  );

  return {
    additionalNotes: (formData["additional_notes"] as string) || "",
    signatures,
  };
}


