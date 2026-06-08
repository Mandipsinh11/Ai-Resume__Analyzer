import React from 'react';

const SectionRewrites = ({ rewrites }) => {
  if (!rewrites?.length) return null;

  return (
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
        ))}
      </div>
    </div>
  );
};

export default SectionRewrites;
