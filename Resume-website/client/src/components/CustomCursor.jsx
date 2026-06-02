import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const CustomCursor = () => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
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
      setPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [hasMouse]);

  // Don't render on touch devices
  if (!hasMouse) return null;

  return (
    <>
      {/* INNER DOT */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 bg-[var(--primary)] rounded-full pointer-events-none"
        style={{ zIndex: 9999 }}
        animate={{ x: pos.x - 4, y: pos.y - 4 }}
        transition={{ duration: 0.05 }}
      />

      {/* OUTER RING */}
      <motion.div
        className="fixed top-0 left-0 rounded-full pointer-events-none border border-[var(--primary)]/30"
        style={{ zIndex: 9998 }}
        animate={{
          x: pos.x - 12,
          y: pos.y - 12,
          width: 24,
          height: 24,
        }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      />
    </>
  );
};

export default CustomCursor;