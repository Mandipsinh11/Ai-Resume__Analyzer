import { CheckCircle2, XCircle, AlertTriangle, ThumbsUp } from "lucide-react";

const HiringVerdictDeep = ({ verdict }) => {
  if (!verdict) return null;

  const shortlisted = verdict.wouldShortlist === true;

  const theme = shortlisted
    ? {
        wrapper: "bg-emerald-50 border-emerald-200",
        badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
        label: "Strong Interview Potential",
        blockerCard: "border-emerald-100 bg-white",
      }
    : {
        wrapper: "bg-red-50 border-red-200",
        badge: "bg-red-100 text-red-700 border-red-200",
        icon: <XCircle className="w-5 h-5 text-red-600" />,
        label: "Needs Resume Improvements",
        blockerCard: "border-red-100 bg-white",
      };

  return (
    <div
      className={`border border-slate-200 rounded-3xl p-8 mb-6 shadow-sm ${theme.wrapper}`}
    >
      {/* Header */}
      <h3 className="text-2xl font-bold text-slate-900 mb-6">
        Final Verdict — Hiring Manager Perspective
      </h3>

      {/* Status Badge */}
      <div
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-semibold text-sm mb-6 ${theme.badge}`}
      >
        {theme.icon}
        {theme.label}
      </div>

      {/* Main Reason */}
      <p className="text-sm font-medium text-slate-700 leading-7 mb-6">
        {verdict.reason}
      </p>

      <div className="space-y-4">
        {/* Biggest Blocker */}
        {verdict.biggestBlocker && (
          <div className={`p-5 rounded-2xl border ${theme.blockerCard}`}>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />

              <p className="text-xs font-semibold uppercase tracking-wider text-red-600">
                Biggest Blocker
              </p>
            </div>

            <p className="text-sm font-medium text-red-600 leading-7">
              {verdict.biggestBlocker}
            </p>
          </div>
        )}

        {/* Good News */}
        {verdict.goodNews && (
          <div className="p-5 rounded-2xl border border-emerald-100 bg-white">
            <div className="flex items-center gap-2 mb-2">
              <ThumbsUp className="w-4 h-4 text-emerald-500 shrink-0" />

              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                The Good News
              </p>
            </div>

            <p className="text-sm font-medium text-emerald-700 leading-7">
              {verdict.goodNews}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HiringVerdictDeep;
