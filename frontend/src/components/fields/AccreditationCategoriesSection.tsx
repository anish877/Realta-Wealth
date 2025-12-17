interface AccreditationCategory {
  category: string;
  documentation: string[];
}

interface AccreditationCategoriesSectionProps {
  categories: AccreditationCategory[];
}

export function AccreditationCategoriesSection({ categories }: AccreditationCategoriesSectionProps) {
  return (
    <div className="mb-8 p-6 bg-white border border-slate-200 rounded-lg shadow-sm space-y-4">
      {categories.map((cat, idx) => (
        <div key={idx} className="space-y-2">
          <p className="text-sm font-semibold text-slate-800 whitespace-pre-wrap">{cat.category}</p>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
            {cat.documentation.map((doc, dIdx) => (
              <li key={dIdx} className="whitespace-pre-wrap">{doc}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

