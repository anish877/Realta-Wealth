interface SubMethod {
  label: string;
  text: string;
}

interface PolicyBullet {
  heading: string;
  text: string;
  sub_methods?: SubMethod[];
}

interface PolicyGuidanceSectionProps {
  bullets: PolicyBullet[];
}

export function PolicyGuidanceSection({ bullets }: PolicyGuidanceSectionProps) {
  return (
    <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
      {bullets.map((item, idx) => (
        <div key={idx} className="space-y-2">
          <p className="text-sm font-semibold text-slate-800 whitespace-pre-wrap">{item.heading}</p>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{item.text}</p>
          {item.sub_methods && item.sub_methods.length > 0 && (
            <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
              {item.sub_methods.map((sub, subIdx) => (
                <li key={subIdx}>
                  <span className="font-semibold text-slate-800 whitespace-pre-wrap">{sub.label} </span>
                  <span className="whitespace-pre-wrap">{sub.text}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

