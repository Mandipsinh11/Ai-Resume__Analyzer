import { useState, useEffect } from "react";

/* Pure CSS resume shapes — optimized for mobile performance */
const FallingResumes = () => {
  const [count, setCount] = useState(14);

  useEffect(() => {
    // Reduce particle count on mobile for performance
    const mq = window.matchMedia("(max-width: 768px)");
    setCount(mq.matches ? 6 : 14);

    const onChange = (e) => setCount(e.matches ? 6 : 14);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Respect prefers-reduced-motion
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  if (reducedMotion) return null;

  const resumes = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${4 + Math.random() * 92}%`,
    delay: Math.random() * 14,
    duration: 20 + Math.random() * 14,
    size: 32 + Math.random() * 44,
    rotation: -25 + Math.random() * 50,
    lines: 2 + Math.floor(Math.random() * 3),
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {resumes.map((r) => (
        <div
          key={r.id}
          className="absolute opacity-0"
          style={{
            left: r.left,
            width: r.size,
            height: r.size * 1.4,
            animation: `falling ${r.duration}s linear infinite`,
            animationDelay: `${r.delay}s`,
            willChange: "transform",
          }}
        >
          <div
            className="w-full h-full rounded-md shadow-md border border-blue-100/40 overflow-hidden p-1.5 flex flex-col gap-1"
            style={{
              background: "rgba(255,255,255,0.75)",
              transform: `rotate(${r.rotation}deg)`,
              animation: `sway ${r.duration / 3}s ease-in-out infinite alternate`,
            }}
          >
            {/* Mini header bar */}
            <div className="w-3/5 h-1 rounded-full bg-blue-300/40" />
            <div className="w-2/5 h-0.5 rounded-full bg-blue-200/30" />
            <div className="mt-auto flex flex-col gap-0.5">
              {Array.from({ length: r.lines }).map((_, j) => (
                <div key={j} className="w-full h-0.5 rounded-full bg-gray-300/30" />
              ))}
            </div>
          </div>
        </div>
      ))}
      {/* Gradient overlay to keep text readable */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, var(--bg) 0%, transparent 15%, transparent 85%, var(--bg) 100%)",
        }}
      />
    </div>
  );
};

export default FallingResumes;
