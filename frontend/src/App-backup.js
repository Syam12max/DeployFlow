
import React, { useState } from "react";
import "./App.css";

function App() {
  const [activePage, setActivePage] = useState("Dashboard");

  const menuItems = [
    "Dashboard",
    "CI/CD Pipelines",
    "Deployments",
    "Monitoring",
    "Logs",
    "Alerts",
  ];

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">D</div>
          <div>
            <h2>DeployFlow</h2>
            <p>DEVOPS PLATFORM</p>
          </div>
        </div>

        <p className="menu-title">MAIN MENU</p>

        <nav>
          {menuItems.map((item) => (
            <button
              key={item}
              className={`menu-item ${
                activePage === item ? "active" : ""
              }`}
              onClick={() => setActivePage(item)}
            >
              <span>{getIcon(item)}</span>
              {item}
            </button>
          ))}
        </nav>

        <div className="system-status">
          <span className="green-dot"></span>
          <div>
            <strong>System Status</strong>
            <p>Dashboard is running</p>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="breadcrumb">Workspace / Overview</p>
            <h1>{activePage}</h1>
          </div>

          <div className="user-profile">
            <div className="user-avatar">D</div>
            <div>
              <strong>Developer</strong>
              <p>Administrator</p>
            </div>
          </div>
        </header>

        <section className="welcome">
          <div>
            <span className="eyebrow">DEVOPS CONTROL CENTER</span>
            <h2>Welcome to DeployFlow 👋</h2>
            <p>
              Manage deployments, pipelines and application health in one place.
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
            value="128"
            detail="Demo statistics"
            icon="↗"
            color="purple"
          />
          <StatCard
            title="Build Success Rate"
            value="96.8%"
            detail="Demo statistics"
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
            value="03"
            detail="Sample alerts"
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

            <Pipeline
              name="Frontend Production Build"
              branch="main · a83f21c"
              status="Success"
            />
            <Pipeline
              name="API Integration Tests"
              branch="develop · b72e19a"
              status="Running"
            />
            <Pipeline
              name="Staging Deployment"
              branch="staging · c19d54b"
              status="Success"
            />
            <Pipeline
              name="Dependency Audit"
              branch="feature/update · d52a91f"
              status="Failed"
            />
          </div>

          <div className="panel">
            <div className="panel-heading">
              <div>
                <h3>Application Health</h3>
                <p>Illustrative service overview</p>
              </div>
              <span className="tag">DEMO</span>
            </div>

            <div className="health-circle">
              <div>
                <strong>99.9%</strong>
                <p>Sample uptime</p>
              </div>
            </div>

            <Service name="Frontend App" status="Sample status" />
            <Service name="Backend API" status="Not connected" />
            <Service name="Supabase DB" status="Not connected" />
          </div>
        </section>

        <section className="panel deployments">
          <div className="panel-heading">
            <div>
              <h3>Recent Deployments</h3>
              <p>Example deployment records</p>
            </div>
            <button
              className="text-button"
              onClick={() => setActivePage("Deployments")}
            >
              View all →
            </button>
          </div>

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>APPLICATION</th>
                  <th>ENVIRONMENT</th>
                  <th>COMMIT</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Frontend Web App</td>
                  <td>Production</td>
                  <td><code>a83f21c</code></td>
                  <td><span className="status success">Success</span></td>
                </tr>
                <tr>
                  <td>Backend API</td>
                  <td>Staging</td>
                  <td><code>b72e19a</code></td>
                  <td><span className="status running">Running</span></td>
                </tr>
                <tr>
                  <td>Monitoring Service</td>
                  <td>Production</td>
                  <td><code>c19d54b</code></td>
                  <td><span className="status failed">Failed</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <footer>
          DeployFlow © 2026
          <span>Automated Deployment &amp; Application Monitoring</span>
        </footer>
      </main>
    </div>
  );
}

function getIcon(item) {
  const icons = {
    Dashboard: "▦",
    "CI/CD Pipelines": "⑂",
    Deployments: "↗",
    Monitoring: "◉",
    Logs: "≡",
    Alerts: "⚑",
  };

  return icons[item] || "•";
}

function StatCard({ title, value, detail, icon, color }) {
  return (
    <div className="stat-card">
      <div className="stat-heading">
        <span>{title}</span>
        <span className={`stat-icon ${color}`}>{icon}</span>
      </div>
      <h2>{value}</h2>
      <p>{detail}</p>
    </div>
  );
}

function Pipeline({ name, branch, status }) {
  return (
    <div className="pipeline-row">
      <div className="pipeline-info">
        <strong>{name}</strong>
        <p>{branch}</p>
      </div>
      <span className={`status ${status.toLowerCase()}`}>{status}</span>
    </div>
  );
}

function Service({ name, status }) {
  return (
    <div className="service-row">
      <span>
        <span className="green-dot"></span>
        {name}
      </span>
      <small>{status}</small>
    </div>
  );
}

export default App;
