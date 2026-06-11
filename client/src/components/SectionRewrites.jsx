<<<<<<< HEAD:client/src/components/SectionRewrites.jsx
import React from 'react';
=======
import { useState } from "react";
import { ChevronDown, ChevronUp, Copy, Check } from "lucide-react";

const RewriteCard = ({ item, index }) => {
  const [open, setOpen] = useState(index === 0);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.newText || "");
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
      {/* Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
            {index + 1}
          </span>

          <span className="text-base font-semibold text-slate-900">
            {item.title}
          </span>
        </div>

        {open ? (
          <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        )}
      </button>

      {/* Body */}
      {open && (
        <div className="divide-y divide-slate-100">
          {/* Before */}
          {item.oldText && (
            <div className="px-5 py-4 bg-red-50">
              <p className="text-xs font-semibold uppercase tracking-wider text-red-500 mb-2">
                Before
              </p>

              <p className="text-sm font-medium text-red-700 leading-7 line-through opacity-70">
                {item.oldText}
              </p>
            </div>
          )}

          {/* After */}
          <div className="px-5 py-4 bg-emerald-50">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-2">
                  After
                </p>

                <p className="text-sm font-medium text-emerald-800 leading-7">
                  {item.newText}
                </p>
              </div>

              <button
                onClick={handleCopy}
                className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-200 bg-white text-xs font-semibold text-emerald-600 hover:bg-emerald-100 transition-colors mt-0.5"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
>>>>>>> origin/main:Resume_Analyzer-main/client/src/components/SectionRewrites.jsx

const SectionRewrites = ({ rewrites }) => {
  if (!rewrites?.length) return null;

  return (
<<<<<<< HEAD:client/src/components/SectionRewrites.jsx
    <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
      <h3 className="font-black text-xl mb-2">Section-by-Section Rewrites</h3>
      <p className="text-sm text-gray-500 mb-6">
        See how AI recommends improving specific sections of your resume.
      </p>

      <div className="space-y-6">
        {rewrites.map((item, index) => (
          <div key={index} className="border-b border-gray-100 last:border-b-0 pb-6 last:pb-0">
            <h4 className="font-black text-lg text-gray-800 mb-3">{item.title || "Resume Section"}</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-red-50/50 border border-red-100 rounded-xl p-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-red-500 mb-2 block">Before</span>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap italic">"{item.oldText}"</p>
              </div>
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 mb-2 block">After (ATS Optimized)</span>
                <p className="text-sm text-gray-800 font-medium leading-relaxed whitespace-pre-wrap">"{item.newText}"</p>
              </div>
            </div>
          </div>
=======
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mb-6">
      <h3 className="text-2xl font-bold text-slate-900 mb-2">
        Section Rewrites
      </h3>

      <p className="text-sm font-medium text-slate-500 mb-6">
        Click each section to compare the original content with the AI-optimized
        version and copy the improved text directly into your resume.
      </p>

      <div className="space-y-4">
        {rewrites.map((item, index) => (
          <RewriteCard key={index} item={item} index={index} />
>>>>>>> origin/main:Resume_Analyzer-main/client/src/components/SectionRewrites.jsx
        ))}
      </div>
    </div>
  );
};

export default SectionRewrites;
