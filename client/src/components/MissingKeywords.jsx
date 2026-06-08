const MissingKeywords = ({ keywords }) => {
  return (
    <div className="bg-white p-6 rounded-3xl border">
      <h3 className="font-bold mb-4">Missing Keywords</h3>

      <div className="flex flex-wrap gap-2">
        {keywords?.map((k, index) => (
          <span
            key={index}
            className="px-3 py-1 rounded-full bg-red-100 text-red-600 text-sm"
          >
            {k}
          </span>
        ))}
      </div>
    </div>
  );
};

export default MissingKeywords;
