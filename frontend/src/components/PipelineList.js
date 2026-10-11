import React from "react";

function PipelineList({ pipelines = [] }) {
  const successCount = pipelines.filter(
    (pipeline) => pipeline.status === "Success"
  ).length;

  const runningCount = pipelines.filter(
    (pipeline) => pipeline.status === "Running"
  ).length;

  const failedCount = pipelines.filter(
    (pipeline) => pipeline.status === "Failed"
  ).length;

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
    <div className="pipeline-list">
      <div className="pipeline-heading">
        <div>
          <span className="pipeline-eyebrow">
            AUTOMATION WORKFLOWS
          </span>
          <h3>CI/CD Pipelines</h3>
          <p>Track builds, tests, and deployment workflows.</p>
        </div>

        <div className="pipeline-total">
          <span>Total Pipelines</span>
          <strong>{pipelines.length}</strong>
        </div>
      </div>

      <div className="pipeline-summary">
        <div className="pipeline-summary-card">
          <span className="pipeline-summary-icon success-icon">✓</span>
          <div>
            <span>Successful</span>
            <strong>{successCount}</strong>
          </div>
        </div>

        <div className="pipeline-summary-card">
          <span className="pipeline-summary-icon running-icon">↻</span>
          <div>
            <span>Running</span>
            <strong>{runningCount}</strong>
          </div>
        </div>

        <div className="pipeline-summary-card">
          <span className="pipeline-summary-icon failed-icon">!</span>
          <div>
            <span>Failed</span>
            <strong>{failedCount}</strong>
          </div>
        </div>
      </div>

      {pipelines.length === 0 ? (
        <div className="pipeline-empty-state">
          <span className="pipeline-empty-icon">⌁</span>
          <h4>No pipeline data available</h4>
          <p>Pipeline workflows will appear here when data is available.</p>
        </div>
      ) : (
        <div className="pipeline-items">
          {pipelines.map((pipeline) => (
            <div className="pipeline-item" key={pipeline.id}>
              <div className="pipeline-item-icon">⌘</div>

              <div className="pipeline-info">
                <strong>{pipeline.name || "Unnamed Pipeline"}</strong>

                <div className="pipeline-meta">
                  <span className="pipeline-branch">
                    <span aria-hidden="true">⑂</span>
                    {pipeline.branch || "main"}
                  </span>

                  {pipeline.commit && (
                    <span className="pipeline-commit">
                      Commit: {pipeline.commit}
                    </span>
                  )}
                </div>
              </div>

              <div className="pipeline-item-right">
                <span
                  className={`pipeline-status ${getStatusClass(
                    pipeline.status
                  )}`}
                >
                  <span className="pipeline-status-dot" />
                  {pipeline.status || "Unknown"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pipeline-footer">
        <span className="pipeline-footer-dot" />
        <span>Pipeline overview</span>
        <span className="pipeline-footer-count">
          {pipelines.length} workflow{pipelines.length === 1 ? "" : "s"}
        </span>
      </div>
    </div>
  );
}

export default PipelineList;