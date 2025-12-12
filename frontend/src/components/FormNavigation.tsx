interface FormNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export function FormNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSubmit,
  isSubmitting = false,
}: FormNavigationProps) {
  return (
    <div className="form-navigation">
      <style>{`
.form-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid rgba(11,92,255,0.08);
}

.form-nav-button {
  height: 42px;
  padding: 0 20px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.01em;
  cursor: pointer;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  min-width: 120px;
}

.form-nav-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.form-nav-button-outline {
  background: transparent;
  color: #0f172a;
  border: 1px solid rgba(11,92,255,0.2);
}

.form-nav-button-outline:hover:not(:disabled) {
  background: rgba(11,92,255,0.06);
  border-color: rgba(11,92,255,0.3);
}

.form-nav-button-primary {
  background: #0b5cff;
  color: white;
  box-shadow: 0 4px 12px rgba(11,92,255,0.24);
}

.form-nav-button-primary:hover:not(:disabled) {
  background: #0a4fd8;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(11,92,255,0.3);
}

.form-nav-button-submit {
  background: #22c55e;
  color: white;
  box-shadow: 0 4px 12px rgba(34,197,94,0.24);
}

.form-nav-button-submit:hover:not(:disabled) {
  background: #16a34a;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(34,197,94,0.3);
}

.form-nav-icon {
  width: 16px;
  height: 16px;
}

@media (max-width: 768px) {
  .form-navigation {
    flex-direction: column;
    gap: 12px;
  }
  .form-nav-button {
    width: 100%;
  }
}
      `}</style>
      <button
        type="button"
        onClick={onPrevious}
        disabled={currentStep === 0}
        className="form-nav-button form-nav-button-outline"
      >
        <svg
          className="form-nav-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Previous
      </button>

      {currentStep < totalSteps - 1 ? (
        <button
          type="button"
          onClick={onNext}
          className="form-nav-button form-nav-button-primary"
        >
          Next
          <svg
            className="form-nav-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      ) : (
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="form-nav-button form-nav-button-submit"
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin form-nav-icon"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Submitting...
            </>
          ) : (
            "Submit"
          )}
        </button>
      )}
    </div>
  );
}

