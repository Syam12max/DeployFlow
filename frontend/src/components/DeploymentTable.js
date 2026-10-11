
import React, { useEffect, useState } from "react";

const API_URL = "https://deployflow-ezbz.onrender.com";

function DeploymentTable({ deployments = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [localDeployments, setLocalDeployments] = useState(deployments);
  const [pendingStatuses, setPendingStatuses] = useState({});
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    setLocalDeployments(deployments);
  }, [deployments]);

  const filteredDeployments = localDeployments.filter((deployment) => {
    const matchesSearch = (deployment.application || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase().trim());

    const matchesStatus =
      statusFilter === "All" || deployment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  async function updateDeploymentStatus(deployment) {
    const newStatus =
      pendingStatuses[deployment.id] ?? deployment.status;

    if (newStatus === deployment.status) {
      alert("Please select a different status first.");
      return;
    }

    setUpdatingId(deployment.id);

    try {
      const response = await fetch(
        `${API_URL}/api/deployments/${encodeURIComponent(
          deployment.id
        )}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Status update failed");
      }

      const savedStatus = result.deployment?.status;

      if (!savedStatus) {
        throw new Error("Updated status was not returned by the server");
      }

      setLocalDeployments((previous) =>
        previous.map((item) =>
          String(item.id) === String(deployment.id)
            ? { ...item, status: savedStatus }
            : item
        )
      );

      setPendingStatuses((previous) => {
        const updated = { ...previous };
        delete updated[deployment.id];
        return updated;
      });

      alert("Deployment status updated successfully!");
    } catch (error) {
      console.error("Deployment status update error:", error);
      alert(`Could not update status: ${error.message}`);
    } finally {
      setUpdatingId(null);
    }
  }

  function getStatusClass(status) {
    switch (status) {
      case "Success":
        return "success";
      case "Failed":
        return "failed";
      case "Running":
        return "running";
      default:
        return "unknown";
    }
  }

  return (
    <div className="deployment-table-container">
      <div className="deployment-heading">
        <div>
          <span className="deployment-eyebrow">RELEASE MANAGEMENT</span>
          <h3>Recent Deployments</h3>
          <p>Monitor releases and manage deployment status.</p>
        </div>

        <div className="deployment-total">
          <span>Total Deployments</span>
          <strong>{localDeployments.length}</strong>
        </div>
      </div>

      <div className="deployment-toolbar">
        <div className="deployment-search">
          <span aria-hidden="true">⌕</span>

          <input
            type="text"
            placeholder="Search applications..."
            aria-label="Search applications"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {searchTerm && (
            <button
              type="button"
              className="deployment-clear-search"
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <div className="deployment-status-filter">
          <label htmlFor="deployment-status-filter">Status</label>

          <select
            id="deployment-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Success">Success</option>
            <option value="Running">Running</option>
            <option value="Failed">Failed</option>
          </select>
        </div>

        <span className="deployment-result-count">
          Showing {filteredDeployments.length} of {localDeployments.length}
        </span>
      </div>

      {filteredDeployments.length === 0 ? (
        <div className="deployment-empty-state">
          <span className="deployment-empty-icon" aria-hidden="true">
            ⌕
          </span>

          <h4>No deployments found</h4>
          <p>Try changing your search term or status filter.</p>

          {(searchTerm || statusFilter !== "All") && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("All");
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="table-scroll deployment-table-scroll">
          <table className="deployment-table">
            <thead>
              <tr>
                <th>APPLICATION</th>
                <th>ENVIRONMENT</th>
                <th>VERSION</th>
                <th>STATUS</th>
                <th>UPDATE STATUS</th>
                <th>DATE</th>
              </tr>
            </thead>

            <tbody>
              {filteredDeployments.map((deployment) => (
                <tr key={deployment.id}>
                  <td>
                    <div className="deployment-app-cell">
                      <span
                        className="deployment-app-icon"
                        aria-hidden="true"
                      >
                        ◈
                      </span>

                      <span>
                        {deployment.application || "Unnamed application"}
                      </span>
                    </div>
                  </td>

                  <td>
                    <span className="deployment-environment">
                      {deployment.environment || "N/A"}
                    </span>
                  </td>

                  <td>
                    <code className="deployment-version">
                      {deployment.version || "N/A"}
                    </code>
                  </td>

                  <td>
                    <span
                      className={`deployment-status ${getStatusClass(
                        deployment.status
                      )}`}
                    >
                      <span className="deployment-status-dot" />
                      {deployment.status || "Unknown"}
                    </span>
                  </td>

                  <td>
                    <div className="deployment-update-controls">
                      <select
                        aria-label={`Select new status for ${
                          deployment.application || "deployment"
                        }`}
                        value={
                          pendingStatuses[deployment.id] ??
                          deployment.status ??
                          "Running"
                        }
                        onChange={(e) =>
                          setPendingStatuses((previous) => ({
                            ...previous,
                            [deployment.id]: e.target.value,
                          }))
                        }
                        disabled={updatingId === deployment.id}
                      >
                        <option value="Success">Success</option>
                        <option value="Running">Running</option>
                        <option value="Failed">Failed</option>
                      </select>

                      <button
                        type="button"
                        className="deployment-update-button"
                        onClick={() => updateDeploymentStatus(deployment)}
                        disabled={updatingId === deployment.id}
                      >
                        {updatingId === deployment.id
                          ? "Updating..."
                          : "Update"}
                      </button>
                    </div>
                  </td>

                  <td>
                    <span className="deployment-date">
                      {deployment.date || "Not available"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default DeploymentTable;
