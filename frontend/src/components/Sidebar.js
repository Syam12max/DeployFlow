import React from "react";

function Sidebar({ activePage, setActivePage }) {
  const menuItems = [
    "Dashboard",
    "CI/CD Pipelines",
    "Deployments",
    "Monitoring",
    "Logs",
    "Alerts",
  ];

  const icons = {
    Dashboard: "▦",
    "CI/CD Pipelines": "⑂",
    Deployments: "↗",
    Monitoring: "◉",
    Logs: "≡",
    Alerts: "⚑",
  };

  return (
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
           onClick={() => {
  localStorage.setItem("deployflow-active-page", item);
  setActivePage(item);
}}
          >
            <span>{icons[item]}</span>
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
  );
}

export default Sidebar;