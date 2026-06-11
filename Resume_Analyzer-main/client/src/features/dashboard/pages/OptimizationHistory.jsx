import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getOptimizationHistory,
  clearOptimizationHistory,
  formatRelativeTime,
  formatFileSize,
} from "../../../utils/optimizationHistory";

const OptimizationHistory = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const loadHistory = () => {
      setHistory(getOptimizationHistory() || []);
    };

    loadHistory();

    window.addEventListener("atsify-history-updated", loadHistory);
    return () =>
      window.removeEventListener("atsify-history-updated", loadHistory);
  }, []);

  // Fix: Check both initial score and AI-improved score for the absolute best performance
  const bestScore =
    history.length > 0
      ? Math.max(
          ...history.map((h) => Math.max(h.score || 0, h.scoreAfter || 0)),
        )
      : 0;

  const handleClearHistory = () => {
    if (
      window.confirm(
        "Are you sure you want to permanently clear your optimization history?",
      )
    ) {
      clearOptimizationHistory();
      setHistory([]);
    }
  };

  const [selectedReport, setSelectedReport] = useState(null);

  const handleViewDetails = (item) => {
    setSelectedReport(item);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-5xl font-black tracking-tight bg-gradient-to-r from-[var(--text)] to-[var(--text-3)] bg-clip-text text-transparent">
              Optimization History
            </h1>
            <p className="text-[var(--text-3)] mt-2">
              Review all previous ATS analyses and AI optimizations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="px-5 py-3 rounded-xl border border-[var(--border)] font-semibold transition-all hover:bg-[var(--bg-2)] active:scale-95"
            >
              Back to Dashboard
            </Link>

            <button
              onClick={handleClearHistory}
              className="px-5 py-3 rounded-xl bg-red-500/10 text-red-500 font-semibold border border-red-500/20 transition-all hover:bg-red-500 hover:text-white active:scale-95"
            >
              Clear History
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-3xl bg-[var(--bg-2)] border border-[var(--border)] transition-all hover:shadow-lg">
            <p className="text-sm font-semibold text-[var(--text-3)] uppercase tracking-wider">
              Total Analyses
            </p>
            <h2 className="text-4xl font-black mt-2 text-blue-500">
              {history.length}
            </h2>
          </div>

          <div className="p-6 rounded-3xl bg-[var(--bg-2)] border border-[var(--border)] transition-all hover:shadow-lg">
            <p className="text-sm font-semibold text-[var(--text-3)] uppercase tracking-wider">
              Best ATS Score
            </p>
            <h2 className="text-4xl font-black mt-2 text-emerald-500">
              {bestScore}%
            </h2>
          </div>

          <div className="p-6 rounded-3xl bg-[var(--bg-2)] border border-[var(--border)] transition-all hover:shadow-lg">
            <p className="text-sm font-semibold text-[var(--text-3)] uppercase tracking-wider">
              AI Optimized
            </p>
            <h2 className="text-4xl font-black mt-2 text-purple-500">
              {history.filter((item) => item.scoreAfter).length}
            </h2>
          </div>
        </div>

        {/* History List */}
        {history.length === 0 ? (
          <div className="p-16 rounded-3xl border border-dashed border-[var(--border)] bg-[var(--bg-2)]/30 text-center max-w-2xl mx-auto mt-12">
            <div className="w-16 h-16 bg-[var(--bg-2)] border border-[var(--border)] rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
              📦
            </div>
            <h3 className="text-2xl font-bold mb-2">No History Found</h3>
            <p className="text-[var(--text-3)] max-w-md mx-auto">
              Upload and analyze a resume using our processing engine to start
              logging performance trends.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {history.map((item) => (
              <div
                key={item.id}
                className="p-6 rounded-3xl bg-[var(--bg-2)] border border-[var(--border)] transition-all hover:border-blue-500/40 hover:shadow-md flex flex-col justify-between"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  {/* Metadata */}
                  <div className="space-y-1 flex-1">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/10 mb-2">
                      {item.role || "General Optimization"}
                    </span>
                    <h3 className="text-xl font-black tracking-tight truncate max-w-md">
                      {item.fileName}
                    </h3>
                    <p className="text-sm text-[var(--text-3)]">
                      Analyzed {formatRelativeTime(item.createdAt)}
                    </p>
                  </div>

                  {/* Metrics & Actions Display */}
                  <div className="flex flex-wrap items-center gap-8 md:gap-12 backend-data">
                    <div className="text-center md:text-left">
                      <p className="text-xs font-semibold text-[var(--text-3)] uppercase tracking-wider">
                        Initial Score
                      </p>
                      <h4 className="text-2xl font-black mt-0.5">
                        {item.score ?? "-"}
                      </h4>
                    </div>

                    {item.scoreAfter && (
                      <div className="text-center md:text-left">
                        <p className="text-xs font-semibold text-[var(--text-3)] uppercase tracking-wider">
                          Optimized
                        </p>
                        <h4 className="text-2xl font-black mt-0.5 text-emerald-500 flex items-center gap-1">
                          {item.scoreAfter}
                          <span className="text-xs text-emerald-400 font-medium">
                            (+{item.scoreAfter - (item.score || 0)})
                          </span>
                        </h4>
                      </div>
                    )}

                    <div className="text-center md:text-left hidden sm:block">
                      <p className="text-xs font-semibold text-[var(--text-3)] uppercase tracking-wider">
                        Size
                      </p>
                      <h4 className="text-md font-bold mt-1 text-[var(--text-2)]">
                        {formatFileSize(item.fileSize)}
                      </h4>
                    </div>

                    <button
                      onClick={() => handleViewDetails(item)}
                      className="px-4 py-2.5 rounded-xl bg-blue-500 text-white font-medium text-sm transition-all hover:bg-blue-600 shadow-md shadow-blue-500/10 active:scale-95 w-full sm:w-auto text-center"
                    >
                      View Report
                    </button>
                  </div>
                </div>

                {/* Suggestions Accordion Snippet */}
                {item.feedback?.improve?.items?.length > 0 && (
                  <div className="mt-5 pt-5 border-t border-[var(--border)]/60">
                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-3)] mb-2.5">
                      Critical Fixes Implemented
                    </p>
                    <ul className="grid sm:grid-cols-3 gap-3">
                      {item.feedback.improve.items
                        .slice(0, 3)
                        .map((suggestion, idx) => (
                          <li
                            key={idx}
                            className="text-sm bg-[var(--bg)] border border-[var(--border)]/40 px-3 py-2 rounded-xl text-[var(--text-2)] truncate"
                            title={suggestion}
                          >
                            🔹 {suggestion}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-4xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black">{selectedReport.fileName}</h2>

              <button
                onClick={() => setSelectedReport(null)}
                className="text-xl font-bold px-3 py-1 rounded-lg hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl border">
                <p className="text-sm text-gray-500">Role</p>
                <p className="font-bold">{selectedReport.role}</p>
              </div>

              <div className="p-4 rounded-xl border">
                <p className="text-sm text-gray-500">Initial Score</p>
                <p className="font-bold text-xl">{selectedReport.score}</p>
              </div>

              <div className="p-4 rounded-xl border">
                <p className="text-sm text-gray-500">Optimized Score</p>
                <p className="font-bold text-xl text-emerald-500">
                  {selectedReport.scoreAfter || "-"}
                </p>
              </div>
            </div>

            <h3 className="font-bold text-lg mb-3">Improvement Suggestions</h3>

            <ul className="space-y-2 mb-6">
              {selectedReport.feedback?.improve?.items?.map((item, index) => (
                <li key={index} className="p-3 rounded-xl border bg-gray-50">
                  {item}
                </li>
              ))}
            </ul>

            <h3 className="font-bold text-lg mt-6 mb-3">Resume Details</h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border">
                <p className="text-sm text-gray-500">File Name</p>
                <p className="font-medium">{selectedReport.fileName}</p>
              </div>

              <div className="p-4 rounded-xl border">
                <p className="text-sm text-gray-500">Analyzed On</p>
                <p className="font-medium">
                  {new Date(selectedReport.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizationHistory;
