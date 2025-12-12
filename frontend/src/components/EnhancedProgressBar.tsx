interface EnhancedProgressBarProps {
  currentStep: number;
  totalSteps: number;
  completedSteps: Set<number>;
  stepTitles?: Record<number, string>;
  onStepClick?: (step: number) => void;
}

const DEFAULT_STEP_TITLES: Record<number, string> = {
  1: "Account Registration",
  2: "USA Patriot Act",
  3: "Primary Account Holder",
  4: "Secondary Account Holder",
  5: "Objectives & Investment",
  6: "Trusted Contact",
  7: "Signatures",
};

export function EnhancedProgressBar({
  currentStep,
  totalSteps,
  completedSteps,
  stepTitles = DEFAULT_STEP_TITLES,
  onStepClick,
}: EnhancedProgressBarProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const getStepStatus = (step: number) => {
    const stepIndex = step - 1;
    if (completedSteps.has(step)) return "completed";
    if (stepIndex === currentStep) return "current";
    if (stepIndex < currentStep) return "completed";
    return "upcoming";
  };

  return (
    <div className="mb-8 bg-white rounded-xl shadow-sm p-6">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">
            Step {currentStep + 1} of {totalSteps}
          </span>
          <span className="text-sm text-slate-500">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1;
          const status = getStepStatus(step);
          const isClickable = onStepClick && (status === "completed" || status === "current");

          return (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                {/* Step Circle */}
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick(step)}
                  disabled={!isClickable}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                    ${status === "completed" ? "bg-green-500 text-white" : ""}
                    ${status === "current" ? "bg-blue-600 text-white ring-2 ring-blue-200" : ""}
                    ${status === "upcoming" ? "bg-gray-200 text-gray-600" : ""}
                    ${isClickable ? "cursor-pointer" : "cursor-default"}
                  `}
                  title={stepTitles[step] || `Step ${step}`}
                >
                  {status === "completed" ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    step
                  )}
                </button>
                {/* Step Label */}
                <span
                  className={`
                    mt-2 text-xs font-medium text-center max-w-[80px] truncate hidden md:block
                    ${status === "current" ? "text-blue-600" : ""}
                    ${status === "completed" ? "text-green-600" : ""}
                    ${status === "upcoming" ? "text-gray-400" : ""}
                  `}
                >
                  {stepTitles[step] || `Step ${step}`}
                </span>
              </div>
              {/* Connector Line */}
              {i < totalSteps - 1 && (
                <div
                  className={`
                    flex-1 h-0.5 mx-2
                    ${i < currentStep ? "bg-green-500" : "bg-gray-200"}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

