const RecruiterImpression = ({ data }) => {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 mb-6">
      <h3 className="text-2xl font-bold text-slate-900 mb-6">
        Recruiter's First 6-Second Impression
      </h3>

      <div className="grid md:grid-cols-4 gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Immediate Impression
          </p>
          <p className="text-base font-semibold text-red-500 mt-1">
            {data?.impression}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Photo
          </p>
          <p className="text-base font-semibold text-orange-500 mt-1">
            {data?.photoRisk}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Sections
          </p>
          <p className="text-base font-semibold text-red-500 mt-1">
            {data?.sections}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Biggest Asset
          </p>
          <p className="text-base font-semibold text-green-600 mt-1">
            {data?.asset}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RecruiterImpression;
