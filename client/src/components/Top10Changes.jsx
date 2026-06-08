const priorityColor = (num) => {
  if (num <= 3)
    return {
      bg: "bg-red-50",
      border: "border-red-200",
      num: "bg-red-500",
      label: "Critical",
    };
  if (num <= 6)
    return {
      bg: "bg-amber-50",
      border: "border-amber-200",
      num: "bg-amber-500",
      label: "Important",
    };
  return {
    bg: "bg-blue-50",
    border: "border-blue-200",
    num: "bg-blue-500",
    label: "Helpful",
  };
};

const Top10Changes = ({ changes }) => {
  if (!changes?.length) return null;

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
      <h3 className="font-black text-xl mb-2">
        Top 10 Changes for Biggest Improvement
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        Ranked by impact — start from the top
      </p>

      {/* Priority legend */}
      <div className="flex gap-4 text-xs font-semibold mb-6">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />{" "}
          Critical (1–3)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />{" "}
          Important (4–6)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />{" "}
          Helpful (7–10)
        </span>
      </div>

      <div className="space-y-3">
        {changes.map((item) => {
          const style = priorityColor(item.number);
          return (
            <div
              key={item.number}
              className={`flex gap-4 items-start p-4 rounded-xl border ${style.bg} ${style.border} transition-all hover:shadow-sm`}
            >
              {/* Number badge */}
              <div
                className={`w-7 h-7 rounded-full ${style.num} text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5`}
              >
                {item.number}
              </div>

              {/* Text */}
              <p
                className="text-sm font-medium text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: item.text }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Top10Changes;
