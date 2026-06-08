const RecruiterImpression = ({ data }) => {
  return (
    <div className="bg-white rounded-3xl p-6 border">
      <h3 className="font-bold mb-4">Recruiter's First 6-Second Impression</h3>

      <div className="grid md:grid-cols-4 gap-4">
        <div>
          <p className="text-xs text-gray-500">Immediate Impression</p>
          <p className="font-bold text-red-500">{data?.impression}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Photo</p>
          <p className="font-bold text-orange-500">{data?.photoRisk}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Sections</p>
          <p className="font-bold text-red-500">{data?.sections}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Biggest Asset</p>
          <p className="font-bold text-green-600">{data?.asset}</p>
        </div>
      </div>
    </div>
  );
};

export default RecruiterImpression;
