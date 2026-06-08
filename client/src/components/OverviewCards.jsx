import React from "react";

const scoreColor = (value) => {
  if (value >= 70) return "#3a7a3a";
  if (value >= 45) return "#c68b1a";
  return "#d94f3d";
};

const cards = [
  {
    label: "ATS SCORE",
    getValue: (d) => d.overall_ats_score,
    getSub: () => "out of 100",
    getColor: (d) => scoreColor(d.overall_ats_score),
    format: (v) => `${v}`,
  },
  {
    label: "PASS PROBABILITY",
    getValue: (d) => d.pass_probability,
    getSub: () => "ATS filter",
    getColor: (d) => scoreColor(d.pass_probability),
    format: (v) => `${v}%`,
  },
  {
    label: "VS TOP 10%",
    getValue: (d) => d.top10_match_percent,
    getSub: () => "match rate",
    getColor: (d) => scoreColor(d.top10_match_percent),
    format: (v) => `${v}%`,
  },
  {
    label: "INTERNSHIPS",
    getValue: (d) => d.internship_count,
    getSub: (d) =>
      d.internship_count >= 2
        ? "Good"
        : d.internship_count === 1
          ? "Low"
          : "Critical gap",
    getColor: (d) =>
      d.internship_count >= 2
        ? "#3a7a3a"
        : d.internship_count === 1
          ? "#c68b1a"
          : "#d94f3d",
    format: (v) => `${v}`,
  },
  {
    label: "EXPERIENCE",
    getValue: (d) => d.total_experience_months,
    getSub: (d) => (d.total_experience_months >= 6 ? "Adequate" : "Too short"),
    getColor: (d) => (d.total_experience_months >= 6 ? "#3a7a3a" : "#d94f3d"),
    format: (v) => `${v}mo`,
  },
];

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: "12px",
    marginBottom: "1.75rem",
  },
  card: {
    background: "#fff",
    border: "1px solid #e8e4de",
    borderRadius: "10px",
    padding: "1rem",
    textAlign: "center",
    fontFamily: "system-ui, sans-serif",
  },
  label: {
    fontSize: "10px",
    fontWeight: 600,
    color: "#aaa",
    letterSpacing: "0.8px",
    textTransform: "uppercase",
    marginBottom: "8px",
  },
  value: {
    fontSize: "30px",
    fontWeight: 700,
    lineHeight: 1,
    marginBottom: "5px",
    fontFamily: "Georgia, serif",
  },
  sub: {
    fontSize: "11px",
    color: "#aaa",
  },
};

export default function OverviewCards({ data }) {
  if (!data) return null;

  return (
    <div style={styles.grid}>
      {cards.map((card) => (
        <div key={card.label} style={styles.card}>
          <div style={styles.label}>{card.label}</div>
          <div style={{ ...styles.value, color: card.getColor(data) }}>
            {card.format(card.getValue(data))}
          </div>
          <div style={styles.sub}>{card.getSub(data)}</div>
        </div>
      ))}
    </div>
  );
}
