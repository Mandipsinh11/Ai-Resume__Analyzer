import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    role: "Software Engineer",
    company: "Google",
    quote:
      "ATSify helped me rewrite my resume in 20 minutes. I got 4 interview calls the next week — including my dream company.",
    avatar: "PS",
    color: "from-blue-500 via-indigo-500 to-cyan-400",
    rating: 5,
  },
  {
    name: "Marcus Chen",
    role: "Product Manager",
    company: "Stripe",
    quote:
      "The keyword analysis was a game-changer. I had no idea my resume was missing critical terms. Within 2 weeks of optimizing, I had 3 offers.",
    avatar: "MC",
    color: "from-violet-500 to-purple-650",
    rating: 5,
  },
  {
    name: "Sarah Williams",
    role: "Data Scientist",
    company: "Meta",
    quote:
      "I've used multiple resume tools before, but nothing compares to ATSify's AI feedback. The bullet-point rewriting feature alone is worth it.",
    avatar: "SW",
    color: "from-emerald-500 to-teal-600",
    rating: 5,
  },
  {
    name: "Arjun Mehta",
    role: "Full-Stack Developer",
    company: "Amazon",
    quote:
      "After months of silence from applications, I used ATSify and suddenly started hearing back. My ATS score jumped from 34 to 92.",
    avatar: "AM",
    color: "from-orange-500 to-red-500",
    rating: 5,
  },
  {
    name: "Emily Park",
    role: "UX Designer",
    company: "Spotify",
    quote:
      "The format analysis caught issues I never would have noticed. Clean, fast, and incredibly accurate. I recommend it to every job seeker I know.",
    avatar: "EP",
    color: "from-pink-500 to-rose-600",
    rating: 5,
  },
  {
    name: "David Okafor",
    role: "DevOps Engineer",
    company: "Netflix",
    quote:
      "I was skeptical at first, but ATSify's scoring is incredibly precise. It pointed out that my resume had zero measurable outcomes — fixed that and landed interviews.",
    avatar: "DO",
    color: "from-cyan-500 to-blue-600",
    rating: 5,
  },
];

const StarRating = ({ count = 5 }) => (
  <div className="flex gap-0.5">
    {[...Array(count)].map((_, i) => (
      <Star
        key={i}
        size={13}
        className="fill-amber-400 stroke-none"
      />
    ))}
  </div>
);

const TestimonialCard = ({ t }) => (
  <div
    className="flex flex-col p-6 md:p-8 rounded-[28px] border border-white/60 bg-white/70 backdrop-blur-xl shadow-[0_12px_32px_rgba(37,99,235,0.025)] hover:border-blue-200/80 hover:shadow-[0_16px_36px_rgba(37,99,235,0.05)] transition-all duration-300 w-full h-[230px] justify-between"
  >
    <div className="flex flex-col flex-1">
      <StarRating count={t.rating} />

      <blockquote className="mt-4 mb-4 flex-1 text-[13px] md:text-sm font-semibold leading-relaxed text-[var(--text-2)]">
        "{t.quote}"
      </blockquote>

      <div className="flex items-center gap-3 pt-3.5 border-t border-slate-100/50">
        <div
          className={`w-9.5 h-9.5 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-[11px] font-black shadow-sm`}
        >
          {t.avatar}
        </div>
        <div>
          <p className="text-xs font-black text-[var(--text)]">{t.name}</p>
          <p className="text-[10px] font-bold text-[var(--text-3)] leading-none mt-0.5">
            {t.role} · {t.company}
          </p>
        </div>
      </div>
    </div>
  </div>
);

const MarqueeRow = ({ items, direction = "left" }) => {
  const doubledItems = [...items, ...items];
  const animClass = direction === "left" ? "animate-marquee-left" : "animate-marquee-right";
  
  return (
    <div className="marquee-container flex overflow-hidden w-full py-3 relative">
      <div className={`marquee-track flex gap-6 min-w-max ${animClass}`}>
        {doubledItems.map((t, idx) => (
          <div key={idx} className="w-[290px] md:w-[350px] shrink-0 whitespace-normal">
            <TestimonialCard t={t} />
          </div>
        ))}
      </div>
    </div>
  );
};

const Testimonials = () => {
  const row1 = [TESTIMONIALS[0], TESTIMONIALS[1], TESTIMONIALS[2]];
  const row2 = [TESTIMONIALS[3], TESTIMONIALS[4], TESTIMONIALS[5]];

  const styleBlock = `
    @keyframes marquee-left {
      0% { transform: translateX(0%); }
      100% { transform: translateX(-50%); }
    }
    @keyframes marquee-right {
      0% { transform: translateX(-50%); }
      100% { transform: translateX(0%); }
    }
    .animate-marquee-left {
      animation: marquee-left 35s linear infinite;
    }
    .animate-marquee-right {
      animation: marquee-right 35s linear infinite;
    }
    .marquee-container:hover .marquee-track {
      animation-play-state: paused;
    }
  `;

  return (
    <section
      id="testimonials"
      className="py-20 relative overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      <style dangerouslySetInnerHTML={{ __html: styleBlock }} />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.015] grid-bg" />

      {/* Background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[550px] pointer-events-none rounded-full blur-[150px] opacity-[0.08]"
        style={{ background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)" }}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[var(--primary)] text-xs font-black uppercase tracking-[0.3em] mb-4 bg-blue-50/95 border border-blue-150/80 px-4 py-1.5 rounded-full inline-block backdrop-blur-sm shadow-sm"
          >
            Testimonials
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-[40px] font-black tracking-tight text-[var(--text)] mb-5 leading-tight"
          >
            Loved by <span className="bg-gradient-to-r from-blue-600 to-indigo-650 bg-clip-text text-transparent">job seekers</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-[var(--text-2)] text-base md:text-lg max-w-xl mx-auto font-semibold leading-relaxed"
          >
            See how professionals used ATSify to land roles at the world's top companies.
          </motion.p>
        </div>

        {/* Infinite scrolling dual marquee rows */}
        <div className="relative flex flex-col gap-2 w-full overflow-visible py-4">
          <MarqueeRow items={row1} direction="left" />
          <MarqueeRow items={row2} direction="right" />
          
          {/* Ambient Fade masks */}
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[var(--bg)] to-transparent z-20 pointer-events-none hidden sm:block" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[var(--bg)] to-transparent z-20 pointer-events-none hidden sm:block" />
        </div>

        {/* Summary stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16"
        >
          {[
            { value: "4.9/5", label: "Average Rating" },
            { value: "10,000+", label: "Resumes Optimized" },
            { value: "96%", label: "ATS Pass Rate" },
            { value: "3×", label: "More Interviews" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl md:text-3xl font-black text-[var(--primary)]">
                {stat.value}
              </p>
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-3)] mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
