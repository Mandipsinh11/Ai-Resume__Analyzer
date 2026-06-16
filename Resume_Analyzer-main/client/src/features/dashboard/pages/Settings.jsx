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
  const [activeTab, setActiveTab] = useState("profile");

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("notifications");

    return saved
      ? JSON.parse(saved)
      : {
          email: true,
          atsAlerts: true,
          marketing: false,
        };
  });

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
  const handleDeleteAccount = () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account?",
    );

    if (!confirmDelete) return;

    localStorage.clear();
    sessionStorage.clear();

    navigate("/signup");
  };

  const handleUpgrade = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5001/api/payment/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            plan: "pro",
          }),
        },
      );

      const data = await response.json();

      console.log("Payment Order:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to create order");
      }

      // Razorpay integration will go here
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    }
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
<<<<<<< HEAD
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] pb-24 overflow-x-hidden relative">
      {/* Background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-0 right-0 w-[60%] h-[60%] rounded-full opacity-20 blur-[140px]"
          style={{
            background:
              "radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[40%] h-[40%] rounded-full opacity-10 blur-[120px]"
          style={{
            background:
              "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)",
          }}
        />
=======
    <div className="min-h-screen bg-[#f4f7fc] text-slate-800 pb-24 overflow-x-hidden relative font-outfit">
      {/* Soft blue accent background glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[55%] h-[55%] rounded-full opacity-30 blur-[130px] bg-gradient-to-br from-blue-100 to-transparent" />
        <div className="absolute bottom-0 left-0 w-[45%] h-[45%] rounded-full opacity-20 blur-[120px] bg-gradient-to-tr from-indigo-100 to-transparent" />
>>>>>>> 29febc269fc3b5ae89e7250d360451803b7076ce
      </div>

      <DashboardNavbar displayName={displayName} onLogout={handleLogout} />

      <motion.main
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
<<<<<<< HEAD
        className="relative z-10 pt-32 px-6 md:px-8 max-w-7xl mx-auto"
      >
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--text)] mb-3">
              Settings
            </h1>
            <p className="text-lg font-medium text-[var(--text-3)]">
              Manage your ATSify account, security, notifications, and
              subscription settings.
            </p>
          </div>

          {/* ATSify Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
              <p className="text-sm text-[var(--text-3)]">ATS Score</p>
              <h3 className="text-2xl font-bold text-[var(--text)]">87%</h3>
            </div>

            <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
              <p className="text-sm text-[var(--text-3)]">Resumes</p>
              <h3 className="text-2xl font-bold text-[var(--text)]">12</h3>
            </div>

            <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
              <p className="text-sm text-[var(--text-3)]">Optimizations</p>
              <h3 className="text-2xl font-bold text-[var(--text)]">34</h3>
            </div>

            <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
              <p className="text-sm text-[var(--text-3)]">Current Plan</p>
              <h3 className="text-2xl font-bold text-[var(--primary)]">
                {user.plan || "Free"}
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Nav */}
            <div className="space-y-2">
=======
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
>>>>>>> 29febc269fc3b5ae89e7250d360451803b7076ce
              {[
                {
                  id: "profile",
                  label: "Profile Info",
                  icon: <User className="w-4 h-4" />,
                },
                {
                  id: "security",
                  label: "Security",
                  icon: <Lock className="w-4 h-4" />,
                },
                {
                  id: "notifications",
                  label: "Notifications",
                  icon: <Bell className="w-4 h-4" />,
                },
                {
                  id: "billing",
                  label: "Billing",
                  icon: <ShieldCheck className="w-4 h-4" />,
                },
              ].map((item) => (
                <button
                  key={item.id}
<<<<<<< HEAD
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold font-black uppercase tracking-[0.2em] transition-all ${
                    item.id === activeTab
                      ? "bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary-glow)]"
                      : "text-[var(--text-3)] hover:bg-[var(--bg-2)] hover:text-[var(--text)]"
=======
                  onClick={() => {
                    setActiveTab(item.id);
                    setMessage("");
                  }}
                  className={`w-full flex items-center gap-4 px-6 py-4.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer ${
                    activeTab === item.id
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/15"
                      : "text-slate-400 hover:bg-slate-50 hover:text-slate-700"
>>>>>>> 29febc269fc3b5ae89e7250d360451803b7076ce
                  }`}
                >
                  {item.icon} {item.label}
                </button>
              ))}
<<<<<<< HEAD
              <div className="pt-8 mt-8 border-t border-[var(--border)]">
                <button
                  onClick={handleDeleteAccount}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold font-black uppercase tracking-[0.2em] text-rose-500 hover:bg-rose-50 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3 space-y-6">
              {/* Profile Form */}
              {activeTab === "profile" && (
                <section className="p-8 bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary-glow)] rounded-full blur-3xl opacity-10" />
                  <h2 className="text-2xl font-black tracking-tight text-[var(--text)] mb-8 flex items-center gap-3">
                    <User className="text-[var(--primary)]" /> Personal Identity
                  </h2>
                  <form onSubmit={handleProfileSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-3)] ml-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-[var(--bg)] border border-[var(--border)] px-6 py-4 rounded-2xl text-[var(--text)] font-semibold focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-glow)] transition-all outline-none"
                          placeholder="Enter your name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-3)] ml-1">
                          Email Address
                        </label>
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
                      {saving ? (
                        "Syncing..."
                      ) : (
                        <>
                          <Save className="w-4 h-4" /> Update Profile
                        </>
                      )}
                    </button>
                  </form>
                </section>
              )}

              {/* Password Form */}
              {activeTab === "security" && (
                <section
                  className="p-10 bg-[var(--card)]
border border-[var(--border)]
rounded-3xl
shadow-lg"
                >
                  <h2 className="text-2xl font-black tracking-tight text-[var(--text)] mb-8 flex items-center gap-3">
                    <Lock className="text-[var(--primary)]" /> Cryptography &
                    Security
                  </h2>
                  <form onSubmit={handlePasswordSave} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-3)] ml-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full bg-[var(--bg)] border border-[var(--border)] px-6 py-4 rounded-2xl text-[var(--text)] font-semibold focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-glow)] transition-all outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-3)] ml-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-[var(--bg)] border border-[var(--border)] px-6 py-4 rounded-2xl text-[var(--text)] font-semibold focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-glow)] transition-all outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-3)] ml-1">
                          Confirm Sync
                        </label>
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
                      {saving ? (
                        "Re-encrypting..."
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" /> Change Password
                        </>
                      )}
                    </button>
                  </form>
                </section>
              )}

              {activeTab === "notifications" && (
                <section
                  className="p-10 bg-[var(--card)]
border border-[var(--border)]
rounded-3xl
shadow-lg"
                >
                  <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                    <Bell className="text-[var(--primary)]" />
                    Notifications
                  </h2>

                  <div className="space-y-6">
                    <label className="flex items-center justify-between">
                      <span>Email Notifications</span>
                      <input
                        type="checkbox"
                        checked={notifications.email}
                        onChange={() =>
                          setNotifications({
                            ...notifications,
                            email: !notifications.email,
                          })
                        }
                      />
                    </label>

                    <label className="flex items-center justify-between">
                      <span>ATS Score Alerts</span>
                      <input
                        type="checkbox"
                        checked={notifications.atsAlerts}
                        onChange={() =>
                          setNotifications({
                            ...notifications,
                            atsAlerts: !notifications.atsAlerts,
                          })
                        }
                      />
                    </label>

                    <label className="flex items-center justify-between">
                      <span>Marketing Updates</span>
                      <input
                        type="checkbox"
                        checked={notifications.marketing}
                        onChange={() =>
                          setNotifications({
                            ...notifications,
                            marketing: !notifications.marketing,
                          })
                        }
                      />
                    </label>

                    <button
                      onClick={() => {
                        localStorage.setItem(
                          "notifications",
                          JSON.stringify(notifications),
                        );
                        setMessage("Notification preferences saved!");
                      }}
                      className="px-8 py-4 rounded-2xl bg-[var(--primary)] text-white font-black text-xs uppercase tracking-[0.2em]"
                    >
                      Save Preferences
                    </button>
                  </div>
                </section>
              )}

              {activeTab === "billing" && (
                <section
                  className="p-10 bg-[var(--card)]
border border-[var(--border)]
rounded-3xl
shadow-lg"
                >
                  <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                    <ShieldCheck className="text-[var(--primary)]" />
                    Billing & Subscription
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <p className="text-sm text-[var(--text-3)]">
                        Current Plan
                      </p>
                      <p className="text-xl font-black text-[var(--primary)]">
                        {user.plan || "Free Plan"}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-[var(--bg)]">
                        <p className="text-sm text-[var(--text-3)]">
                          Resume Analyses
                        </p>
                        <p className="text-2xl font-black">12</p>
                      </div>

                      <div className="p-4 rounded-xl bg-[var(--bg)]">
                        <p className="text-sm text-[var(--text-3)]">
                          ATS Reports
                        </p>
                        <p className="text-2xl font-black">8</p>
                      </div>
                    </div>

                    <button
                      onClick={handleUpgrade}
                      className="px-8 py-4 rounded-2xl bg-[var(--primary)] text-white font-black text-xs uppercase tracking-[0.2em]"
                    >
                      Upgrade to Pro
                    </button>
                  </div>
                </section>
              )}

              {message && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-6 rounded-2xl font-bold text-center border ${
                    message.includes("success")
                      ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                      : "bg-rose-50 border-rose-200 text-rose-600"
                  }`}
                >
                  {message}
                </motion.div>
              )}
=======
              
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
>>>>>>> 29febc269fc3b5ae89e7250d360451803b7076ce
            </div>
          </div>
        </div>
      </motion.main>
    </div>
  );
};

export default Settings;
