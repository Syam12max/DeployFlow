
import React, { useEffect, useState } from "react";

const API_URL = "https://deployflow-ezbz.onrender.com";

function LogsPanel() {
  const [logs, setLogs] = useState([]);
  const [searchText, setSearchText] = useState("");

  const [selectedLevel, setSelectedLevel] = useState(
    () => localStorage.getItem("deployflow-log-level") || "ALL"
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Convert backend log levels into consistent frontend levels
  function normalizeLevel(level) {
    const value = String(level || "INFO").toUpperCase();

    if (value === "WARNING" || value === "WARN") return "WARN";
    if (value === "ERROR" || value === "CRITICAL") return "ERROR";
    if (value === "INFO") return "INFO";

    return value;
  }

  // Display the timestamp received from the backend
  function getLogTime(log) {
    const value = log.timestamp || log.time || log.createdAt;

    if (!value) return "Time unavailable";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleString();
  }

  useEffect(() => {
    let active = true;

    async function fetchLogs() {
      try {
        const response = await fetch(`${API_URL}/api/logs`);

        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid logs response");
        }

        if (!active) return;

        setLogs(data);
        setError("");
      } catch (err) {
        if (!active) return;

        setError("Unable to load logs. Please check the backend connection.");
        console.error("Logs API error:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchLogs();

    const intervalId = setInterval(fetchLogs, 5000);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, []);

  function handleLevelChange(event) {
    const level = event.target.value;

    setSelectedLevel(level);
    localStorage.setItem("deployflow-log-level", level);
  }

  const filteredLogs = logs.filter((log) => {
    const message = String(log.message || "").toLowerCase();
    const time = getLogTime(log).toLowerCase();
    const search = searchText.toLowerCase();
    const level = normalizeLevel(log.level);

    const matchesSearch =
      message.includes(search) || time.includes(search);

    const matchesLevel =
      selectedLevel === "ALL" || level === selectedLevel;

    return matchesSearch && matchesLevel;
  });

  function getLevelColor(level) {
    switch (normalizeLevel(level)) {
      case "ERROR":
        return "#ef4444";
      case "WARN":
        return "#f59e0b";
      case "INFO":
        return "#22c55e";
      default:
        return "#ffffff";
    }
  }

  return (
    <div className="logs-panel">
      <div className="panel-header">
        <div>
          <h2>Application Logs</h2>
          <p>Monitor application events and errors</p>
        </div>

        <span className="live-badge">LIVE API · 5 SEC</span>
      </div>

      <div className="logs-controls">
        <input
          type="text"
          placeholder="Search logs..."
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />

        <select value={selectedLevel} onChange={handleLevelChange}>
          <option value="ALL">All Levels</option>
          <option value="INFO">Info</option>
          <option value="WARN">Warning</option>
          <option value="ERROR">Error</option>
        </select>
      </div>

      <div className="logs-summary">
        <span>Total Logs: {filteredLogs.length}</span>

        <span>
          Errors:{" "}
          {filteredLogs.filter(
            (log) => normalizeLevel(log.level) === "ERROR"
          ).length}
        </span>

        <span>
          Warnings:{" "}
          {filteredLogs.filter(
            (log) => normalizeLevel(log.level) === "WARN"
          ).length}
        </span>

        <span>
          Info:{" "}
          {filteredLogs.filter(
            (log) => normalizeLevel(log.level) === "INFO"
          ).length}
        </span>
      </div>

      {loading && <p>Loading logs...</p>}

      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <div className="logs-list">
          {filteredLogs.length === 0 ? (
            <p>No matching logs found.</p>
          ) : (
            filteredLogs.map((log, index) => (
              <div
                className="log-item"
                key={log.id ?? `${log.timestamp || log.time}-${index}`}
              >
                <span className="log-time">{getLogTime(log)}</span>

                <span
                  className="log-level"
                  style={{ color: getLevelColor(log.level) }}
                >
                  {normalizeLevel(log.level)}
                </span>

                <span className="log-message">
                  {log.message || "No message available"}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default LogsPanel;
