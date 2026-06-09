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

const SectionRewrites = ({ rewrites }) => {
  if (!rewrites?.length) return null;

  return (
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
        ))}
      </div>
    </div>
  );
};

export default SectionRewrites;
