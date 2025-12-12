import { CurrencyField } from "./CurrencyField";
import { SelectField } from "./SelectField";
import { Label } from "../ui/label";

interface FinancialInformationSectionProps {
  annualIncomeFrom: string;
  annualIncomeTo: string;
  onAnnualIncomeFromChange: (value: string) => void;
  onAnnualIncomeToChange: (value: string) => void;
  netWorthFrom: string;
  netWorthTo: string;
  onNetWorthFromChange: (value: string) => void;
  onNetWorthToChange: (value: string) => void;
  liquidNetWorthFrom: string;
  liquidNetWorthTo: string;
  onLiquidNetWorthFromChange: (value: string) => void;
  onLiquidNetWorthToChange: (value: string) => void;
  taxBracket: string;
  onTaxBracketChange: (value: string) => void;
}

export function FinancialInformationSection({
  annualIncomeFrom,
  annualIncomeTo,
  onAnnualIncomeFromChange,
  onAnnualIncomeToChange,
  netWorthFrom,
  netWorthTo,
  onNetWorthFromChange,
  onNetWorthToChange,
  liquidNetWorthFrom,
  liquidNetWorthTo,
  onLiquidNetWorthFromChange,
  onLiquidNetWorthToChange,
  taxBracket,
  onTaxBracketChange,
}: FinancialInformationSectionProps) {
  const taxBracketOptions = ["0 - 15%", "15.1% - 32%", "32.1% - 50%", "50.1% +"];

  return (
    <div className="space-y-6">
      <Label className="text-base font-semibold text-slate-900">Financial Information</Label>
      
      {/* Annual Income */}
      <div className="grid grid-cols-2 gap-4">
        <CurrencyField
          id="annual_income_from"
          label="Annual Income - From $"
          value={annualIncomeFrom}
          onChange={onAnnualIncomeFromChange}
        />
        <CurrencyField
          id="annual_income_to"
          label="Annual Income - To $"
          value={annualIncomeTo}
          onChange={onAnnualIncomeToChange}
        />
      </div>

      {/* Net Worth */}
      <div className="grid grid-cols-2 gap-4">
        <CurrencyField
          id="net_worth_from"
          label="Net Worth (excluding primary residence) - From $"
          value={netWorthFrom}
          onChange={onNetWorthFromChange}
        />
        <CurrencyField
          id="net_worth_to"
          label="Net Worth (excluding primary residence) - To $"
          value={netWorthTo}
          onChange={onNetWorthToChange}
        />
      </div>

      {/* Liquid Net Worth */}
      <div className="grid grid-cols-2 gap-4">
        <CurrencyField
          id="liquid_net_worth_from"
          label="Liquid Net Worth - From $"
          value={liquidNetWorthFrom}
          onChange={onLiquidNetWorthFromChange}
        />
        <CurrencyField
          id="liquid_net_worth_to"
          label="Liquid Net Worth - To $"
          value={liquidNetWorthTo}
          onChange={onLiquidNetWorthToChange}
        />
      </div>

      {/* Tax Bracket */}
      <SelectField
        id="tax_bracket"
        label="Tax Bracket"
        value={taxBracket}
        onChange={onTaxBracketChange}
        options={taxBracketOptions}
      />
    </div>
  );
}

