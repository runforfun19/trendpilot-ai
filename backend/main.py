from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="TrendPilot AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SkillRequest(BaseModel):
    skill: str


# Sample role data for demonstration only.
# This data does not represent real-time labor market statistics.
ROLES = [
    {
        "title": "Data Analyst",
        "skills": ["python", "sql", "excel", "data analysis"],
        "description": "Analyze data and support business decisions.",
        "learning": [
            "SQL",
            "Data Visualization",
            "Statistics",
        ],
        "sdg": [
            "SDG 4: Quality Education",
            "SDG 8: Decent Work and Economic Growth",
        ],
    },
    {
        "title": "AI / Machine Learning Engineer",
        "skills": [
            "python",
            "machine learning",
            "statistics",
        ],
        "description": "Build and evaluate machine learning models.",
        "learning": [
            "Statistics",
            "Machine Learning",
            "Model Evaluation",
        ],
        "sdg": [
            "SDG 4: Quality Education",
            "SDG 9: Industry, Innovation and Infrastructure",
        ],
    },
    {
        "title": "Full-Stack Developer",
        "skills": [
            "javascript",
            "typescript",
            "html",
            "css",
            "react",
            "python",
        ],
        "description": "Build complete web applications with frontend and backend systems.",
        "learning": [
            "React",
            "REST APIs",
            "Databases",
        ],
        "sdg": [
            "SDG 4: Quality Education",
            "SDG 8: Decent Work and Economic Growth",
        ],
    },
    {
        "title": "Cybersecurity Analyst",
        "skills": [
            "networking",
            "linux",
            "python",
            "security",
        ],
        "description": "Identify security risks and protect systems and data.",
        "learning": [
            "Networking",
            "Security Fundamentals",
            "Threat Analysis",
        ],
        "sdg": [
            "SDG 9: Industry, Innovation and Infrastructure",
        ],
    },
]


@app.get("/")
def home():
    return {"message": "Welcome to TrendPilot AI"}


@app.get("/market-trends")
def get_market_trends():
    return {
        "country": "Malaysia",
        "source": "Department of Statistics Malaysia (DOSM)",
        "report": "Employment Statistics, First Quarter 2026",
        "release_date": "2026-05-14",
        "data_period": "2026-Q1",
        "indicators": [
            {
                "name": "Total job vacancies",
                "value": 194800,
                "unit": "positions",
                "year_over_year_change_percent": 0.4
            },
            {
                "name": "Skilled-category job vacancies",
                "value": 48700,
                "unit": "positions",
                "year_over_year_change_percent": None
            },
            {
                "name": "Total jobs in skilled category",
                "value": 2330000,
                "unit": "positions",
                "year_over_year_change_percent": 2.6
            }
        ],
        "source_url": (
            "https://www.dosm.gov.my/portal-main/"
            "release-content/employment-statistics-q12026"
        ),
        "limitations": (
            "These are national labor market statistics, "
            "not technology-specific vacancy counts. "
            "The figures are a published snapshot, not live data."
        )
    }

@app.post("/analyze")
def analyze_skill(request: SkillRequest):
    user_skills = {
        item.strip().lower()
        for item in request.skill.split(",")
        if item.strip()
    }

    if not user_skills:
        return {"error": "Please enter at least one skill."}

    results = []

    for role in ROLES:
        required_skills = set(role["skills"])
        matched_skills = user_skills.intersection(required_skills)
        missing_skills = sorted(required_skills - user_skills)

        match_score = round(
            len(matched_skills) / len(required_skills) * 100
        )

        results.append({
            "title": role["title"],
            "match_score": match_score,
            "matched_skills": sorted(matched_skills),
            "missing_skills": missing_skills,
            "description": role["description"],
            "learning_pathway": role["learning"],
            "sdg_alignment": role["sdg"],
            "reason": (
                f"Matched {len(matched_skills)} of "
                f"{len(required_skills)} skills in the sample role profile."
            ),
        })

    results.sort(
        key=lambda item: item["match_score"],
        reverse=True,
    )

    return {
        "input_skills": sorted(user_skills),
        "roles": results,
        "data_note": (
            "Role profiles are sample data for demonstration. "
            "Match scores do not represent employment probabilities "
            "or real-time market demand."
        ),
        "next_step": (
            "Connect verified labor market data to analyze "
            "current job demand and trends."
        ),
    }
