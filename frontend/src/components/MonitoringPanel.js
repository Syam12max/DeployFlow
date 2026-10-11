
import React, { useEffect, useState } from "react";

const API_URL = "https://deployflow-ezbz.onrender.com";

function MonitoringPanel() {
  const [health, setHealth] = useState("Checking...");
  const [cpuUsage, setCpuUsage] = useState(null);
  const [memoryUsage, setMemoryUsage] = useState(null);
  const [diskUsage, setDiskUsage] = useState(null);
  const [uptime, setUptime] = useState(null);
  const [backendMessage, setBackendMessage] = useState(
    "Connecting to backend..."
  );
  const [lastUpdated, setLastUpdated] = useState("");
  const [metricsError, setMetricsError] = useState(false);

  useEffect(() => {
    let active = true;

    async function fetchMonitoringData() {
      try {
        const response = await fetch(`${API_URL}/api/metrics`);

        if (!response.ok) {
          throw new Error("Metrics request failed");
        }

        const data = await response.json();

        if (!active) return;

        setCpuUsage(data.cpu ?? null);
        setMemoryUsage(data.memory ?? null);
        setDiskUsage(data.disk ?? null);
        setUptime(data.uptime ?? null);

        setBackendMessage("Live metrics connected");
        setLastUpdated(new Date().toLocaleTimeString());
        setMetricsError(false);
      } catch (error) {
        if (!active) return;

        setBackendMessage("Unable to fetch CPU and RAM metrics");
        setMetricsError(true);
        console.error("Monitoring metrics error:", error);
      }
    }

    async function checkBackendHealth() {
      try {
        const response = await fetch(`${API_URL}/api/health`);
        const data = await response.json();

        if (!active) return;

        setHealth(
          response.ok && data.status === "OK"
            ? "Healthy"
            : "Degraded"
        );
      } catch {
        if (active) {
          setHealth("Down");
        }
      }
    }

    fetchMonitoringData();
    checkBackendHealth();

    const metricsTimer = setInterval(fetchMonitoringData, 5000);
    const healthTimer = setInterval(checkBackendHealth, 5000);

    return () => {
      active = false;
      clearInterval(metricsTimer);
      clearInterval(healthTimer);
    };
  }, []);

  const cpu = Number(cpuUsage) || 0;
  const memory = Number(memoryUsage) || 0;
  const disk = Number(diskUsage) || 0;

  const getHealthClass = () => {
    if (health === "Healthy") return "healthy";
    if (health === "Degraded") return "degraded";
    if (health === "Down") return "down";
    return "unknown";
  };

  const getUsageClass = (value) => {
    if (value >= 85) return "usage-high";
    if (value >= 65) return "usage-medium";
    return "usage-normal";
  };

  return (
    <section className="monitoring-dashboard">
      <div className="monitoring-top">
        <div>
          <span className="monitoring-eyebrow">
            INFRASTRUCTURE OVERVIEW
          </span>
          <h2>System Monitoring</h2>
          <p>Real-time performance and backend health</p>
        </div>

        <div
          className={`monitoring-connection ${
            metricsError ? "connection-error" : ""
          }`}
        >
          <span className="monitoring-live-dot"></span>
          {metricsError
            ? "Connection issue"
            : "Auto refresh · 5 sec"}
        </div>
      </div>

      <div className="monitoring-health-card">
        <div className="monitoring-health-icon">⌁</div>

        <div className="monitoring-health-text">
          <span>Backend Service</span>
          <strong>{health}</strong>
          <p>
            {health === "Healthy"
              ? "Your backend health endpoint is responding."
              : health === "Degraded"
              ? "The health endpoint returned an unexpected status."
              : health === "Down"
              ? "Unable to reach the backend health endpoint."
              : "Checking backend availability..."}
          </p>
        </div>

        <span
          className={`monitoring-status-pill ${getHealthClass()}`}
        >
          <span className="monitoring-status-dot"></span>
          {health}
        </span>
      </div>

      <div className="monitoring-metrics-grid">
        {/* CPU CARD */}
        <div className="monitoring-metric-card">
          <div className="monitoring-card-heading">
            <div className="monitoring-metric-icon cpu-icon">
              CPU
            </div>
            <span className="monitoring-card-label">
              Processor
            </span>
          </div>

          <div className="monitoring-value-row">
            <strong className="monitoring-value">
              {cpuUsage === null ? "--" : `${cpu.toFixed(1)}%`}
            </strong>
            <span className="monitoring-unit">Usage</span>
          </div>

          <div className="monitoring-progress-track">
            <div
              className={`monitoring-progress-fill cpu-progress ${getUsageClass(
                cpu
              )}`}
              style={{
                width: `${Math.min(100, Math.max(0, cpu))}%`,
              }}
            ></div>
          </div>

          <div className="monitoring-card-footer">
            <span>Current utilization</span>
            <span>
              {cpu >= 85
                ? "High"
                : cpu >= 65
                ? "Moderate"
                : "Normal"}
            </span>
          </div>
        </div>

        {/* RAM CARD */}
        <div className="monitoring-metric-card">
          <div className="monitoring-card-heading">
            <div className="monitoring-metric-icon ram-icon">
              RAM
            </div>
            <span className="monitoring-card-label">
              Memory
            </span>
          </div>

          <div className="monitoring-value-row">
            <strong className="monitoring-value">
              {memoryUsage === null
                ? "--"
                : `${memory.toFixed(1)}%`}
            </strong>
            <span className="monitoring-unit">Used</span>
          </div>

          <div className="monitoring-progress-track">
            <div
              className={`monitoring-progress-fill ram-progress ${getUsageClass(
                memory
              )}`}
              style={{
                width: `${Math.min(100, Math.max(0, memory))}%`,
              }}
            ></div>
          </div>

          <div className="monitoring-card-footer">
            <span>
              Disk: {diskUsage === null ? "--" : `${disk.toFixed(1)}%`}
            </span>
            <span>
              {uptime === null
                ? "Uptime: --"
                : `Uptime: ${Math.floor(uptime / 3600)}h ${Math.floor(
                    (uptime % 3600) / 60
                  )}m`}
            </span>
          </div>
        </div>
      </div>

      <div className="monitoring-footer">
        <div>
          <span className="monitoring-footer-icon">↻</span>
          <span>
            <strong>Monitoring status</strong>
            <small>{backendMessage}</small>
          </span>
        </div>

        <div className="monitoring-updated">
          <span>Last updated</span>
          <strong>
            {lastUpdated || "Waiting for metrics..."}
          </strong>
        </div>
      </div>
    </section>
  );
}

export default MonitoringPanel;
