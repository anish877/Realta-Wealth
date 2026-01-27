import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { CurrencyField } from "./CurrencyField";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

interface ObjectivesSectionProps {
  riskExposureValue: string[];
  onRiskExposureChange: (value: string[]) => void;
  accountInvestmentObjectivesValue: string[];
  onAccountInvestmentObjectivesChange: (value: string[]) => void;
  seeAttachedStatementChecked: boolean;
  onSeeAttachedStatementChange: (checked: boolean) => void;
  investmentValues: Record<string, string>;
  onInvestmentValueChange: (investmentType: string, value: string) => void;
  timeHorizonFrom: string;
  timeHorizonTo: string;
  onTimeHorizonFromChange: (value: string) => void;
  onTimeHorizonToChange: (value: string) => void;
  liquidityNeedsValue: string[];
  onLiquidityNeedsChange: (value: string[]) => void;
}

export function ObjectivesSection({
  riskExposureValue,
  onRiskExposureChange,
  accountInvestmentObjectivesValue,
  onAccountInvestmentObjectivesChange,
  seeAttachedStatementChecked,
  onSeeAttachedStatementChange,
  investmentValues,
  onInvestmentValueChange,
  timeHorizonFrom,
  timeHorizonTo,
  onTimeHorizonFromChange,
  onTimeHorizonToChange,
  liquidityNeedsValue,
  onLiquidityNeedsChange,
}: ObjectivesSectionProps) {
  const riskExposureOptions = ["Low", "Moderate", "Speculation", "High Risk"];
  const accountObjectivesOptions = ["Income", "Long-Term Growth", "Short-Term Growth"];
  const liquidityNeedsOptions = ["High", "Medium", "Low"];

  // Investment types in exact order from the form
  const investmentTypes = [
    { label: "Equities", key: "investment_equities_value" },
    { label: "Options", key: "investment_options_value" },
    { label: "Fixed Income", key: "investment_fixed_income_value" },
    { label: "Mutual Funds", key: "investment_mutual_funds_value" },
    { label: "Unit Investment Trusts", key: "investment_unit_investment_trusts_value" },
    { label: "Exchange-Traded Funds", key: "investment_etfs_value" },
    { label: "Real Estate", key: "investment_real_estate_value" },
    { label: "Insurance", key: "investment_insurance_value" },
    { label: "Fixed Annuities", key: "investment_fixed_annuities_value" },
    { label: "Variable Annuities", key: "investment_variable_annuities_value" },
    { label: "Precious Metals", key: "investment_precious_metals_value" },
    { label: "Commodities/Futures", key: "investment_commodities_futures_value" },
    { label: "Other", key: "investment_other_1_value" },
    { label: "Other", key: "investment_other_2_value" },
    { label: "Other", key: "investment_other_3_value" },
  ];

  const handleRiskExposureToggle = (option: string, checked: boolean) => {
    if (checked) {
      onRiskExposureChange([...riskExposureValue, option]);
    } else {
      onRiskExposureChange(riskExposureValue.filter((v) => v !== option));
    }
  };

  const handleAccountObjectivesToggle = (option: string, checked: boolean) => {
    if (checked) {
      onAccountInvestmentObjectivesChange([...accountInvestmentObjectivesValue, option]);
    } else {
      onAccountInvestmentObjectivesChange(accountInvestmentObjectivesValue.filter((v) => v !== option));
    }
  };

  const handleLiquidityNeedsToggle = (option: string, checked: boolean) => {
    if (checked) {
      onLiquidityNeedsChange([...liquidityNeedsValue, option]);
    } else {
      onLiquidityNeedsChange(liquidityNeedsValue.filter((v) => v !== option));
    }
  };

  return (
    <div className="space-y-6">
      {/* Gray Header Bar */}
      <div className="bg-slate-200 px-6 py-3 rounded-t-xl">
        <h3 className="text-base font-semibold text-slate-900">STEP 5 OBJECTIVES AND INVESTMENT DETAIL</h3>
      </div>

      {/* Content */}
      <div className="bg-white px-6 py-4 border-x border-b border-slate-200 rounded-b-xl space-y-6">
        {/* Risk Exposure */}
        <div className="flex items-start gap-6">
          <Label className="text-sm font-medium text-slate-700 w-32 flex-shrink-0">Risk Exposure</Label>
          <div className="flex gap-6">
            {riskExposureOptions.map((option) => (
              <div key={option} className="flex items-center gap-2">
                <Checkbox
                  id={`risk-${option}`}
                  checked={riskExposureValue.includes(option)}
                  onCheckedChange={(checked) => handleRiskExposureToggle(option, checked === true)}
                />
                <label htmlFor={`risk-${option}`} className="text-sm text-slate-700 cursor-pointer">
                  {option}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Account Investment Objectives */}
        <div className="flex items-start gap-6">
          <Label className="text-sm font-medium text-slate-700 w-32 flex-shrink-0">Account Investment Objectives</Label>
          <div className="flex gap-6">
            {accountObjectivesOptions.map((option) => (
              <div key={option} className="flex items-center gap-2">
                <Checkbox
                  id={`objectives-${option}`}
                  checked={accountInvestmentObjectivesValue.includes(option)}
                  onCheckedChange={(checked) => handleAccountObjectivesToggle(option, checked === true)}
                />
                <label htmlFor={`objectives-${option}`} className="text-sm text-slate-700 cursor-pointer">
                  {option}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Other Investments */}
        <div className="flex items-start gap-6">
          <Label className="text-sm font-medium text-slate-700 w-32 flex-shrink-0">Other Investments</Label>
          <div className="flex items-center gap-2">
            <Checkbox
              id="see-attached-statement"
              checked={seeAttachedStatementChecked}
              onCheckedChange={(checked) => onSeeAttachedStatementChange(checked === true)}
            />
            <label htmlFor="see-attached-statement" className="text-sm text-slate-700 cursor-pointer">
              See Attached Statement of Financial Condition (if box is not selected, please complete the below)
            </label>
          </div>
        </div>

        {/* Investment Detail Table */}
        {!seeAttachedStatementChecked && (
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/2">Investment</TableHead>
                  <TableHead className="w-1/2">Investment Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {investmentTypes.map((investment, index) => (
                  <TableRow key={`${investment.key}-${index}`}>
                    <TableCell className="font-medium text-slate-700">
                      {investment.label}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600">Value $</span>
                        <Input
                          type="text"
                          value={investmentValues[investment.key] || ""}
                          onChange={(e) => onInvestmentValueChange(investment.key, e.target.value)}
                          placeholder="0.00"
                          className="h-8 w-32 text-sm"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {/* Empty rows for additional entries */}
                <TableRow>
                  <TableCell className="font-medium text-slate-700"></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-600">Value $</span>
                      <Input
                        type="text"
                        value={investmentValues["investment_other_4_value"] || ""}
                        onChange={(e) => onInvestmentValueChange("investment_other_4_value", e.target.value)}
                        placeholder="0.00"
                        className="h-8 w-32 text-sm"
                      />
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-slate-700"></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-600">Value $</span>
                      <Input
                        type="text"
                        value={investmentValues["investment_other_5_value"] || ""}
                        onChange={(e) => onInvestmentValueChange("investment_other_5_value", e.target.value)}
                        placeholder="0.00"
                        className="h-8 w-32 text-sm"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}

        {/* Investment Time Horizon and Liquidity Needs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
          {/* Time Horizon */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Time Horizon</Label>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={timeHorizonFrom}
                onChange={(e) => onTimeHorizonFromChange(e.target.value)}
                placeholder="---"
                className="h-8 w-20 text-sm"
              />
              <span className="text-sm text-slate-600">-</span>
              <Input
                type="text"
                value={timeHorizonTo}
                onChange={(e) => onTimeHorizonToChange(e.target.value)}
                placeholder="2034"
                className="h-8 w-20 text-sm"
              />
            </div>
          </div>

          {/* Liquidity Needs */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Liquidity Needs</Label>
            <div className="flex gap-6">
              {liquidityNeedsOptions.map((option) => (
                <div key={option} className="flex items-center gap-2">
                  <Checkbox
                    id={`liquidity-${option}`}
                    checked={liquidityNeedsValue.includes(option)}
                    onCheckedChange={(checked) => handleLiquidityNeedsToggle(option, checked === true)}
                  />
                  <label htmlFor={`liquidity-${option}`} className="text-sm text-slate-700 cursor-pointer">
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

