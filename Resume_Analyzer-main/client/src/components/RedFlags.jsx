const RedFlags = ({ flags }) => {
  return (
    <div className="bg-white p-6 rounded-3xl border">
      <h3 className="font-bold mb-4 text-red-600">Red Flags</h3>

      <ul className="space-y-3">
        {flags?.map((item, index) => (
          <li key={index} className="text-red-600">
            ⚠ {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RedFlags;
