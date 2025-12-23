import React from "react";

interface FormSkeletonProps {
  fieldCount?: number;
  showSectionHeader?: boolean;
}

export function FormSkeleton({ fieldCount = 8, showSectionHeader = true }: FormSkeletonProps) {
  return (
    <div className="form-skeleton">
      <style>{`
        .form-skeleton {
          animation: skeleton-loading 1.5s ease-in-out infinite;
        }

        @keyframes skeleton-loading {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
          100% {
            opacity: 1;
          }
        }

        .skeleton-section-header {
          margin-bottom: 32px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(11,92,255,0.12);
        }

        .skeleton-title {
          height: 32px;
          width: 300px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 8px;
          margin-bottom: 8px;
        }

        .skeleton-subtitle {
          height: 20px;
          width: 200px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
        }

        .skeleton-field-group {
          margin-bottom: 24px;
        }

        .skeleton-field-label {
          height: 16px;
          width: 150px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
          margin-bottom: 8px;
        }

        .skeleton-field-input {
          height: 42px;
          width: 100%;
          background: linear-gradient(90deg, #f8f8f8 25%, #e8e8e8 50%, #f8f8f8 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 8px;
          border: 1px solid rgba(11,92,255,0.1);
        }

        .skeleton-field-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .skeleton-field-full {
          grid-column: 1 / -1;
        }

        .skeleton-signature-section {
          margin-top: 32px;
          padding-top: 32px;
          border-top: 2px solid rgba(11,92,255,0.12);
        }

        .skeleton-signature-group {
          margin-bottom: 32px;
        }

        .skeleton-signature-box {
          height: 120px;
          width: 100%;
          background: linear-gradient(90deg, #f8f8f8 25%, #e8e8e8 50%, #f8f8f8 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 8px;
          border: 2px dashed rgba(11,92,255,0.2);
          margin-bottom: 16px;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>

      {showSectionHeader && (
        <div className="skeleton-section-header">
          <div className="skeleton-title"></div>
          <div className="skeleton-subtitle"></div>
        </div>
      )}

      <div className="skeleton-fields">
        {Array.from({ length: fieldCount }).map((_, index) => (
          <div key={index} className="skeleton-field-group">
            <div className="skeleton-field-label"></div>
            <div className="skeleton-field-input"></div>
          </div>
        ))}
      </div>

      {/* Signature section skeleton */}
      <div className="skeleton-signature-section">
        <div className="skeleton-field-group">
          <div className="skeleton-title" style={{ width: '250px', marginBottom: '24px' }}></div>
        </div>
        <div className="skeleton-signature-group">
          <div className="skeleton-field-label"></div>
          <div className="skeleton-signature-box"></div>
          <div className="skeleton-field-row">
            <div className="skeleton-field-group">
              <div className="skeleton-field-label"></div>
              <div className="skeleton-field-input"></div>
            </div>
            <div className="skeleton-field-group">
              <div className="skeleton-field-label"></div>
              <div className="skeleton-field-input"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

