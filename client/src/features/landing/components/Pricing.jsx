import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import PaymentModal from "../../../components/ui/PaymentModal";
import { Check, Lock } from "lucide-react";

const Pricing = () => {
    const navigate = useNavigate();
    const [paymentPlan, setPaymentPlan] = useState(null);
    const [currency, setCurrency] = useState(null);
    const [rate, setRate] = useState(null);
    const FX_KEY = "fxCache_ipapi_v1";
    const FX_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
    const FX_COOLDOWN_MS = 2 * 60 * 1000; // 2 min cooldown if ipapi rate-limits

    const plans = [
        {
            name: "Free",
            desc: "Explore the platform. No card needed.",
            features: [
                "Resume upload & instant ATS score",
                "AI keyword detection overview",
                "Structural resume analysis",
                "Section-by-section grade summary",
            ],
            locked: [
                "Full color-coded feedback report",
                "ATS resume download",
                "Cover letter generator",
            ],
            cta: "Start Free",
            badge: null,
        },
        {
            name: "Basic",
            desc: "One-time purchase. Modify and make changes to 4 resumes.",
            features: [
                "Modify and optimize 4 resumes",
                "Make updates & changes to 4 resumes",
                "Complete color-coded feedback report",
                "Email support",
            ],
            locked: [
                "Job description match scoring",
                "Unlimited resume versions",
                "LinkedIn profile optimization",
            ],
            cta: "Get Basic",
            badge: "Most Popular",
        },
        {
            name: "Pro",
            desc: "Unlimited everything. The complete career toolkit.",
            features: [
                "Everything in Basic — unlimited",
                "Job description match scoring",
                "Unlimited resume versions",
                "AI interview prep questions",
                "LinkedIn profile optimization",
                "Priority support",
            ],
            locked: [],
            cta: "Get Pro",
            badge: "Best Value",
        },
    ];

    useEffect(() => {
        const cached = JSON.parse(sessionStorage.getItem(FX_KEY) || "null");
        if (cached && Date.now() - cached.t < FX_TTL_MS) {
            setCurrency(cached.c);
            setRate(cached.r);
            return;
        }

        const lastAttempt = Number(sessionStorage.getItem(`${FX_KEY}_lastAttempt`) || "0");
        if (lastAttempt && Date.now() - lastAttempt < FX_COOLDOWN_MS) {
            setCurrency("USD");
            setRate(1);
            return;
        }

        (async () => {
            try {
                sessionStorage.setItem(`${FX_KEY}_lastAttempt`, String(Date.now()));
                const ipRes = await fetch("https://ipapi.co/json/");
                const ipData = await ipRes.json();
                const cur = ipData.currency || "USD";
                const fxRes = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
                const fxData = await fxRes.json();
                const r = cur === "USD" ? 1 : fxData.rates[cur] || 1;
                setCurrency(cur);
                setRate(r);
                sessionStorage.setItem(FX_KEY, JSON.stringify({ c: cur, r, t: Date.now() }));
            } catch {
                setCurrency("USD");
                setRate(1);
            }
        })();
    }, []);

    const getFormattedPrice = (name) => {
        if (!currency || rate === null) return null;
        if (name === "Free") return currency === "INR" ? "₹0" : "$0";
        if (currency === "INR") {
            return name === "Basic" ? "₹299" : "₹999";
        } else {
            return name === "Basic" ? "$4.99" : "$14.99";
        }
    };

    const getPricePeriod = (name) => {
        if (name === "Pro") return "/year";
        return "";
    };

    return (
        <section
            id="pricing"
            className="py-20 relative overflow-hidden"
            style={{ background: "var(--bg)" }}
        >
            {/* Grid overlay for futuristic vibe */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.02] grid-bg" />
            
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] pointer-events-none opacity-25 blur-[120px]"
                style={{
                    background: "radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)",
                }}
            />
            <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
                <div className="text-center mb-16">
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-[var(--primary)] text-xs font-black uppercase tracking-[0.3em] mb-4 bg-blue-50/95 border border-blue-150/80 px-4 py-1.5 rounded-full inline-block backdrop-blur-sm shadow-sm"
                    >
                        Investment
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl sm:text-4xl lg:text-[40px] font-black tracking-tight text-[var(--text)] mb-5 leading-tight"
                    >
                        Simple, <span className="text-[var(--primary)]">Honest</span> Pricing
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-[var(--text-2)] text-base md:text-lg max-w-xl mx-auto font-semibold leading-relaxed"
                    >
                        Start for free and upgrade as you grow. No hidden fees or complex contracts.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
                    {plans.map((p, i) => {
                        const isPro = p.name === "Pro";
                        const isBasic = p.name === "Basic";
                        const price = getFormattedPrice(p.name);
                        
                        return (
                            <motion.div
                                key={p.name}
                                initial={{ opacity: 0, y: 35 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.12, type: "spring", stiffness: 80, damping: 15 }}
                                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                                className="relative pt-4 w-full max-w-md mx-auto lg:max-w-none lg:mx-0 flex flex-col cursor-pointer"
                                onClick={() =>
                                    p.name === "Free"
                                        ? navigate("/signup")
                                        : setPaymentPlan(p.name.toLowerCase())
                                }
                            >
                                {/* Badge (Rendered outside overflow-hidden container to prevent cropping) */}
                                {p.badge && (
                                    <div className="absolute top-0.5 left-1/2 -translate-x-1/2 z-30">
                                        <span
                                            className={`px-4 py-1 text-[9px] font-black uppercase tracking-widest rounded-full shadow-md ${
                                                isPro
                                                    ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white"
                                                    : "bg-[var(--primary)] text-white shadow-blue-500/10"
                                            }`}
                                        >
                                            {p.badge}
                                        </span>
                                    </div>
                                )}

                                {/* Main Card boundary (overflow-hidden clips the conic border glow) */}
                                <div className={`relative w-full h-full rounded-[32px] p-[2px] overflow-hidden flex flex-col ${
                                    isPro 
                                        ? "shadow-[0_24px_60px_rgba(37,99,235,0.14)]" 
                                        : "shadow-[0_16px_36px_rgba(37,99,235,0.03)]"
                                }`}>
                                    {/* Rotating Conic Neon Border for Pro Tier */}
                                    {isPro && (
                                        <div className="absolute inset-[-1000%] bg-[conic-gradient(from_90deg_at_50%_50%,#2563eb_0%,#6366f1_25%,#22d3ee_50%,#2563eb_100%)] animate-[spin_6s_linear_infinite] opacity-80" />
                                    )}

                                    {/* Inner Card Container */}
                                    <div className={`relative z-10 w-full h-full rounded-[30px] p-8 md:p-10 flex flex-col justify-between ${
                                        isPro
                                            ? "bg-slate-950 text-white"
                                            : isBasic
                                                ? "bg-white/85 backdrop-blur-xl border border-blue-200/50"
                                                : "bg-white/65 backdrop-blur-xl border border-white/50"
                                    }`}>
                                        
                                        {/* Card Glow Blob */}
                                        {!isPro && (
                                            <div
                                                className="absolute inset-0 rounded-[30px] pointer-events-none opacity-[0.06] group-hover:opacity-[0.1] transition-opacity"
                                                style={{
                                                    background: `radial-gradient(circle at 50% 0%, var(--primary) 0%, transparent 70%)`,
                                                }}
                                            />
                                        )}

                                        <div className="flex flex-col flex-1">
                                            <div className="mb-6">
                                                <p
                                                    className={`text-[10px] font-black uppercase tracking-widest mb-3 ${
                                                        isPro ? "text-cyan-400" : "text-slate-400"
                                                    }`}
                                                >
                                                    {p.name}
                                                </p>
                                                <div className="flex items-baseline gap-1.5 mb-4">
                                                    <span className={`text-4xl md:text-5xl font-black tracking-tighter ${
                                                        isPro ? "text-white" : "text-[var(--text)]"
                                                    }`}>
                                                        {price === null ? (
                                                            <span className="inline-block w-24 h-10 skeleton rounded-xl bg-slate-200/50" />
                                                        ) : (
                                                            price
                                                        )}
                                                    </span>
                                                    <span className={`text-sm font-semibold ${
                                                        isPro ? "text-slate-450" : "text-[var(--text-3)]"
                                                    }`}>
                                                        {getPricePeriod(p.name)}
                                                    </span>
                                                </div>
                                                <p
                                                    className={`text-xs font-semibold leading-relaxed ${
                                                        isPro ? "text-slate-400" : "text-[var(--text-2)]"
                                                    }`}
                                                >
                                                    {p.desc}
                                                </p>
                                            </div>

                                            <div className={`h-px mb-6 ${isPro ? "bg-slate-900" : "bg-slate-100"}`} />

                                            {/* Features List */}
                                            <ul className="space-y-4 mb-8 flex-1">
                                                {p.features.map((f) => (
                                                    <li key={f} className="flex items-start gap-3">
                                                        <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border ${
                                                            isPro
                                                                ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                                                                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                                                        }`}>
                                                            <Check size={11} strokeWidth={3.5} />
                                                        </div>
                                                        <span
                                                            className={`text-[12.5px] font-semibold leading-tight ${
                                                                isPro ? "text-slate-300" : "text-[var(--text-2)]"
                                                            }`}
                                                        >
                                                            {f}
                                                        </span>
                                                    </li>
                                                ))}
                                                {p.locked.map((f) => (
                                                    <li key={f} className="flex items-start gap-3 opacity-40">
                                                        <div className="mt-0.5 w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 text-slate-400">
                                                            <Lock size={10} strokeWidth={2.5} />
                                                        </div>
                                                        <span
                                                            className="text-[12.5px] font-semibold text-[var(--text-3)] leading-tight"
                                                        >
                                                            {f}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>

                                            {/* Button */}
                                            <motion.button
                                                whileHover={{ scale: 1.02, y: -1 }}
                                                whileTap={{ scale: 0.98 }}
                                                className={`w-full py-4.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-sm hover:shadow-md cursor-pointer ${
                                                    isPro
                                                        ? "bg-gradient-to-r from-blue-500 to-cyan-450 text-white shadow-blue-500/10 hover:shadow-cyan-400/20"
                                                        : isBasic
                                                            ? "bg-[var(--primary)] text-white shadow-blue-500/10 hover:shadow-blue-500/20 glow-button"
                                                            : "bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-350 text-[var(--text-2)]"
                                                }`}
                                            >
                                                {p.cta}
                                            </motion.button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
            <AnimatePresence>
                {paymentPlan && (
                    <PaymentModal plan={paymentPlan} onClose={() => setPaymentPlan(null)} />
                )}
            </AnimatePresence>
        </section>
    );
};

export default Pricing;
