const RedFlags = ({ flags }) => {
  if (!flags?.length) return null;

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
      <h3 className="text-2xl font-bold text-red-600 mb-6">Red Flags</h3>

      <ul className="space-y-4">
        {flags.map((item, index) => (
          <li
            key={index}
            className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-100"
          >
            <span className="text-red-500 font-bold shrink-0">⚠</span>

            <span className="text-sm font-medium text-red-700 leading-7">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RedFlags;
