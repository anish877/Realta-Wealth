interface AcknowledgementsSectionProps {
  bullets: string[];
}

export function AcknowledgementsSection({ bullets }: AcknowledgementsSectionProps) {
  return (
    <div className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-lg">
      <ul className="space-y-3">
        {bullets.map((bullet, index) => (
          <li key={index} className="text-sm text-slate-700 leading-relaxed flex items-start">
            <span className="text-slate-600 mr-2 font-semibold">•</span>
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

