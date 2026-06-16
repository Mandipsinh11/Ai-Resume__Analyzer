import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "../../../components/ui/Toast";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/reset-password`, {
        token,
        password,
      });
      toast.success("Password reset successful. You can now login with your new password.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed. The token may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col">
        <div
          className="absolute inset-0 w-full h-full"
          style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #0f172a 40%, #0c1529 100%)" }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(160deg, rgba(37,99,235,0.82) 0%, rgba(29,78,216,0.90) 100%)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: "radial-gradient(white 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
        <div className="relative z-10 flex flex-col h-full p-14 justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(12px)" }}
            >
              <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <span className="text-2xl font-black text-white tracking-tight">
              ATS<span style={{ color: "rgba(255,255,255,0.6)" }}>ify</span>
            </span>
          </Link>
          <div className="my-auto">
            <h2 className="text-4xl font-black text-white leading-tight mb-6">
              Create a new password.<br />
              <span style={{ color: "rgba(255,255,255,0.75)" }}>Make it strong and secure.</span>
            </h2>
            <p className="text-white/70 text-lg font-medium leading-relaxed max-w-md">
              Secure your account using a fresh, strong password to continue using our AI-powered resume builder.
            </p>
          </div>
          <div className="text-white/40 text-xs">
            © 2026 ATSify. All rights reserved.
          </div>
        </div>
      </div>

      <div
        className="flex-1 flex items-center justify-center px-6 py-12 relative"
        style={{ background: "var(--bg)" }}
      >
        <div
          className="absolute top-[-10%] right-[-10%] w-80 h-80 rounded-full pointer-events-none opacity-[0.06] blur-[100px]"
          style={{ background: "var(--primary)" }}
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-md"
        >
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-bold mb-6 transition-colors"
            style={{ color: "var(--text-3)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-3)")}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M19 12H5m7-7l-7 7 7 7" />
            </svg>
            Back to login
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-black tracking-tight mb-2" style={{ color: "var(--text)" }}>
              New Password
            </h1>
            <p className="text-sm font-medium" style={{ color: "var(--text-3)" }}>
              Please enter and confirm your new password below
            </p>
          </div>

          <div
            className="p-8 rounded-3xl border"
            style={{
              background: "var(--bg-2)",
              borderColor: "var(--border)",
              boxShadow: "0 4px 32px rgba(0,0,0,0.06)",
            }}
          >
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label
                  className="text-[10px] font-black uppercase tracking-widest mb-2 block"
                  style={{ color: "var(--text-3)" }}
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3.5 rounded-xl text-sm font-medium focus:outline-none transition-all pr-16"
                    style={{
                      background: "var(--bg)",
                      border: "1.5px solid var(--border)",
                      color: "var(--text)",
                      caretColor: "var(--primary)",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "var(--primary)";
                      e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.10)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "var(--border)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest transition-colors"
                    style={{ color: "var(--text-3)" }}
                    onMouseEnter={(e) => (e.target.style.color = "var(--primary)")}
                    onMouseLeave={(e) => (e.target.style.color = "var(--text-3)")}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div>
                <label
                  className="text-[10px] font-black uppercase tracking-widest mb-2 block"
                  style={{ color: "var(--text-3)" }}
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 rounded-xl text-sm font-medium focus:outline-none transition-all"
                  style={{
                    background: "var(--bg)",
                    border: "1.5px solid var(--border)",
                    color: "var(--text)",
                    caretColor: "var(--primary)",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--primary)";
                    e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.10)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "var(--border)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest text-white relative overflow-hidden group mt-1"
                style={{
                  background: "linear-gradient(135deg, var(--primary), var(--primary-d))",
                  boxShadow: "0 4px 20px rgba(37,99,235,0.25)",
                }}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "linear-gradient(135deg, var(--primary-d), var(--secondary))" }}
                />
                <span className="relative z-10">
                  {loading ? "Resetting..." : "Reset Password"}
                </span>
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword;
