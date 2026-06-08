const StrengthsSection = ({ strengths }) => {
  return (
    <div className="bg-white p-6 rounded-3xl border">
      <h3 className="font-bold mb-4">Strengths</h3>

      <ul className="space-y-3">
        {strengths?.map((item, index) => (
          <li key={index} className="text-green-700">
            ✓ {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StrengthsSection;
