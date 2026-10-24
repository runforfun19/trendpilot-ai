
from pathlib import Path
import os
import json

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI


# Load environment variables from the backend directory.
load_dotenv(dotenv_path=Path(__file__).with_name(".env"))

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
                "year_over_year_change_percent": 0.4,
            },
            {
                "name": "Skilled-category job vacancies",
                "value": 48700,
                "unit": "positions",
                "year_over_year_change_percent": None,
            },
            {
                "name": "Total jobs in skilled category",
                "value": 2330000,
                "unit": "positions",
                "year_over_year_change_percent": 2.6,
            },
        ],
        "source_url": (
            "https://www.dosm.gov.my/portal-main/"
            "release-content/employment-statistics-q12026"
        ),
        "limitations": (
            "These are national labor market statistics, "
            "not technology-specific vacancy counts. "
            "The figures are a published snapshot, not live data."
        ),
    }


@app.post("/analyze")
def analyze_skill(request: SkillRequest):
    raw_input = request.skill.strip()

    if not raw_input:
        raise HTTPException(
            status_code=400,
            detail="Please enter a skill or career interest.",
        )

    input_skills = sorted({
        item.strip()
        for item in raw_input.replace(";", ",")
        .replace("\n", ",")
        .split(",")
        if item.strip()
    })

    api_key = os.getenv("GROQ_API_KEY")
    model = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")

    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="Groq API key is not configured.",
        )

    prompt = f"""
You are TrendPilot AI, a careful career analysis assistant.

Analyze the user's actual skills and career interests.

User input:
{raw_input}

Generate 4 to 6 relevant career roles based on the input.
Do not restrict suggestions to a predefined list of careers.
Adapt to technical, business, creative, and other legitimate career skills.

Return a valid JSON object with exactly these top-level fields:
- roles: an array of relevant career roles
- data_note: a short explanation of score limitations
- next_step: a practical recommendation

Each role must contain:
- title: string
- match_score: integer from 0 to 100
- matched_skills: array of strings
- missing_skills: array of strings
- description: string
- learning_pathway: array of strings
- sdg_alignment: array of strings
- reason: string

Rules:
1. Infer relevant career directions instead of requiring exact keyword matches.
2. Only include user skills in matched_skills when the user actually
   provided them or clearly described them.
3. Put useful skills to learn in missing_skills.
4. Treat match_score as an estimated fit based on the limited information
   provided, not an employment probability or verified statistic.
5. If the user provides only one skill, explain that the assessment
   is based on limited input.
6. Do not invent live vacancies, salary figures, or market statistics.
7. Keep learning pathways concise, practical, and ordered.
8. Use relevant United Nations Sustainable Development Goals (SDGs)
   only when there is a reasonable connection.
9. If the input is meaningless or unrelated to careers, do not fabricate
   a confident assessment. Explain the limitation and return an empty
   roles array if necessary.
10. Return JSON only, without Markdown fences.
"""

    try:
        client = OpenAI(
            api_key=api_key,
            base_url="https://api.groq.com/openai/v1",
        )

        completion = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are TrendPilot AI. "
                        "Follow the user's instructions and return "
                        "valid JSON only."
                    ),
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            response_format={"type": "json_object"},
            temperature=0.2,
            max_completion_tokens=3000,
        )

        content = completion.choices[0].message.content

        if not content:
            raise ValueError("The AI returned an empty response.")

        result = json.loads(content)
        roles = result.get("roles")

        if not isinstance(roles, list):
            raise ValueError("The AI returned an invalid roles field.")

        # Preserve the JSON structure expected by the existing frontend.
        normalized_roles = []

        for role in roles:
            if not isinstance(role, dict) or not role.get("title"):
                continue

            try:
                score = int(role.get("match_score", 0))
            except (TypeError, ValueError):
                score = 0

            def safe_string_list(value):
                if not isinstance(value, list):
                    return []
                return [
                    str(item).strip()
                    for item in value
                    if isinstance(item, (str, int, float))
                    and str(item).strip()
                ]

            normalized_roles.append({
                "title": str(role["title"]),
                "match_score": max(0, min(100, score)),
                "matched_skills": safe_string_list(
                    role.get("matched_skills", [])
                ),
                "missing_skills": safe_string_list(
                    role.get("missing_skills", [])
                ),
                "description": str(role.get("description", "")),
                "learning_pathway": safe_string_list(
                    role.get("learning_pathway", [])
                ),
                "sdg_alignment": safe_string_list(
                    role.get("sdg_alignment", [])
                ),
                "reason": str(role.get("reason", "")),
            })

        if not normalized_roles and roles:
            raise ValueError("No usable career roles were returned.")

        normalized_roles.sort(
            key=lambda item: item["match_score"],
            reverse=True,
        )

        return {
            "input_skills": input_skills,
            "roles": normalized_roles,
            "data_note": str(result.get(
                "data_note",
                "Scores are AI-generated estimates, not employment probabilities.",
            )),
            "next_step": str(result.get(
                "next_step",
                "Add more skills for a more personalized assessment.",
            )),
        }

    except HTTPException:
        raise

    except Exception as exc:
        # Log errors without exposing the API key.
        print(
            f"Career analysis failed: "
            f"{type(exc).__name__}: {exc}"
        )

        raise HTTPException(
            status_code=502,
            detail=(
                "AI analysis failed. Check the backend terminal, "
                "Groq model access, API quota, and configuration."
            ),
        )
