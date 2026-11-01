# MetroSentry AI 🚇

**AI-assisted visual safety review and incident-management prototype for metro stations.**

MetroSentry provides a browser-based operations console for reviewing station images, simulating platform-door states, managing incidents, and viewing local operational summaries.

## What works

- Upload JPG, PNG, or WEBP images (maximum 8 MB) or capture a frame using a browser camera.
- Send image evidence to the backend for Gemma 4 visual analysis.
- Review a preliminary risk level, summary, observations, confidence estimate, suggested operator action, and limitations.
- Simulate eight platform doors and their states.
- Manage locally stored simulated incidents and view analytics.

**Not connected:** live metro CCTV, train systems, physical platform doors, or live station telemetry. Crowd intelligence is not yet an automated model feature. This is a hackathon prototype, not a certified railway safety system.

## Technology stack

- Frontend: HTML5, CSS3, Vanilla JavaScript
- Backend: Node.js, Express 5
- AI: Google Gen AI JavaScript SDK (`@google/genai`) with Gemma 4
- Upload handling: Multer (memory storage)
- Configuration: dotenv
- Browser APIs: File API, MediaDevices API, Canvas, LocalStorage
- Tooling: npm, Git, GitHub, browser developer tools

## Run locally

Requirements: Node.js 20+ and npm.

    git clone https://github.com/Shivam-Sharma2009/metrosentry.git
    cd metrosentry
    npm install

Create a file named `.env` in the project root:

    GEMINI_API_KEY=your_google_ai_studio_key
    GEMMA_MODEL=gemma-4-26b-a4b-it
    PORT=3000

Keep the real key only in your local `.env`. The repository's `.gitignore` excludes `.env`.

Start the server:

    npm start

Open http://localhost:3000.

## API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Reports server health and whether AI is configured, without returning credentials |
| POST | `/api/analyze/frame` | Accepts multipart form data with an `image` file and optional `station` field; returns structured Gemma analysis |

The image endpoint accepts JPEG, PNG, and WEBP up to 8 MB. The server checks the file signature, not only the browser-supplied MIME type.

## Project structure

    metrosentry/
    ├── public/
    │   ├── index.html
    │   ├── css/
    │   └── js/
    ├── server/
    │   └── index.js
    ├── package.json
    ├── package-lock.json
    └── .gitignore

## Responsible use and limitations

- AI observations can be incorrect or incomplete. Confidence is a model estimate, not a calibrated probability.
- Every analysis requires human review. The application does not automatically create a confirmed incident from model output.
- Recommendations are advisory and must not be used to control railway equipment or make real-world safety decisions.
- Door simulator states and incidents generated from it are simulated.
- No live CCTV, metro control system, or physical hardware is connected.

## Roadmap

- Add automated tests and CI.
- Add screenshot gallery and hosted demo.
- Add persistent server-side incident storage and operator review workflow.
- Improve crowd analysis and evidence visualization.

## Repository

https://github.com/Shivam-Sharma2009/metrosentry
