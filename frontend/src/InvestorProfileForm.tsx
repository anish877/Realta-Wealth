import { useState } from "react";
import { FormProvider, useForm } from "./context/FormContext";
import Step1AccountRegistration from "./components/steps/Step1AccountRegistration";
import Step2PatriotAct from "./components/steps/Step2PatriotAct";
import Step3PrimaryAccountHolder from "./components/steps/Step3PrimaryAccountHolder";
import Step3PrimaryContinued from "./components/steps/Step3PrimaryContinued";
import Step4SecondaryAccountHolder from "./components/steps/Step4SecondaryAccountHolder";
import Step4SecondaryContinued from "./components/steps/Step4SecondaryContinued";
import Step5ObjectivesInvestment from "./components/steps/Step5ObjectivesInvestment";
import Step6TrustedContact from "./components/steps/Step6TrustedContact";
import Step7Signatures from "./components/steps/Step7Signatures";
import LegalTerms from "./components/steps/LegalTerms";

const STEPS = [
  { id: 1, component: Step1AccountRegistration, title: "Account Registration" },
  { id: 2, component: Step2PatriotAct, title: "USA Patriot Act" },
  { id: 3, component: Step3PrimaryAccountHolder, title: "Primary Account Holder" },
  { id: 4, component: Step3PrimaryContinued, title: "Primary Account Holder (Continued)" },
  { id: 5, component: Step4SecondaryAccountHolder, title: "Secondary Account Holder" },
  { id: 6, component: Step4SecondaryContinued, title: "Secondary Account Holder (Continued)" },
  { id: 7, component: Step5ObjectivesInvestment, title: "Objectives & Investment" },
  { id: 8, component: Step6TrustedContact, title: "Trusted Contact" },
  { id: 9, component: Step7Signatures, title: "Signatures" },
  { id: 10, component: LegalTerms, title: "Legal Terms" },
];

function FormContent() {
  const [currentStep, setCurrentStep] = useState(0);
  const { formData } = useForm();
  const totalSteps = STEPS.length;
  const CurrentStepComponent = STEPS[currentStep].component;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = () => {
    console.log("Form Data:", formData);
    alert("Form submitted! Check console for data.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-slate-900 mb-2">Investor Profile</h1>
          <p className="text-slate-600">Complete all steps to submit your profile</p>
        </div>

        <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">
              Step {currentStep + 1} of {totalSteps}
            </span>
            <span className="text-sm text-slate-500">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8 md:p-12">
            <CurrentStepComponent />
          </div>

          <div className="px-8 md:px-12 py-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="px-6 py-3 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              Previous
            </button>

            {currentStep < totalSteps - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-3 text-sm font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors shadow-md hover:shadow-lg"
              >
                Submit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InvestorProfileForm() {
  return (
    <FormProvider>
      <FormContent />
    </FormProvider>
  );
}
