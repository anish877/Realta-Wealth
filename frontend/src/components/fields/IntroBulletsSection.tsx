interface IntroBulletsSectionProps {
  bullets: string[];
}

export function IntroBulletsSection({ bullets }: IntroBulletsSectionProps) {
  return (
    <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
      <ul className="space-y-3">
        {bullets.map((bullet, index) => (
          <li key={index} className="text-sm text-slate-700 leading-relaxed flex items-start">
            <span className="text-blue-600 mr-2 font-semibold">•</span>
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

