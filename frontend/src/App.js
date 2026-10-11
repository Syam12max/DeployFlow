
import React, { useEffect, useState } from "react";
import "./App.css";

import Sidebar from "./components/Sidebar";
import StatCard from "./components/StatCard";
import PipelineList from "./components/PipelineList";
import DeploymentTable from "./components/DeploymentTable";
import MonitoringPanel from "./components/MonitoringPanel";
import LogsPanel from "./components/LogsPanel";
import AlertsPanel from "./components/AlertsPanel";
import DeploymentChart from "./components/DeploymentChart";

function App() {
  const [activePage, setActivePage] = useState(
    localStorage.getItem("deployflow-active-page") || "Dashboard"
  );

  const [deployments, setDeployments] = useState([]);
  
const [lastUpdated, setLastUpdated] = useState("");

  const [alerts, setAlerts] = useState([]);

  // Fetch deployment data from backend
  
useEffect(() => {
  const fetchDeployments = () => {
    fetch("http://localhost:5000/api/deployments")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch deployments");
        }
        return response.json();
      })
      
.then((data) => {
  setDeployments(data);
  setLastUpdated(new Date().toLocaleTimeString());
})

      .catch((error) => {
        console.error("Deployments API error:", error);
      });
  };

  // First time immediately fetch chesthundhi
  fetchDeployments();

  // Prathi 5 seconds ki refresh avuthundhi
  const intervalId = setInterval(fetchDeployments, 5000);

  // Component close ayinappudu timer cleanup
  return () => clearInterval(intervalId);
}, []);


  // Fetch alerts from backend
  useEffect(() => {
    fetch("http://localhost:5000/api/alerts")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch alerts");
        }
        return response.json();
      })
      .then((data) => {
        setAlerts(data);
      })
      .catch((error) => {
        console.error("Alerts API error:", error);
      });
  }, []);

  const pipelines = [
    {
      name: "Frontend Production Build",
      branch: "main · a83f21c",
      status: "Success",
    },
    {
      name: "API Integration Tests",
      branch: "develop · b72e19a",
      status: "Running",
    },
    {
      name: "Staging Deployment",
      branch: "staging · c19d54b",
      status: "Success",
    },
    {
      name: "Dependency Audit",
      branch: "feature/update · d52a91f",
      status: "Failed",
    },
  ];

  // Calculate dashboard statistics
  const totalDeployments = deployments.length;

  const successfulDeployments = deployments.filter(
    (deployment) => deployment.status === "Success"
  ).length;

  const successRate =
    totalDeployments === 0
      ? 0
      : ((successfulDeployments / totalDeployments) * 100).toFixed(1);

  const activeAlerts = alerts.filter(
    (alert) => alert.resolved !== true
  ).length;

  const renderPage = () => {
    switch (activePage) {
      case "CI/CD Pipelines":
        return (
          <section className="panel">
            <div className="panel-heading">
              <div>
                <h3>CI/CD Pipelines</h3>
                <p>Latest workflow activity (sample data)</p>
              </div>
              <span className="tag">DEMO</span>
            </div>

            <PipelineList pipelines={pipelines} />
          </section>
        );

      case "Deployments":
        return <DeploymentTable deployments={deployments} />;

      case "Monitoring":
        return <MonitoringPanel />;

      case "Logs":
        return <LogsPanel />;

      case "Alerts":
        return <AlertsPanel />;

      default:
        return (
          <>
            <section className="welcome">
              <div>
                <span className="eyebrow">
                  DEVOPS CONTROL CENTER
                </span>
                <h2>Welcome to DeployFlow 👋</h2>
                <p>
                  Manage deployments, pipelines and application health
                  in one place.
                </p>
              </div>

              <button
                className="primary-button"
                onClick={() => setActivePage("Deployments")}
              >
                View Deployments →
              </button>
            </section>

            <section className="stats-grid">
              <StatCard
                title="Total Deployments"
                value={totalDeployments}
                detail="Records from backend API"
                icon="↗"
                color="purple"
              />

              <StatCard
                title="Build Success Rate"
                value={`${successRate}%`}
                detail={`${successfulDeployments} successful deployments`}
                icon="✓"
                color="green"
              />

              <StatCard
                title="Response Time"
                value="142 ms"
                detail="Sample measurement"
                icon="◷"
                color="blue"
              />

              <StatCard
                title="Active Alerts"
                value={activeAlerts}
                detail="Unresolved alerts from API"
                icon="!"
                color="orange"
              />
            </section>

            <section className="content-grid">
              <div className="panel">
                <div className="panel-heading">
                  <div>
                    <h3>Recent Pipelines</h3>
                    <p>Latest workflow activity (sample data)</p>
                  </div>
                  <span className="tag">DEMO</span>
                </div>

                <PipelineList pipelines={pipelines} />
              </div>

              <MonitoringPanel />
            </section>
            <DeploymentChart deployments={deployments} />
            <DeploymentTable
              deployments={deployments}
              onViewAll={() => setActivePage("Deployments")}
            />
          </>
        );
    }
  };

  return (
    <div className="app-layout">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="breadcrumb">Workspace / Overview</p>
            <h1>{activePage}</h1>
            
{activePage === "Dashboard" && (
  <p className="last-updated">
    🕒 Last updated: {lastUpdated || "Loading..."}
  </p>
)}

          </div>

          <div className="user-profile">
            <div className="user-avatar">D</div>
            <div>
              <strong>Developer</strong>
              <p>Administrator</p>
            </div>
          </div>
        </header>

        {renderPage()}

        <footer>
          DeployFlow © 2026
          <span>
            Automated Deployment &amp; Application Monitoring
          </span>
        </footer>
      </main>
    </div>
  );
}

export default App;
