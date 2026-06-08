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
  if (isNaN(num)) return "text-gray-500";
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
    <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
      <h3 className="font-black text-xl mb-2">
        Competitiveness vs Top 10% Candidates
      </h3>

      {/* Legend */}
      <div className="flex gap-5 text-xs font-semibold text-gray-500 mb-6">
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
          <div key={row.key} className="mb-5">
            <div className="flex justify-between mb-1">
              <p className="text-sm font-semibold text-gray-700">{row.label}</p>
              <span className="text-xs text-gray-400 font-medium">
                You: {vals.you}% / Top: {vals.top}%
              </span>
            </div>

            {/* Single track — top10 in green behind, you in cyan in front */}
            <div className="h-3 bg-gray-100 rounded-full relative overflow-hidden">
              {/* Top 10% bar (background) */}
              <div
                className="absolute h-full rounded-full bg-green-200 transition-all duration-1000 ease-out"
                style={{ width: animated ? `${vals.top}%` : "0%" }}
              />
              {/* You bar (foreground) */}
              <div
                className="absolute h-full rounded-full bg-cyan-500 transition-all duration-1000 ease-out"
                style={{ width: animated ? `${vals.you}%` : "0%" }}
              />
            </div>
          </div>
        );
      })}

      {/* Interview Chance */}
      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
        <span className="text-sm font-bold text-gray-700">
          Estimated Interview Selection Chance
        </span>
        <span
          className={`text-lg font-black ${interviewColor(deepAnalysis.interviewChance)}`}
        >
          {deepAnalysis.interviewChance || "—"}
        </span>
      </div>
    </div>
  );
};

export default CompetitivenessComparison;
