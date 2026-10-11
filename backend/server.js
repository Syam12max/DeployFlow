
const http = require("http");
const fs = require("fs");
const path = require("path");
const si = require("systeminformation");

const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "https://deploy-flow-puce.vercel.app",
  "http://localhost:3000",
];

const alertsFile = path.join(__dirname, "alerts.json");
const deploymentsFile = path.join(__dirname, "deployments.json");

function readJson(filePath, fallback = []) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2));
      return fallback;
    }

    const content = fs.readFileSync(filePath, "utf8");
    return content.trim() ? JSON.parse(content) : fallback;
  } catch (error) {
    console.error(`Error reading ${path.basename(filePath)}:`, error);
    throw error;
  }
}

function saveJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(data));
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;

      if (body.length > 1_000_000) {
        reject(new Error("Request body is too large"));
        req.destroy();
      }
    });

    req.on("end", () => {
      if (!body.trim()) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Invalid JSON request body"));
      }
    });

    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  // CORS: allow the deployed frontend and local development.
  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, PATCH, POST, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");

  // Browser sends OPTIONS before cross-origin PATCH requests.
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = url.pathname;

  try {
    // Health check
    if (req.method === "GET" && pathname === "/api/health") {
      sendJson(res, 200, {
        status: "OK",
        message: "DeployFlow backend is running",
      });
      return;
    }

    // System metrics
    if (req.method === "GET" && pathname === "/api/metrics") {
      const [load, memory, disks, uptime] = await Promise.all([
        si.currentLoad(),
        si.mem(),
        si.fsSize(),
        si.time(),
      ]);

      const disk = disks.length > 0 ? disks[0] : null;

      sendJson(res, 200, {
        cpu: Number(load.currentLoad.toFixed(1)),
        memory: Number(
          ((memory.active / memory.total) * 100 || 0).toFixed(1)
        ),
        disk: disk ? Number(disk.use.toFixed(1)) : 0,
        uptime: uptime.uptime,
      });
      return;
    }

    // Logs
    if (req.method === "GET" && pathname === "/api/logs") {
      sendJson(res, 200, [
        {
          id: "1",
          level: "INFO",
          message: "DeployFlow monitoring service is running",
          timestamp: new Date().toISOString(),
        },
      ]);
      return;
    }

    // Get alerts
    if (req.method === "GET" && pathname === "/api/alerts") {
      sendJson(res, 200, readJson(alertsFile));
      return;
    }

    // Get deployments
    if (req.method === "GET" && pathname === "/api/deployments") {
      sendJson(res, 200, readJson(deploymentsFile));
      return;
    }

    // Update deployment status
    const deploymentMatch = pathname.match(
      /^\/api\/deployments\/([^/]+)\/status$/
    );

    if (req.method === "PATCH" && deploymentMatch) {
      const deploymentId = decodeURIComponent(deploymentMatch[1]);
      const body = await readRequestBody(req);
      const allowedStatuses = ["Success", "Running", "Failed"];

      if (!allowedStatuses.includes(body.status)) {
        sendJson(res, 400, {
          message: "Invalid status. Use Success, Running, or Failed.",
        });
        return;
      }

      const deployments = readJson(deploymentsFile);
      const index = deployments.findIndex(
        (item) => String(item.id) === String(deploymentId)
      );

      if (index === -1) {
        sendJson(res, 404, {
          message: "Deployment not found",
        });
        return;
      }

      deployments[index] = {
        ...deployments[index],
        status: body.status,
      };

      saveJson(deploymentsFile, deployments);

      sendJson(res, 200, {
        message: "Deployment status updated successfully",
        deployment: deployments[index],
      });
      return;
    }

    // Resolve an alert
    const alertMatch = pathname.match(
      /^\/api\/alerts\/([^/]+)\/resolve$/
    );

    if (req.method === "PATCH" && alertMatch) {
      const alertId = decodeURIComponent(alertMatch[1]);
      const alerts = readJson(alertsFile);

      const index = alerts.findIndex(
        (item) => String(item.id) === String(alertId)
      );

      if (index === -1) {
        sendJson(res, 404, {
          message: "Alert not found",
        });
        return;
      }

      alerts[index] = {
        ...alerts[index],
        resolved: true,
      };

      saveJson(alertsFile, alerts);

      sendJson(res, 200, {
        message: "Alert resolved successfully",
        alert: alerts[index],
      });
      return;
    }

    sendJson(res, 404, {
      message: "API route not found",
    });
  } catch (error) {
    console.error("API error:", error);

    if (!res.headersSent) {
      sendJson(res, 500, {
        message: error.message || "Internal server error",
      });
    }
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`DeployFlow backend running on port ${PORT}`);
});
