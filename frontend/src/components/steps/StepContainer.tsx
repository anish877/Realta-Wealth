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
      <style>{`
.step-card {
  background: linear-gradient(180deg, #ffffff 0%, #f8faff 100%);
  border: 1px solid rgba(11,92,255,0.12);
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(11,92,255,0.06);
  overflow: hidden;
}

.step-card-title-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(11,92,255,0.08);
}

.step-card-title {
  font-size: 28px;
  font-weight: 300;
  letter-spacing: -0.02em;
  color: #0f172a;
  margin: 0;
  line-height: 1.3;
}

.step-card-content {
  padding: 0;
}

@media (max-width: 768px) {
  .step-card {
    padding: 24px;
    border-radius: 20px;
  }
  .step-card-title {
    font-size: 24px;
  }
}
      `}</style>
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

