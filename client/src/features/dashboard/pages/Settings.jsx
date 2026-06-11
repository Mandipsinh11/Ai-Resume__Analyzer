import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { User, Lock, Bell, Trash2, Save, ShieldCheck } from "lucide-react";
import { DashboardNavbar } from "./Dashboard";

const Settings = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const displayName = useMemo(() => {
    return user.name || user.username || "User";
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setTimeout(() => {
      setSaving(false);
      setMessage("Profile updated successfully!");
      localStorage.setItem("user", JSON.stringify({ ...user, name, email }));
    }, 1000);
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match.");
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setMessage("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] pb-24 overflow-x-hidden relative">
      {/* Background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[60%] h-[60%] rounded-full opacity-20 blur-[140px]"
          style={{ background: "radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] rounded-full opacity-10 blur-[120px]"
          style={{ background: "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)" }} />
      </div>

      <DashboardNavbar displayName={displayName} onLogout={handleLogout} />

      <motion.main
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 pt-40 px-6 md:px-12 max-w-7xl mx-auto w-full"
      >
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-black tracking-tight text-[var(--text)] mb-3">
              Account Settings
            </h1>
            <p className="text-lg font-medium text-[var(--text-3)]">
              Manage your neural profile and security protocols.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Sidebar Nav */}
            <div className="space-y-2">
              {[
                { id: "profile", label: "Profile Info", icon: <User className="w-4 h-4" /> },
                { id: "security", label: "Security", icon: <Lock className="w-4 h-4" /> },
                { id: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4" /> },
                { id: "billing", label: "Billing", icon: <ShieldCheck className="w-4 h-4" /> }
              ].map((item) => (
                <button
                  key={item.id}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${item.id === "profile"
                      ? "bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary-glow)]"
                      : "text-[var(--text-3)] hover:bg-[var(--bg-2)] hover:text-[var(--text)]"
                    }`}
                >
                  {item.icon} {item.label}
                </button>
              ))}
              <div className="pt-8 mt-8 border-t border-[var(--border)]">
                <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 hover:bg-rose-50 transition-all">
                  <Trash2 className="w-4 h-4" /> Delete Account
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-2 space-y-8">
              {/* Profile Form */}
              <section className="p-10 bg-[var(--bg-2)] rounded-[40px] border border-[var(--border)] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary-glow)] rounded-full blur-3xl opacity-10" />
                <h2 className="text-2xl font-black tracking-tight text-[var(--text)] mb-8 flex items-center gap-3">
                  <User className="text-[var(--primary)]" /> Personal Identity
                </h2>
                <form onSubmit={handleProfileSave} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-3)] ml-1">Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-[var(--bg)] border border-[var(--border)] px-6 py-4 rounded-2xl text-[var(--text)] font-semibold focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-glow)] transition-all outline-none"
                        placeholder="Enter your name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-3)] ml-1">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[var(--bg)] border border-[var(--border)] px-6 py-4 rounded-2xl text-[var(--text)] font-semibold focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-glow)] transition-all outline-none"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-[var(--primary)] text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-[var(--primary-glow)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {saving ? "Syncing..." : <><Save className="w-4 h-4" /> Update Profile</>}
                  </button>
                </form>
              </section>

              {/* Password Form */}
              <section className="p-10 bg-[var(--bg-2)] rounded-[40px] border border-[var(--border)] shadow-xl">
                <h2 className="text-2xl font-black tracking-tight text-[var(--text)] mb-8 flex items-center gap-3">
                  <Lock className="text-[var(--primary)]" /> Cryptography & Security
                </h2>
                <form onSubmit={handlePasswordSave} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-3)] ml-1">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-[var(--bg)] border border-[var(--border)] px-6 py-4 rounded-2xl text-[var(--text)] font-semibold focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-glow)] transition-all outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-3)] ml-1">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-[var(--bg)] border border-[var(--border)] px-6 py-4 rounded-2xl text-[var(--text)] font-semibold focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-glow)] transition-all outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-3)] ml-1">Confirm Sync</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-[var(--bg)] border border-[var(--border)] px-6 py-4 rounded-2xl text-[var(--text)] font-semibold focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-glow)] transition-all outline-none"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-[var(--text)] text-[var(--bg)] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {saving ? "Re-encrypting..." : <><ShieldCheck className="w-4 h-4" /> Change Password</>}
                  </button>
                </form>
              </section>

              {message && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-6 rounded-2xl font-bold text-center border ${message.includes("success")
                      ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                      : "bg-rose-50 border-rose-200 text-rose-600"
                    }`}
                >
                  {message}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.main>
    </div>
  );
};

export default Settings;
