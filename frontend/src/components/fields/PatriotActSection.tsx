import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

interface PatriotActSectionProps {
  initialSourceOfFundsValue: string[];
  onInitialSourceOfFundsChange: (value: string[]) => void;
  otherSourceOfFundsText: string;
  onOtherSourceOfFundsTextChange: (value: string) => void;
}

export function PatriotActSection({
  initialSourceOfFundsValue,
  onInitialSourceOfFundsChange,
  otherSourceOfFundsText,
  onOtherSourceOfFundsTextChange,
}: PatriotActSectionProps) {
  const sourceOfFundsOptions = [
    "Accounts Receivable",
    "Income From Earnings",
    "Legal Settlement",
    "Spouse/Parent",
    "Accumulated Savings",
    "Inheritance",
    "Lottery/Gaming",
    "Rental Income",
    "Alimony",
    "Insurance Proceeds",
    "Pension/IRA/Retirement Savings",
    "Sale of Business",
    "Gift",
    "Investment Proceeds",
    "Sale of Real Estate",
    "Other",
  ];

  const handleToggle = (option: string, checked: boolean) => {
    if (checked) {
      onInitialSourceOfFundsChange([...initialSourceOfFundsValue, option]);
    } else {
      onInitialSourceOfFundsChange(initialSourceOfFundsValue.filter((v) => v !== option));
    }
  };

  const hasOther = initialSourceOfFundsValue.includes("Other");

  // Split options into 3 columns
  const column1 = sourceOfFundsOptions.slice(0, 6);
  const column2 = sourceOfFundsOptions.slice(6, 11);
  const column3 = sourceOfFundsOptions.slice(11);

  return (
    <div>
      {/* Gray Header Bar */}
      <div className="bg-slate-200 px-6 py-3 rounded-t-xl">
        <h3 className="text-base font-semibold text-slate-900">STEP 2. USA PATRIOT ACT INFORMATION</h3>
      </div>

      {/* Instruction Text */}
      <div className="bg-white px-6 py-4 border-x border-slate-200">
        <p className="text-sm text-slate-700">
          What is the initial source of funds for this account? If you are transferring assets from another financial institution, please indicate the origin of those investments.
        </p>
      </div>

      {/* Three Column Checkbox Grid */}
      <div className="bg-white px-6 py-4 border-x border-b border-slate-200 rounded-b-xl mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1 */}
          <div className="space-y-3">
            {column1.map((option, index) => {
              const isChecked = initialSourceOfFundsValue.includes(option);
              const optionId = `source-col1-${index}-${option.replace(/\s+/g, "-").toLowerCase()}`;
              return (
                <div key={option} className="flex items-center gap-2">
                  <Checkbox
                    id={optionId}
                    checked={isChecked}
                    onCheckedChange={(checked) => handleToggle(option, checked === true)}
                  />
                  <label
                    htmlFor={optionId}
                    className="text-sm text-slate-700 cursor-pointer"
                  >
                    {option}
                  </label>
                </div>
              );
            })}
          </div>

          {/* Column 2 */}
          <div className="space-y-3">
            {column2.map((option, index) => {
              const isChecked = initialSourceOfFundsValue.includes(option);
              const optionId = `source-col2-${index}-${option.replace(/\s+/g, "-").toLowerCase()}`;
              return (
                <div key={option} className="flex items-center gap-2">
                  <Checkbox
                    id={optionId}
                    checked={isChecked}
                    onCheckedChange={(checked) => handleToggle(option, checked === true)}
                  />
                  <label
                    htmlFor={optionId}
                    className="text-sm text-slate-700 cursor-pointer"
                  >
                    {option}
                  </label>
                </div>
              );
            })}
          </div>

          {/* Column 3 */}
          <div className="space-y-3">
            {column3.map((option, index) => {
              const isChecked = initialSourceOfFundsValue.includes(option);
              const optionId = `source-col3-${index}-${option.replace(/\s+/g, "-").toLowerCase()}`;
              return (
                <div key={option} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={optionId}
                      checked={isChecked}
                      onCheckedChange={(checked) => handleToggle(option, checked === true)}
                    />
                    <label
                      htmlFor={optionId}
                      className="text-sm text-slate-700 cursor-pointer"
                    >
                      {option}
                    </label>
                  </div>
                  {option === "Other" && hasOther && (
                    <div className="ml-6 mt-1">
                      <Input
                        type="text"
                        value={otherSourceOfFundsText}
                        onChange={(e) => onOtherSourceOfFundsTextChange(e.target.value)}
                        placeholder="Specify..."
                        className="h-8 text-sm"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

