import React from "react";

export interface ValidationErrorProps {
  error?: string;
  fieldId?: string;
  className?: string;
  role?: string;
}

/**
 * Reusable validation error component
 * Displays error messages with proper styling and accessibility
 */
export function ValidationError({ error, fieldId, className = "", role = "alert" }: ValidationErrorProps) {
  if (!error) {
    return null;
  }

  return (
    <p
      id={fieldId ? `${fieldId}-error` : undefined}
      role={role}
      aria-live="polite"
      className={`text-sm text-red-600 mt-1 ${className}`}
    >
      {error}
    </p>
  );
}

/**
 * Step-level error summary component
 */
export interface StepErrorSummaryProps {
  errors: Record<string, string>;
  className?: string;
}

export function StepErrorSummary({ errors, className = "" }: StepErrorSummaryProps) {
  const errorEntries = Object.entries(errors);

  if (errorEntries.length === 0) {
    return null;
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`rounded-lg border border-red-200 bg-red-50 p-4 mb-4 ${className}`}
    >
      <h3 className="text-sm font-semibold text-red-900 mb-2">
        Please fix the following errors:
      </h3>
      <ul className="list-disc list-inside space-y-1">
        {errorEntries.map(([field, message]) => (
          <li key={field} className="text-sm text-red-700">
            {message}
          </li>
        ))}
      </ul>
    </div>
  );
}

