# 🚀 DeployFlow

### Automated Deployment & Application Monitoring Platform

DeployFlow is a web-based platform designed to monitor application health, view logs, track alerts, and manage deployment status through a simple dashboard.

## 🌐 Live Demo

- **Frontend:** https://deploy-flow-puce.vercel.app
- **Backend API:** https://deployflow-ezbz.onrender.com

## ✨ Features

- 📊 Application health and system monitoring
- 📝 Live application logs
- 🚨 Alert monitoring with severity levels
- ✅ Resolve active alerts
- 🚀 View and manage deployment status
- 🔄 Automatic data refresh
- 🌍 Live frontend and backend deployment

## 🛠️ Tech Stack

- **Frontend:** React.js, JavaScript, CSS
- **Backend:** Node.js
- **System Monitoring:** Systeminformation
- **Data Storage:** JSON files
- **Version Control:** Git and GitHub
- **Frontend Hosting:** Vercel
- **Backend Hosting:** Render

## 📂 Project Structure

```text
DeployFlow/
├── .github/
│   └── workflows/
├── backend/
│   ├── server.js
│   ├── alerts.json
│   ├── deployments.json
│   └── logs.json
└── frontend/
    └── React application files
```

## 🔌 API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check backend health |
| GET | `/api/metrics` | Get system metrics |
| GET | `/api/logs` | Retrieve application logs |
| GET | `/api/alerts` | Retrieve alerts |
| GET | `/api/deployments` | Retrieve deployments |
| PATCH | `/api/deployments/:id/status` | Update deployment status |
| PATCH | `/api/alerts/:id/resolve` | Resolve an alert |

## 💻 Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/Syam12max/DeployFlow.git
cd DeployFlow
```

### 2. Start the backend

```bash
cd backend
npm install
node server.js
```

### 3. Start the frontend

Open a new terminal:

```bash
cd frontend
npm install
npm start
```

If the frontend uses Vite, run `npm run dev` instead of `npm start`.

## 🎯 Project Objective

The objective of DeployFlow is to provide a simple dashboard for application monitoring, log tracking, alert management, and deployment visibility.

## 👨‍💻 Author

**Syam12max**

GitHub: https://github.com/Syam12max
