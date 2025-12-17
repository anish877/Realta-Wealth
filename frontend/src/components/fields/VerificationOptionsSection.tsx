interface VerificationOption {
  option_name: string;
  description?: string;
  requirements?: string[];
  advisor_obligations?: string[];
  submission_rules?: string[];
  recordkeeping_note?: string;
}

interface VerificationOptionsContent {
  intro: string;
  options: VerificationOption[];
}

interface VerificationOptionsSectionProps {
  content: VerificationOptionsContent;
}

export function VerificationOptionsSection({ content }: VerificationOptionsSectionProps) {
  return (
    <div className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-lg space-y-4">
      <p className="text-sm text-slate-700 leading-relaxed">{content.intro}</p>
      {content.options.map((opt, idx) => (
        <div key={idx} className="space-y-2">
          <p className="text-sm font-semibold text-slate-800">{opt.option_name}</p>
          {opt.description && <p className="text-sm text-slate-700 leading-relaxed">{opt.description}</p>}
          {opt.requirements && opt.requirements.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Requirements</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                {opt.requirements.map((r, rIdx) => (
                  <li key={rIdx}>{r}</li>
                ))}
              </ul>
            </div>
          )}
          {opt.advisor_obligations && opt.advisor_obligations.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Advisor Obligations</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                {opt.advisor_obligations.map((r, rIdx) => (
                  <li key={rIdx}>{r}</li>
                ))}
              </ul>
            </div>
          )}
          {opt.submission_rules && opt.submission_rules.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Submission Rules</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                {opt.submission_rules.map((r, rIdx) => (
                  <li key={rIdx}>{r}</li>
                ))}
              </ul>
            </div>
          )}
          {opt.recordkeeping_note && (
            <p className="text-sm text-slate-700 leading-relaxed">{opt.recordkeeping_note}</p>
          )}
        </div>
      ))}
    </div>
  );
}

