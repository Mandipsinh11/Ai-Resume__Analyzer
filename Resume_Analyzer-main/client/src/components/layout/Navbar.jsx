import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { title: "Features", path: "/#features", sectionId: "features" },
  { title: "How It Works", path: "/#how", sectionId: "how" },
  { title: "Templates", path: "/templates", sectionId: null },
  { title: "Pricing", path: "/#pricing", sectionId: "pricing" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const location = useLocation();

  // Scroll detection
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Hash scrolling
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [location]);

  // IntersectionObserver for active section detection
  useEffect(() => {
    if (location.pathname !== "/") {
      setActiveSection(null);
      return;
    }

    const sectionIds = navLinks.filter((l) => l.sectionId).map((l) => l.sectionId);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );

    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    sections.forEach((el) => observer.observe(el));
    return () => sections.forEach((el) => observer.unobserve(el));
  }, [location.pathname]);

  const isLinkActive = (link) => {
    if (link.sectionId && location.pathname === "/") {
      return activeSection === link.sectionId;
    }
    if (!link.sectionId) {
      return location.pathname.startsWith(link.path);
    }
    return false;
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 w-full transition-all duration-500"
      style={{
        zIndex: 100,
        background: scrolled ? "var(--glass)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
      }}
      role="banner"
    >
      <nav className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between py-4" aria-label="Main navigation">
        <Link to="/" className="flex items-center gap-2.5 group" aria-label="ATSify Home">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
            style={{
              background: "var(--primary)",
              boxShadow: "0 8px 16px -4px var(--primary-glow)",
            }}
          >
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </motion.div>
          <span className="text-2xl font-black tracking-[-0.05em] text-[var(--text)]">
            ATS<span style={{ color: "var(--primary)" }}>ify</span>
          </span>
        </Link>

        <ul className="hidden md:flex items-center gap-8" role="menubar">
          {navLinks.map((item) => {
            const active = isLinkActive(item);
            return (
              <li key={item.title} role="none">
                <Link
                  to={item.path}
                  role="menuitem"
                  className="text-sm font-bold transition-all duration-200 relative group py-2"
                  style={{ color: active ? "var(--primary)" : "var(--text-2)" }}
                >
                  {item.title}
                  <span
                    className="absolute bottom-0 left-0 h-0.5 bg-[var(--primary)] transition-all duration-300"
                    style={{ width: active ? "100%" : "0%" }}
                  />
                  {!active && (
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[var(--primary)] transition-all duration-300 group-hover:w-full" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <Link
              to="/dashboard"
              className="flex items-center gap-3 p-1.5 pr-4 rounded-full border border-[var(--border)] bg-[var(--bg-3)] hover:bg-[var(--bg-2)] transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-black text-xs">
                {user.name?.charAt(0) || "U"}
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-[var(--text)]">Dashboard</span>
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-bold px-4 py-2 text-[var(--text-2)] hover:text-[var(--text)] transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="px-6 py-2.5 rounded-xl font-black text-sm text-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                style={{
                  background: "var(--primary)",
                  boxShadow: "0 8px 16px -4px var(--primary-glow)",
                }}
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2 text-[var(--text)]"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          <div className="w-6 h-4 flex flex-col justify-between">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="block h-0.5 bg-current transition-all duration-300"
                style={{
                  transform:
                    open && i === 0
                      ? "rotate(45deg) translate(0, 8px)"
                      : open && i === 2
                        ? "rotate(-45deg) translate(0, -8px)"
                        : "none",
                  opacity: open && i === 1 ? 0 : 1,
                }}
              />
            ))}
          </div>
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-[var(--bg)] border-b border-[var(--border)] overflow-hidden"
            role="menu"
          >
            <div className="px-6 py-8 flex flex-col gap-5">
              {navLinks.map((item) => (
                <Link
                  key={item.title}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className="text-lg font-bold text-[var(--text-2)] hover:text-[var(--primary)]"
                  role="menuitem"
                >
                  {item.title}
                </Link>
              ))}
              <div className="pt-4 mt-4 border-t border-[var(--border)] flex flex-col gap-4">
                {user ? (
                  <Link
                    to="/dashboard"
                    onClick={() => setOpen(false)}
                    className="text-center py-4 rounded-xl font-black text-sm bg-[var(--bg-3)] text-[var(--text)]"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setOpen(false)}
                      className="text-center py-4 rounded-xl font-bold text-sm border border-[var(--border)] text-[var(--text-2)]"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setOpen(false)}
                      className="text-center py-4 rounded-xl font-black text-sm text-white"
                      style={{
                        background: "linear-gradient(135deg, var(--primary), var(--primary-d))",
                      }}
                    >
                      Get Started Free
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
