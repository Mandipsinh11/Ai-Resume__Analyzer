import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { User, Lock, Bell, ShieldCheck, Trash2, FileText, Check } from "lucide-react";
import { DashboardNavbar } from "./Dashboard";
import { getOptimizationHistory } from "../../../utils/optimizationHistory";

const Settings = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  
  const [activeTab, setActiveTab] = useState("profile");
  const [name, setName] = useState(user.name || "sindha mandipsinh");
  const [email, setEmail] = useState(user.email || "sindhamandip@gmail.com");
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [atsAlerts, setAtsAlerts] = useState(true);
  const [marketingUpdates, setMarketingUpdates] = useState(false);
  
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const displayName = useMemo(() => {
    return user.name || user.username || "sindha mandipsinh";
  }, [user]);

  const stats = useMemo(() => {
    let bestScore = 0;
    let optimizationsCount = 0;
    let resumesCount = 0;

    try {
      const history = getOptimizationHistory() || [];
      if (history.length > 0) {
        const scores = history.map((h) => Math.max(h.score || 0, h.scoreAfter || 0));
        bestScore = Math.max(...scores);
        optimizationsCount = history.filter((item) => item.scoreAfter).length;
      }
    } catch (err) {
      console.error("Failed to read optimization history:", err);
    }

    try {
      const saved = JSON.parse(localStorage.getItem("savedResumes") || "[]");
      if (saved.length > 0) {
        resumesCount = saved.length;
      }
    } catch (err) {
      console.error("Failed to read saved resumes:", err);
    }

    return {
      bestScore: bestScore + "%",
      resumesCount,
      optimizationsCount
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setTimeout(() => {
      setSaving(false);
      setMessage("Profile updated successfully!");
      localStorage.setItem("user", JSON.stringify({ ...user, name, email }));
    }, 8000);
  };

  const handlePasswordSave = (e) => {
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
    }, 8000);
  };

  const handleNotificationsSave = () => {
    setSaving(true);
    setMessage("");
    setTimeout(() => {
      setSaving(false);
      setMessage("Notification preferences saved!");
    }, 8000);
  };

  const activePlan = useMemo(() => {
    const plan = user.subscription?.plan || "Free";
    return plan.charAt(0).toUpperCase() + plan.slice(1);
  }, [user]);

  return (
    <div className="min-h-screen bg-[#f4f7fc] text-slate-800 pb-24 overflow-x-hidden relative font-outfit">
      {/* Soft blue accent background glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[55%] h-[55%] rounded-full opacity-30 blur-[130px] bg-gradient-to-br from-blue-100 to-transparent" />
        <div className="absolute bottom-0 left-0 w-[45%] h-[45%] rounded-full opacity-20 blur-[120px] bg-gradient-to-tr from-indigo-100 to-transparent" />
      </div>

      <DashboardNavbar displayName={displayName} onLogout={handleLogout} />

      <motion.main
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 pt-36 px-6 md:px-12 max-w-7xl mx-auto w-full"
      >
        <div className="max-w-5xl mx-auto">
          {/* Header section */}
          <div className="mb-10">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
              Settings
            </h1>
            <p className="text-base font-semibold text-slate-450">
              Manage your ATSify account, security, notifications, and subscription settings.
            </p>
          </div>

          {/* Top visual stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[
              { label: "ATS Score", value: stats.bestScore },
              { label: "Resumes", value: stats.resumesCount },
              { label: "Optimizations", value: stats.optimizationsCount },
              { label: "Current Plan", value: activePlan, isBlue: true }
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white/60 border border-blue-200/20 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  {stat.label}
                </span>
                <span className={`text-2xl font-black mt-2 leading-none ${stat.isBlue ? "text-blue-600" : "text-slate-800"}`}>
                  {stat.value}
                </span>
              </div>
            ))}
          </div>

          {/* Grid Layout: Sidebar and Main card details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            {/* Sidebar Navigation */}
            <div className="space-y-1 bg-white/30 p-2 rounded-3xl border border-blue-250/10 shadow-sm backdrop-blur-md">
              {[
                { id: "profile", label: "Profile Info", icon: <User className="w-4 h-4" /> },
                { id: "security", label: "Security", icon: <Lock className="w-4 h-4" /> },
                { id: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4" /> },
                { id: "billing", label: "Billing", icon: <ShieldCheck className="w-4 h-4" /> }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMessage("");
                  }}
                  className={`w-full flex items-center gap-4 px-6 py-4.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer ${
                    activeTab === item.id
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/15"
                      : "text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                  }`}
                >
                  {item.icon} {item.label}
                </button>
              ))}
              
              <div className="my-5 border-t border-slate-200/80 mx-4" />

              <button
                onClick={() => {
                  if (confirm("Are you sure you want to delete your account? This action is irreversible.")) {
                    handleLogout();
                  }
                }}
                className="w-full flex items-center gap-4 px-6 py-4.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-rose-500 hover:bg-rose-50/50 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Delete Account
              </button>
            </div>

            {/* Main Details Card Area */}
            <div className="lg:col-span-2">
              <div className="bg-white/80 border border-blue-200/20 shadow-xl rounded-[32px] p-8 md:p-10 backdrop-blur-lg relative">
                
                {/* Dynamic Content Views */}
                <div>
                  {activeTab === "profile" && (
                    <section className="animate-fadeIn">
                      <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
                        <User className="text-blue-600" size={24} /> Personal Identity
                      </h2>
                      
                      <form onSubmit={handleProfileSave} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">
                              Full Name
                            </label>
                            <input
                              type="text"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="w-full bg-[#f0f4f9] border-0 px-6 py-4.5 rounded-2xl text-slate-800 font-bold placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none text-sm"
                              placeholder="Enter your full name"
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">
                              Email Address
                            </label>
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full bg-[#f0f4f9] border-0 px-6 py-4.5 rounded-2xl text-slate-800 font-bold placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none text-sm"
                              placeholder="Enter your email address"
                              required
                            />
                          </div>
                        </div>

                        <div className="pt-4">
                          <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-3.5 px-8 py-4.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                          >
                            {saving ? (
                              "Updating..."
                            ) : (
                              <>
                                <FileText className="w-4 h-4" /> Update Profile
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </section>
                  )}

                  {activeTab === "security" && (
                    <section className="animate-fadeIn">
                      <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
                        <Lock className="text-blue-600" size={24} /> Cryptography & Security
                      </h2>

                      <form onSubmit={handlePasswordSave} className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">
                            Current Password
                          </label>
                          <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full bg-[#f0f4f9] border-0 px-6 py-4.5 rounded-2xl text-slate-800 font-bold focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none text-sm"
                            placeholder="••••••••"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">
                              New Password
                            </label>
                            <input
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="w-full bg-[#f0f4f9] border-0 px-6 py-4.5 rounded-2xl text-slate-800 font-bold focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none text-sm"
                              placeholder="••••••••"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">
                              Confirm Sync
                            </label>
                            <input
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="w-full bg-[#f0f4f9] border-0 px-6 py-4.5 rounded-2xl text-slate-800 font-bold focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none text-sm"
                              placeholder="••••••••"
                              required
                            />
                          </div>
                        </div>

                        <div className="pt-4">
                          <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-3.5 px-8 py-4.5 rounded-2xl bg-[#0f172a] hover:bg-[#1e293b] text-white font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                          >
                            {saving ? (
                              "Syncing..."
                            ) : (
                              <>
                                <ShieldCheck className="w-4 h-4" /> Change Password
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </section>
                  )}

                  {activeTab === "notifications" && (
                    <section className="animate-fadeIn">
                      <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
                        <Bell className="text-blue-600" size={24} /> Notifications
                      </h2>

                      <div className="space-y-4">
                        {[
                          {
                            id: "email",
                            title: "Email Notifications",
                            val: emailNotifications,
                            setVal: setEmailNotifications
                          },
                          {
                            id: "score",
                            title: "ATS Score Alerts",
                            val: atsAlerts,
                            setVal: setAtsAlerts
                          },
                          {
                            id: "marketing",
                            title: "Marketing Updates",
                            val: marketingUpdates,
                            setVal: setMarketingUpdates
                          }
                        ].map((pref) => (
                          <div
                            key={pref.id}
                            onClick={() => pref.setVal(!pref.val)}
                            className="flex items-center justify-between p-5.5 rounded-2xl bg-[#f0f4f9]/60 hover:bg-[#f0f4f9]/80 border border-slate-200/10 cursor-pointer transition-all duration-200"
                          >
                            <span className="text-sm font-semibold text-slate-800">
                              {pref.title}
                            </span>
                            <div
                              className={`w-5.5 h-5.5 rounded-md flex items-center justify-center border transition-all ${
                                pref.val
                                  ? "bg-blue-600 border-blue-600 text-white"
                                  : "bg-white border-slate-300"
                              }`}
                            >
                              {pref.val && <Check size={14} strokeWidth={3} />}
                            </div>
                          </div>
                        ))}

                        <div className="pt-6">
                          <button
                            onClick={handleNotificationsSave}
                            disabled={saving}
                            className="flex items-center gap-3 px-8 py-4.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                          >
                            {saving ? "Saving..." : "Save Preferences"}
                          </button>
                        </div>
                      </div>
                    </section>
                  )}

                  {activeTab === "billing" && (
                    <section className="animate-fadeIn">
                      <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
                        <ShieldCheck className="text-blue-600" size={24} /> Billing & Subscription
                      </h2>

                      <div className="space-y-6">
                        <div className="mb-6">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                            Current Plan
                          </span>
                          <h3 className="text-2xl font-black text-blue-600 mt-1.5 leading-none">
                            {activePlan} Plan
                          </h3>
                        </div>



                        {activePlan !== "Pro" && (
                          <div className="pt-4">
                            <button
                              onClick={() => navigate("/dashboard?upgrade=all")}
                              className="w-full sm:w-auto px-8 py-4.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                            >
                              Upgrade to Pro
                            </button>
                          </div>
                        )}
                      </div>
                    </section>
                  )}
                </div>

                {/* Toast alerts / Action status notices */}
                <AnimatePresence>
                  {message && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className={`p-5 mt-8 rounded-2xl font-bold text-center border text-sm shadow-sm ${
                        message.includes("successfully") || message.includes("saved") || message.includes("preferences")
                          ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                          : "bg-rose-50 border-rose-200 text-rose-600"
                      }`}
                    >
                      {message}
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </div>
          </div>
        </div>
      </motion.main>
    </div>
  );
};

export default Settings;
