# TrendPilot AI

## Team Information

- **Team Name:** 404 Brain Not Found
- **Team Domain:** Domain 1 — Career Navigation / Employment Trends
- **Project Name:** TrendPilot AI

## Project Overview

TrendPilot AI is a career navigation platform designed to help users explore employment trends and identify potential career paths based on their skills.

The platform currently provides:
- Malaysia employment trend information.
- Rule-based skill matching against selected career profiles.
- Match scores to help users compare potential career paths.

**Current limitations:** The skill-matching feature uses predefined rules and career profiles rather than a trained machine learning model. Employment trend information currently uses a sample data snapshot and should not be interpreted as live labour-market data.

## Important Links

- **Live Demo:** [Insert demo URL, or write Not deployed]
- **Pitch Video:** [Insert pitch video URL]
- **GitHub Repository:** [Insert repository URL]

## Technologies Used

### Frontend
- Next.js
- React
- TypeScript

### Backend
- Python
- FastAPI
- Uvicorn

## How to Run the Project Locally

### Prerequisites

Install the following software:
- Node.js and npm
- Python 3.11 or a compatible Python version

### 1. Start the Backend

Open a terminal and navigate to the backend directory:

```bash
cd backend
```

Create and activate a virtual environment if you have not already created one:

**Windows PowerShell:**

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Install the backend dependencies:

```powershell
python -m pip install fastapi "uvicorn[standard]"
```

Start the backend server:

```powershell
python -m uvicorn main:app --reload --port 8000
```

The backend should be available at:

`http://127.0.0.1:8000`

### 2. Start the Frontend

Open a second terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install the frontend dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the application in your browser:

`http://localhost:3000`

Keep both terminal sessions running while using the application.

## Overall Project Structure

```text
trendpilot-ai/
├── frontend/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   ├── package.json
│   └── package-lock.json
├── backend/
│   └── main.py
└── README.md
```

The frontend provides the user interface, while the FastAPI backend handles API requests and career skill-matching logic.

## Use of Replit and RunPod

### Replit

[Describe how Replit was actually used during development, testing, collaboration, or deployment. If it was not used, state this accurately and explain the reason if required by the submission guidelines.]

### RunPod

[Describe whether RunPod was used for model training, inference, GPU computing, or deployment. If it was not used, state this accurately and follow the hackathon's submission requirements.]

## Future Improvements

- Integrate verified and up-to-date Malaysian employment data.
- Improve career matching using validated skill and job datasets.
- Evaluate whether a machine learning model can improve matching accuracy.
- Add further career recommendations and explainable matching results.
