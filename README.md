# MetroSentry AI 🚇

**A metro-station safety monitoring and incident-management prototype.**

MetroSentry AI is a browser-based operations console designed to demonstrate how station teams could review visual evidence, monitor platform safety states, manage incidents, and inspect operational statistics from one dashboard.

> **Project status: Phase 1 prototype.** This repository currently provides local image capture/upload, a simulated platform-door control panel, and browser-based incident management. The Gemma vision-analysis integration is **not connected yet**. The dashboard does not receive live metro/CCTV telemetry and must not be used to operate real railway equipment.

## ✨ What it does

- **Operations dashboard:** Displays incident totals, active/critical/resolved counts, camera-feed placeholders, door-state summary, and recent incidents.
- **AI Vision Monitor (integration pending):** Upload a JPG, PNG, or WEBP image (up to 8 MB) or capture a snapshot using a browser camera. Phase 1 prepares the evidence but does not run AI detection.
- **Crowd Intelligence (planned):** Provides the interface for future crowd-density and flow analysis. No crowd estimate is generated in the current version.
- **Platform Door Simulator:** Simulates eight platform doors with closed, open, obstruction, and sensor-fault states. All changes are local simulations.
- **Incident Management:** Creates simulated incidents from door alerts; supports severity/status filters, acknowledgement, resolution, and detail views.
- **Analytics:** Calculates incident totals and breakdowns from records stored in the browser.
- **Local persistence:** Incident records and door states are saved in the browser's LocalStorage.

## 🧰 Technology stack

| Area | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js, Express 5 |
| Local data persistence | Browser LocalStorage |
| Image input | HTML file input, File API |
| Camera capture | Browser MediaDevices API (getUserMedia) and Canvas |
| HTTP interface | Express REST endpoints |
| Package management | npm |
| Version control | Git and GitHub |

### Tools used

- **Code editor:** Visual Studio Code or another compatible editor.
- **Node.js and npm:** Running the server and managing dependencies.
- **Git:** Version control.
- **GitHub:** Source-code hosting and collaboration.
- **Web browser:** Running and testing the dashboard, image upload, and camera permissions.

No AI model is currently called by the application. Gemma vision integration is planned for a later phase and should not be considered a working feature in this release.

## 🚀 Run locally

### Requirements

- Node.js 18 or later
- npm
- A modern browser

### Setup

    git clone https://github.com/Shivam-Sharma2009/metrosentry.git
    cd metrosentry
    npm install
    npm start

Open **http://localhost:3000** in your browser.

For camera capture, allow camera permission when prompted. Camera access generally requires localhost or a secure HTTPS origin.

### Available scripts

| Command | Description |
|---|---|
| npm start | Starts the Express server |
| npm run dev | Starts the same server (no auto-reload configured) |

## 🗂️ Project structure

    metrosentry/
    ├── public/
    │   ├── index.html
    │   ├── css/              # Design tokens and page/component styles
    │   └── js/               # Dashboard modules and browser-side logic
    ├── server/
    │   └── index.js          # Express server and API endpoints
    ├── package.json
    ├── package-lock.json
    └── .gitignore

### Main frontend modules

- **camera.js** – image upload, preview, browser camera, and snapshot capture.
- **analysis.js** – current analysis placeholder and integration status.
- **doors.js** – eight-door simulator and simulated incident creation.
- **incidents.js** – incident list, filters, acknowledgement, and resolution.
- **analytics.js** – local incident summaries.
- **store.js** – LocalStorage persistence.
- **navigation.js** – section navigation and clock.
- **dashboard.js** – dashboard metrics and simulated feed placeholders.
- **app.js** – application initialization and backend health check.

## 🔌 API

| Method | Endpoint | Current behavior |
|---|---|---|
| GET | /api/health | Returns service health information |
| POST | /api/analyze | Returns HTTP 503 until AI integration is implemented |

## 🖼️ Screenshots and demo

A hosted demo and screenshots have not yet been added to this repository. To capture screenshots locally:

1. Start the app using the setup steps above.
2. Open http://localhost:3000.
3. Capture the Overview, AI Vision Monitor, Door Simulator, and Incident Management screens.
4. Add the images under docs/screenshots/ and link them here.

When a public deployment is available, add its URL here.

## 🛣️ Roadmap

- [ ] Connect a real vision model through a secure backend integration.
- [ ] Validate model output and show evidence, confidence, and limitations.
- [ ] Add operator review before AI findings become confirmed incidents.
- [ ] Implement crowd analysis from uploaded/captured images.
- [ ] Add persistent backend storage and incident search.
- [ ] Add automated tests and CI checks.
- [ ] Publish a hosted demo and screenshots.

## ⚠️ Safety and limitations

- This is an educational/demo prototype, not a certified railway safety system.
- No live metro network, CCTV feed, train system, or physical platform-door hardware is connected.
- Door states and generated door incidents are simulations.
- Image analysis and crowd detection are not implemented in Phase 1.
- Do not use this prototype to make real-world operational or safety decisions.

## 👥 Project

**Project:** MetroSentry AI  
**Repository:** https://github.com/Shivam-Sharma2009/metrosentry

## 📄 License

This project is intended to be released under the MIT License. See LICENSE.
