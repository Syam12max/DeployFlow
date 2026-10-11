
import React, { useEffect, useState } from "react";

function AlertsPanel() {
  const [alerts, setAlerts] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("Active");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const response = await fetch(
          "http://localhost:5000/api/alerts"
        );

        if (!response.ok) {
          throw new Error("Failed to load alerts");
        }

        const data = await response.json();
        setAlerts(data);
        setError("");
      } catch (err) {
        setError("Backend connection failed. Please check the server.");
      } finally {
        setLoading(false);
      }
    }

    fetchAlerts();
  }, []);

  const activeAlerts = alerts.filter(
    (alert) => alert.resolved !== true
  );

  const resolvedAlerts = alerts.filter(
    (alert) => alert.resolved === true
  );

  const filteredAlerts = alerts.filter((alert) => {
    const title = (alert.title || "").toLowerCase();
    const message = (alert.message || "").toLowerCase();

    const matchesSearch =
      title.includes(searchText.toLowerCase()) ||
      message.includes(searchText.toLowerCase());

    const matchesSeverity =
      selectedSeverity === "All" ||
      alert.severity === selectedSeverity;

    const matchesStatus =
      selectedStatus === "All" ||
      (selectedStatus === "Active" && alert.resolved !== true) ||
      (selectedStatus === "Resolved" && alert.resolved === true);

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  async function resolveAlert(id) {
    try {
      const response = await fetch(
        `http://localhost:5000/api/alerts/${encodeURIComponent(id)}/resolve`,
        { method: "PATCH" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to resolve alert");
      }

      setAlerts((previousAlerts) =>
        previousAlerts.map((alert) =>
          String(alert.id) === String(id)
            ? { ...alert, resolved: true }
            : alert
        )
      );

      setError("");
    } catch (err) {
      setError(err.message || "Failed to resolve alert.");
    }
  }

  return (
    <section className="alerts-panel">
      <div className="alerts-heading">
        <div>
          <h3>System Alerts</h3>
          <p>Monitor and manage application alerts</p>
        </div>
        <span className="tag">LIVE</span>
      </div>

      <div className="alerts-summary">
        <div className="alert-summary-card">
          <span>Active Alerts</span>
          <strong>{activeAlerts.length}</strong>
        </div>

        <div className="alert-summary-card">
          <span>Critical</span>
          <strong>
            {activeAlerts.filter(
              (alert) => alert.severity === "Critical"
            ).length}
          </strong>
        </div>

        <div className="alert-summary-card">
          <span>Warnings</span>
          <strong>
            {activeAlerts.filter(
              (alert) => alert.severity === "Warning"
            ).length}
          </strong>
        </div>
      </div>

      <div className="alerts-controls">
        <input
          className="alerts-search"
          type="text"
          placeholder="Search alerts..."
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />

        <select
          className="alerts-filter"
          value={selectedSeverity}
          onChange={(event) => setSelectedSeverity(event.target.value)}
        >
          <option value="All">All Severities</option>
          <option value="Critical">Critical</option>
          <option value="Warning">Warning</option>
          <option value="Info">Info</option>
        </select>

        <select
          className="alerts-filter"
          value={selectedStatus}
          onChange={(event) => setSelectedStatus(event.target.value)}
        >
          <option value="Active">Active Alerts</option>
          <option value="Resolved">Resolved Alerts</option>
          <option value="All">All Alerts</option>
        </select>
      </div>

      {error && (
        <p role="alert" className="alerts-empty">{error}</p>
      )}

      {loading ? (
        <p className="alerts-empty">Loading alerts...</p>
      ) : !error && filteredAlerts.length === 0 ? (
        <p className="alerts-empty">
          No matching {selectedStatus.toLowerCase()} alerts found.
        </p>
      ) : (
        <>
          <p className="alerts-count">
            Showing {filteredAlerts.length} alert(s)
          </p>

          <div className="alerts-list">
            {filteredAlerts.map((alert) => {
              const severity = alert.severity || "Info";
              const severityClass = severity.toLowerCase();

              return (
                <div
                  className={`alert-item ${severityClass}`}
                  key={alert.id}
                >
                  <span className="alert-icon">
                    {severity === "Critical"
                      ? "🚨"
                      : severity === "Warning"
                      ? "⚠️"
                      : "ℹ️"}
                  </span>

                  <div className="alert-content">
                    <strong>{alert.title || "System Alert"}</strong>
                    <p>{alert.message || "No details available."}</p>
                    <small>
                      {alert.resolved ? "Resolved" : "Active"}
                    </small>
                  </div>

                  <span className="alert-severity">{severity}</span>

                  {!alert.resolved && (
                    <button
                      className="resolve-button"
                      onClick={() => resolveAlert(alert.id)}
                    >
                      Resolve
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}

export default AlertsPanel;
