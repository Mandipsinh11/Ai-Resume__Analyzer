import { useEffect, useState } from "react";

const ROWS = [
  { key: "internship", label: "Internship / Experience" },
  { key: "quantifiedImpact", label: "Quantified Impact" },
  { key: "keywords", label: "Keyword Optimization" },
  { key: "technicalTools", label: "Technical Tools" },
  { key: "certifications", label: "Certifications" },
];

const interviewColor = (chance = "") => {
  const num = parseInt(chance);
  if (isNaN(num)) return "text-slate-500";
  if (num < 20) return "text-red-500";
  if (num < 50) return "text-amber-500";
  return "text-emerald-500";
};

const CompetitivenessComparison = ({ deepAnalysis }) => {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  if (!deepAnalysis?.competitiveness) return null;

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mb-6">
      {/* Header */}
      <h3 className="text-2xl font-bold text-slate-900 mb-4">
        Competitiveness vs Top 10% Candidates
      </h3>

      {/* Legend */}
      <div className="flex gap-6 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-8">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-cyan-500 inline-block" />
          You
        </span>

        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-green-600 inline-block" />
          Top 10%
        </span>
      </div>

      {ROWS.map((row) => {
        const vals = deepAnalysis.competitiveness[row.key] || {
          you: 0,
          top: 0,
        };

        return (
          <div key={row.key} className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium text-slate-700">{row.label}</p>

              <span className="text-xs font-medium text-slate-400">
                You: {vals.you}% / Top: {vals.top}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-3 bg-slate-100 rounded-full relative overflow-hidden">
              {/* Top 10% */}
              <div
                className="absolute h-full rounded-full bg-green-200 transition-all duration-1000 ease-out"
                style={{
                  width: animated ? `${vals.top}%` : "0%",
                }}
              />

              {/* Candidate */}
              <div
                className="absolute h-full rounded-full bg-cyan-500 transition-all duration-1000 ease-out"
                style={{
                  width: animated ? `${vals.you}%` : "0%",
                }}
              />
            </div>
          </div>
        );
      })}

      {/* Footer */}
      <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-700">
          Estimated Interview Selection Chance
        </span>

        <span
          className={`text-2xl font-bold ${interviewColor(
            deepAnalysis.interviewChance,
          )}`}
        >
          {deepAnalysis.interviewChance || "—"}
        </span>
      </div>
    </div>
  );
};

export default CompetitivenessComparison;
