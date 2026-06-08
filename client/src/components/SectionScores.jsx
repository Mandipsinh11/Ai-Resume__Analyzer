import React from "react";

const scoreColor = (value) => {
  if (value >= 70) return { text: "#3a7a3a", bar: "#3a7a3a" };
  if (value >= 45) return { text: "#c68b1a", bar: "#c68b1a" };
  return { text: "#d94f3d", bar: "#d94f3d" };
};

const SECTIONS = [
  { key: "keywords_score", label: "Keywords" },
  { key: "experience_depth_score", label: "Experience depth" },
  { key: "formatting_score", label: "Formatting" },
  { key: "skills_relevance_score", label: "Skills relevance" },
  { key: "education_score", label: "Education" },
  { key: "quantified_achievements_score", label: "Quantified achievements" },
];

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "12px",
    marginBottom: "1.75rem",
  },
  card: {
    background: "#fff",
    border: "1px solid #e8e4de",
    borderRadius: "10px",
    padding: "1rem",
    fontFamily: "system-ui, sans-serif",
  },
  label: {
    fontSize: "12px",
    color: "#888",
    marginBottom: "6px",
  },
  score: {
    fontSize: "20px",
    fontWeight: 700,
    marginBottom: "8px",
    fontFamily: "Georgia, serif",
  },
  barBg: {
    height: "5px",
    background: "#eee",
    borderRadius: "3px",
    overflow: "hidden",
  },
  barFg: (value, hex) => ({
    height: "100%",
    width: `${value}%`,
    background: hex,
    borderRadius: "3px",
    transition: "width 0.6s ease",
  }),
  sectionTitle: {
    fontSize: "18px",
    fontWeight: 700,
    marginBottom: "1rem",
    fontFamily: "Georgia, serif",
    color: "#1a1a18",
  },
};

function ScoreCard({ label, value }) {
  const color = scoreColor(value);
  return (
    <div style={styles.card}>
      <div style={styles.label}>{label}</div>
      <div style={{ ...styles.score, color: color.text }}>{value}/100</div>
      <div style={styles.barBg}>
        <div style={styles.barFg(value, color.bar)} />
      </div>
    </div>
  );
}

export default function SectionScores({ data }) {
  if (!data) return null;

  return (
    <div>
      <div style={styles.sectionTitle}>Section scores</div>
      <div style={styles.grid}>
        {SECTIONS.map(({ key, label }) => (
          <ScoreCard key={key} label={label} value={data[key] ?? 0} />
        ))}
      </div>
    </div>
  );
}
