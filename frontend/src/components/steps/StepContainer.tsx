import { ReactNode } from "react";

interface StepContainerProps {
  title: string;
  children: ReactNode;
  hideTitle?: boolean;
  isDisabled?: boolean;
}

export function StepContainer({ title, children, hideTitle = false, isDisabled = false }: StepContainerProps) {
  // Don't apply opacity to the entire container - let individual fields handle their own disabled styling
  return (
    <div className="step-card">
      <div className={hideTitle ? "step-card-content" : ""}>
        {!hideTitle && (
          <div className="step-card-title-section">
            <h2 className="step-card-title">{title}</h2>
          </div>
        )}
        <form onSubmit={(e) => e.preventDefault()}>{children}</form>
      </div>
    </div>
  );
}

