import React from "react";

function StatCard({ title, value, icon, change, color }) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span className="stat-title">{title}</span>

        <div
          className="stat-icon"
          style={{ color: color || "#60a5fa" }}
        >
          {icon || "📊"}
        </div>
      </div>

      <h2 className="stat-value">{value}</h2>

      <p className="stat-change">
        {change || "Sample data"}
      </p>
    </div>
  );
}

export default StatCard;