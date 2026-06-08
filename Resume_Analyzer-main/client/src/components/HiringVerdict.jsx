import React from "react";

const HiringVerdict = ({ verdict }) => {
  if (!verdict) return null;

  const isRejected = verdict.status?.toLowerCase().includes("not");

  return (
    <div className="bg-[var(--bg-2)] border border-[var(--border)] rounded-3xl p-8">
      <h3 className="text-2xl font-black mb-6">Hiring Manager Verdict</h3>

      <div
        className={`inline-block px-4 py-2 rounded-xl mb-6 font-bold ${
          isRejected ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
        }`}
      >
        {verdict.status}
      </div>

      <p className="leading-8 text-[var(--text-2)]">{verdict.reason}</p>
    </div>
  );
};

export default HiringVerdict;
