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
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mb-6">
      {/* Header */}
      <h3 className="text-2xl font-bold text-slate-900 mb-2">
        Top 10 Changes for Biggest Improvement
      </h3>

      <p className="text-sm font-medium text-slate-500 mb-6">
        Ranked by impact — start from the highest-priority improvements first.
      </p>

      {/* Legend */}
      <div className="flex flex-wrap gap-5 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-6">
        <span className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
          Critical (1–3)
        </span>

        <span className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
          Important (4–6)
        </span>

        <span className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
          Helpful (7–10)
        </span>
      </div>

      {/* Changes */}
      <div className="space-y-4">
        {changes.map((item) => {
          const style = priorityColor(item.number);

          return (
            <div
              key={item.number}
              className={`flex gap-4 items-start p-5 rounded-2xl border ${style.bg} ${style.border} transition-all duration-200 hover:shadow-sm`}
            >
              {/* Number */}
              <div
                className={`w-8 h-8 rounded-full ${style.num} text-white text-sm font-bold flex items-center justify-center shrink-0`}
              >
                {item.number}
              </div>

              {/* Content */}
              <div className="flex-1">
                <p
                  className="text-sm font-medium text-slate-700 leading-7"
                  dangerouslySetInnerHTML={{
                    __html: item.text,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Top10Changes;
