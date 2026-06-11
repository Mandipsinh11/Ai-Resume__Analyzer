const StrengthsSection = ({ strengths }) => {
  if (!strengths?.length) return null;

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
      <h3 className="text-2xl font-bold text-slate-900 mb-6">Strengths</h3>

      <ul className="space-y-4">
        {strengths.map((item, index) => (
          <li
            key={index}
            className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-100"
          >
            <span className="text-emerald-600 font-bold shrink-0">✓</span>

            <span className="text-sm font-medium text-emerald-800 leading-7">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StrengthsSection;
