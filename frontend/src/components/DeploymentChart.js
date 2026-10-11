
import React from "react";

function DeploymentChart({ deployments = [] }) {
  const success = deployments.filter(
    (item) => item.status === "Success"
  ).length;

  const running = deployments.filter(
    (item) => item.status === "Running"
  ).length;

  const failed = deployments.filter(
    (item) => item.status === "Failed"
  ).length;

  const total = deployments.length || 1;

  const statuses = [
    { name: "Success", count: success, color: "#22c55e" },
    { name: "Running", count: running, color: "#3b82f6" },
    { name: "Failed", count: failed, color: "#ef4444" },
  ];

  return (
    <section className="panel deployment-chart">
      <div className="panel-heading">
        <div>
          <h3>Deployment Status</h3>
          <p>Overview of all deployments</p>
        </div>
        <span className="tag">LIVE DATA</span>
      </div>

      {statuses.map((item) => (
        <div className="chart-item" key={item.name}>
          <div className="chart-label">
            <span>
              <span
                className="chart-dot"
                style={{ backgroundColor: item.color }}
              />
              {item.name}
            </span>
            <strong>{item.count}</strong>
          </div>

          <div className="chart-track">
            <div
              className="chart-bar"
              style={{
                width: `${(item.count / total) * 100}%`,
                backgroundColor: item.color,
              }}
            />
          </div>
        </div>
      ))}
    </section>
  );
}

export default DeploymentChart;
