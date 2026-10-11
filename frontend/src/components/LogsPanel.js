
import React, { useEffect, useState } from "react";

const API_URL = "https://deployflow-ezbz.onrender.com";

function LogsPanel() {
  const [logs, setLogs] = useState([]);
  const [searchText, setSearchText] = useState("");

  const [selectedLevel, setSelectedLevel] = useState(() => {
    return localStorage.getItem("deployflow-log-level") || "ALL";
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch logs and refresh every 5 seconds
  useEffect(() => {
    let active = true;

    async function fetchLogs() {
      try {
        const response = await fetch(`${API_URL}/api/logs`);

        if (!response.ok) {
          throw new Error("Failed to fetch logs");
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

        setError(
          "Unable to load logs. Check the backend connection."
        );
        console.error("Logs API error:", err);
      } finally {
        if (active) {
          setLoading(false);
        }
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
    const message = (log.message || "").toLowerCase();
    const time = String(log.time || "");
    const search = searchText.toLowerCase();

    const matchesSearch =
      message.toLowerCase().includes(search) ||
      time.toLowerCase().includes(search);

    const matchesLevel =
      selectedLevel === "ALL" || log.level === selectedLevel;

    return matchesSearch && matchesLevel;
  });

  const getLevelColor = (level) => {
    switch (level) {
      case "ERROR":
        return "#ef4444";
      case "WARN":
        return "#f59e0b";
      case "INFO":
        return "#22c55e";
      default:
        return "#ffffff";
    }
  };

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
          onChange={(e) => setSearchText(e.target.value)}
        />

        <select
          value={selectedLevel}
          onChange={handleLevelChange}
        >
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
          {filteredLogs.filter((log) => log.level === "ERROR").length}
        </span>

        <span>
          Warnings:{" "}
          {filteredLogs.filter((log) => log.level === "WARN").length}
        </span>

        <span>
          Info:{" "}
          {filteredLogs.filter((log) => log.level === "INFO").length}
        </span>
      </div>

      {loading && <p>Loading logs...</p>}

      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <div className="logs-list">
          {filteredLogs.length === 0 ? (
            <p>No matching logs found.</p>
          ) : (
            filteredLogs.map((log) => (
              <div className="log-item" key={log.id}>
                <span className="log-time">{log.time}</span>

                <span
                  className="log-level"
                  style={{ color: getLevelColor(log.level) }}
                >
                  {log.level}
                </span>

                <span className="log-message">{log.message}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default LogsPanel;
