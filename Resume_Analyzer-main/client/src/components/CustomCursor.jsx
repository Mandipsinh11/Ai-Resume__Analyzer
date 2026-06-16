import { useEffect, useRef, useState } from "react";

const CustomCursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [hasMouse, setHasMouse] = useState(false);

  useEffect(() => {
    // Only enable on devices with a fine pointer (mouse)
    const mq = window.matchMedia("(pointer: fine) and (hover: hover)");
    setHasMouse(mq.matches);

    const onChange = (e) => setHasMouse(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!hasMouse) return;

    const move = (e) => {
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX - 4}px, ${e.clientY - 4}px, 0)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${e.clientX - 12}px, ${e.clientY - 12}px, 0)`;
      }
    };

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [hasMouse]);

  // Don't render on touch devices
  if (!hasMouse) return null;

  return (
    <>
      {/* INNER DOT */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 bg-[var(--primary)] rounded-full pointer-events-none"
        style={{
          zIndex: 9999,
          willChange: "transform",
          transform: "translate3d(-10px, -10px, 0)",
          transition: "transform 0.02s linear"
        }}
      />

      {/* OUTER RING */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-6 h-6 rounded-full pointer-events-none border border-[var(--primary)]/30"
        style={{
          zIndex: 9998,
          willChange: "transform",
          transform: "translate3d(-30px, -30px, 0)",
          transition: "transform 0.12s cubic-bezier(0.25, 1, 0.5, 1)"
        }}
      />
    </>
  );
};

export default CustomCursor;