
const http = require("http");
const fs = require("fs");
const path = require("path");
const si = require("systeminformation");

const PORT = 5000;

const alertsFile = path.join(__dirname, "alerts.json");
const deploymentsFile = path.join(__dirname, "deployments.json");

// Default deployment data
const defaultDeployments = [
  {
    id: "1",
    application: "DeployFlow Frontend",
    environment: "Development",
    version: "v1.0.0",
    status: "Success",
    date: "2026-10-10",
  },
  {
    id: "2",
    application: "DeployFlow Backend",
    environment: "Testing",
    version: "v1.0.1",
    status: "Running",
    date: "2026-10-10",
  },
  {
    id: "3",
    application: "Payment Service",
    environment: "Production",
    version: "v1.2.0",
    status: "Failed",
    date: "2026-10-09",
  },
];

if (!fs.existsSync(deploymentsFile)) {
  fs.writeFileSync(
    deploymentsFile,
    JSON.stringify(defaultDeployments, null, 2)
  );
}

function readDeployments() {
  return JSON.parse(fs.readFileSync(deploymentsFile, "utf8"));
}

// Default alert data
const defaultAlerts = [
  {
    id: "1",
    title: "Database Connection Failed",
    message: "Unable to connect to the database.",
    severity: "Critical",
    resolved: false,
  },
  {
    id: "2",
    title: "API Response Time",
    message: "API response time is higher than expected.",
    severity: "Warning",
    resolved: false,
  },
  {
    id: "3",
    title: "Deployment Completed",
    message: "Application deployed successfully.",
    severity: "Info",
    resolved: false,
  },
  {
    id: "4",
    title: "Memory Usage High",
    message: "Memory usage is above the recommended level.",
    severity: "Warning",
    resolved: false,
  },
];

if (!fs.existsSync(alertsFile)) {
  fs.writeFileSync(
    alertsFile,
    JSON.stringify(defaultAlerts, null, 2)
  );
}

function readAlerts() {
  return JSON.parse(fs.readFileSync(alertsFile, "utf8"));
}

// Send JSON response
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode);
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(
    req.url,
    `http://${req.headers.host || "localhost"}`
  );

  // Common response headers
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, PATCH, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  // Handle browser preflight requests
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. Backend health check
  
  if (req.method === "GET" && url.pathname === "/api/health") {
    sendJson(res, 200, {
      status: "OK",
      message: "DeployFlow backend is running!",
    });
    return;
  }

  // Real CPU and RAM metrics
  if (req.method === "GET" && url.pathname === "/api/metrics") {
    try {
      const [cpu, memory] = await Promise.all([
        si.currentLoad(),
        si.mem(),
      ]);

      const memoryUsed = memory.total - memory.available;

      const memoryUsage =
        memory.total > 0
          ? (memoryUsed / memory.total) * 100
          : 0;

      sendJson(res, 200, {
        cpuUsage: Number(cpu.currentLoad.toFixed(1)),
        memoryUsage: Number(memoryUsage.toFixed(1)),
        memoryUsedGB: Number(
          (memoryUsed / 1024 ** 3).toFixed(2)
        ),
        memoryTotalGB: Number(
          (memory.total / 1024 ** 3).toFixed(2)
        ),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Metrics error:", error);

      sendJson(res, 500, {
        message: "Unable to collect system metrics",
      });
    }

    return;
  }


  // 2. REAL CPU and RAM measurements
  if (req.method === "GET" && url.pathname === "/api/metrics") {
    try {
      const [cpu, memory] = await Promise.all([
        si.currentLoad(),
        si.mem(),
      ]);

      const memoryUsed = memory.total - memory.available;

      const memoryUsage =
        memory.total > 0
          ? (memoryUsed / memory.total) * 100
          : 0;

      sendJson(res, 200, {
        cpuUsage: Number(cpu.currentLoad.toFixed(1)),
        memoryUsage: Number(memoryUsage.toFixed(1)),
        memoryUsedGB: Number(
          (memoryUsed / 1024 ** 3).toFixed(2)
        ),
        memoryTotalGB: Number(
          (memory.total / 1024 ** 3).toFixed(2)
        ),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Metrics error:", error);

      sendJson(res, 500, {
        message: "Unable to collect system metrics",
      });
    }

    return;
  }

  // 3. Application logs
  if (req.method === "GET" && url.pathname === "/api/logs") {
    const logs = [
      {
        id: 1,
        time: "10:30:12",
        level: "INFO",
        message: "Frontend application started successfully",
      },
      {
        id: 2,
        time: "10:31:05",
        level: "WARN",
        message: "API response time is higher than expected",
      },
      {
        id: 3,
        time: "10:32:18",
        level: "ERROR",
        message: "Database connection failed",
      },
      {
        id: 4,
        time: "10:33:42",
        level: "INFO",
        message: "Deployment completed successfully",
      },
      {
        id: 5,
        time: "10:34:10",
        level: "ERROR",
        message: "Health check returned an error",
      },
      {
        id: 6,
        time: "10:35:20",
        level: "WARN",
        message: "Memory usage is above the warning threshold",
      },
    ];

    sendJson(res, 200, logs);
    return;
  }

  // 4. Get alerts
  if (req.method === "GET" && url.pathname === "/api/alerts") {
    sendJson(res, 200, readAlerts());
    return;
  }

  // 5. Get deployments
  if (
    req.method === "GET" &&
    url.pathname === "/api/deployments"
  ) {
    sendJson(res, 200, readDeployments());
    return;
  }

  // 6. Update deployment status
  const deploymentMatch = url.pathname.match(
    /^\/api\/deployments\/([^/]+)\/status$/
  );

  if (req.method === "PATCH" && deploymentMatch) {
    const deploymentId = decodeURIComponent(deploymentMatch[1]);
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      let data;

      try {
        data = JSON.parse(body);
      } catch {
        sendJson(res, 400, {
          message: "Invalid JSON body",
        });
        return;
      }

      const allowedStatuses = ["Success", "Running", "Failed"];

      if (!allowedStatuses.includes(data.status)) {
        sendJson(res, 400, {
          message: "Invalid deployment status",
        });
        return;
      }

      const deployments = readDeployments();

      const deployment = deployments.find(
        (item) => String(item.id) === deploymentId
      );

      if (!deployment) {
        sendJson(res, 404, {
          message: "Deployment not found",
        });
        return;
      }

      deployment.status = data.status;

      fs.writeFileSync(
        deploymentsFile,
        JSON.stringify(deployments, null, 2)
      );

      sendJson(res, 200, {
        message: "Deployment status updated successfully",
        deployment,
      });
    });

    return;
  }

  // 7. Resolve an alert
  const resolveMatch = url.pathname.match(
    /^\/api\/alerts\/([^/]+)\/resolve$/
  );

  if (req.method === "PATCH" && resolveMatch) {
    const alertId = decodeURIComponent(resolveMatch[1]);
    const alerts = readAlerts();

    const alert = alerts.find(
      (item) => String(item.id) === alertId
    );

    if (!alert) {
      sendJson(res, 404, {
        message: "Alert not found",
      });
      return;
    }

    alert.resolved = true;

    fs.writeFileSync(
      alertsFile,
      JSON.stringify(alerts, null, 2)
    );

    sendJson(res, 200, {
      message: "Alert resolved successfully",
      alert,
    });
    return;
  }

  // Unknown route
  sendJson(res, 404, {
    message: "Route not found",
    requestedUrl: req.url,
  });
});

server.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
