import React from "react";
import {
  Award,
  Zap,
  Calendar,
  GraduationCap,
  CheckCircle2,
} from "lucide-react";

export const CertificationGapAnalyzer = ({ analysis }) => {
  if (!analysis) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
        <p className="text-sm font-medium text-slate-500">
          No certification data available.
        </p>
      </div>
    );
  }

  const data = analysis;

  const getPriorityTheme = (priority) => {
    switch (priority) {
      case "High":
        return {
          border: "border-red-200 border-l-4 border-l-red-500",
          badge: "bg-red-50 text-red-700 border-red-100",
        };

      case "Medium":
        return {
          border: "border-amber-200 border-l-4 border-l-amber-500",
          badge: "bg-amber-50 text-amber-700 border-amber-100",
        };

      default:
        return {
          border: "border-emerald-200 border-l-4 border-l-emerald-500",
          badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
        };
    }
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600 border border-blue-100">
            <Award className="w-5 h-5" />
          </div>

          <div>
            <h4 className="text-2xl font-bold text-slate-900">
              Certification Gap Analyzer
            </h4>

            <p className="text-sm font-medium text-slate-500 mt-1">
              Target Role:
              <span className="ml-2 text-blue-600 font-semibold">
                {data.target_role}
              </span>
            </p>
          </div>
        </div>

        {/* Score */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Certification Readiness
          </span>

          <span className="text-2xl font-black text-blue-600">
            {data.certification_score ?? 0}%
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Certifications */}
        <div className="lg:col-span-2 space-y-4">
          <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            Missing Certifications Required By Employers
          </h5>

          {data.missing_certifications?.length ? (
            data.missing_certifications.map((cert, idx) => {
              const theme = getPriorityTheme(cert.priority);

              return (
                <div
                  key={idx}
                  className={`bg-slate-50 border rounded-2xl p-5 ${theme.border}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h5 className="text-base font-semibold text-slate-900">
                        {cert.name || cert.course}
                      </h5>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
                          <GraduationCap className="w-3.5 h-3.5" />
                          {typeof cert.provider === "object"
                            ? JSON.stringify(cert.provider)
                            : cert.provider}
                        </span>

                        <span className="text-slate-300">•</span>

                        <span className="text-xs font-medium text-slate-500">
                          {cert.difficulty}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full border ${theme.badge}`}
                      >
                        {cert.priority}
                      </span>

                      <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full border border-blue-100 bg-blue-50 text-blue-600">
                        ATS +{cert.estimated_ats_boost}
                      </span>
                    </div>
                  </div>

                  <p className="mt-4 text-sm font-medium text-slate-700 leading-7 bg-white border border-slate-100 rounded-xl p-4">
                    {typeof cert.reason === "object"
                      ? JSON.stringify(cert.reason)
                      : cert.reason}
                  </p>

                  <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-500">
                    <Calendar className="w-4 h-4" />

                    <span>Estimated Duration:</span>

                    <span className="font-semibold text-slate-900">
                      {typeof cert.duration === "object"
                        ? JSON.stringify(cert.duration)
                        : cert.duration}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50">
              <p className="text-sm font-medium text-slate-500">
                No certification gaps detected.
              </p>
            </div>
          )}
        </div>

        {/* Learning Roadmap */}
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6">
          <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2 mb-5">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            Learning Roadmap
          </h5>

          <div className="relative pl-4 border-l-2 border-dashed border-slate-200 ml-2 space-y-5">
            {data.learning_path?.length ? (
              data.learning_path.map((step, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[22px] top-1.5 w-2 h-2 rounded-full bg-blue-600" />

                  <p className="text-sm font-medium text-slate-700 leading-7">
                    {typeof step === "object"
                      ? `${step.course || ""} • ${step.provider || ""} • ${
                          step.duration || ""
                        }`
                      : step}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm font-medium text-slate-500">
                No roadmap available.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
