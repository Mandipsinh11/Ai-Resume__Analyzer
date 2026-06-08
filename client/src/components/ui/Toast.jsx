import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ToastContext = createContext(null);

/** Toast types: "success" | "error" | "info" | "warning" */
const ICONS = {
  success: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
  error: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
    </svg>
  ),
  info: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
    </svg>
  ),
  warning: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
};

const STYLES = {
  success: { bg: "#ecfdf5", border: "#a7f3d0", color: "#065f46", icon: "#10b981" },
  error:   { bg: "#fef2f2", border: "#fecaca", color: "#991b1b", icon: "#ef4444" },
  info:    { bg: "#eff6ff", border: "#bfdbfe", color: "#1e40af", icon: "#3b82f6" },
  warning: { bg: "#fffbeb", border: "#fde68a", color: "#92400e", icon: "#f59e0b" },
};

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message, type = "info", duration = 4000) => addToast(message, type, duration),
    [addToast]
  );

  // Convenience methods
  toast.success = (msg, dur) => addToast(msg, "success", dur);
  toast.error = (msg, dur) => addToast(msg, "error", dur);
  toast.info = (msg, dur) => addToast(msg, "info", dur);
  toast.warning = (msg, dur) => addToast(msg, "warning", dur);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast container */}
      <div
        className="fixed top-4 right-4 flex flex-col gap-2 pointer-events-none"
        style={{ zIndex: 10001 }}
        aria-live="polite"
        aria-label="Notifications"
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast: t, onDismiss }) {
  const s = STYLES[t.type] || STYLES.info;

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(t.id), t.duration);
    return () => clearTimeout(timer);
  }, [t.id, t.duration, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border max-w-sm"
      style={{ background: s.bg, borderColor: s.border }}
      role="alert"
    >
      <span style={{ color: s.icon }} className="flex-shrink-0">
        {ICONS[t.type]}
      </span>
      <p className="text-sm font-semibold flex-1" style={{ color: s.color }}>
        {t.message}
      </p>
      <button
        onClick={() => onDismiss(t.id)}
        className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors"
        style={{ color: s.color }}
        aria-label="Dismiss notification"
      >
        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  );
}

/**
 * Hook to show toast notifications.
 * Usage: const toast = useToast(); toast.error("Something went wrong");
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
