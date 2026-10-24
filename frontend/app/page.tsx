"use client";

import MatchScoreChart from "./components/MatchScoreChart";

import { useEffect, useState } from "react";

type RoleResult = {
  title: string;
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  description: string;
  learning_pathway: string[];
  sdg_alignment: string[];
  reason: string;
};

type AnalysisResponse = {
  input_skills: string[];
  roles: RoleResult[];
  data_note: string;
  next_step: string;
  error?: string;
};

type MarketIndicator = {
  name: string;
  value: number;
  unit: string;
  year_over_year_change_percent: number | null;
};

type MarketData = {
  country: string;
  source: string;
  report: string;
  release_date: string;
  data_period: string;
  indicators: MarketIndicator[];
  source_url: string;
  limitations: string;
};

export default function Home() {
  const [skill, setSkill] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [analysisError, setAnalysisError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [market, setMarket] = useState<MarketData | null>(null);
  const [marketError, setMarketError] = useState("");
  const [isLoadingMarket, setIsLoadingMarket] = useState(true);

  useEffect(() => {
    async function loadMarketTrends() {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/market-trends"
        );

        if (!response.ok) {
          throw new Error("Could not load market data.");
        }

        const data: MarketData = await response.json();
        setMarket(data);
      } catch (error) {
        setMarketError(
          error instanceof Error
            ? error.message
            : "Could not connect to the backend."
        );
      } finally {
        setIsLoadingMarket(false);
      }
    }

    loadMarketTrends();
  }, []);

  async function analyzeSkill() {
    if (!skill.trim()) {
      setAnalysisError("Please enter at least one skill.");
      setAnalysis(null);
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError("");
    setAnalysis(null);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ skill }),
        }
      );

      const data: AnalysisResponse = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Analysis failed.");
      }

      setAnalysis(data);
    } catch (error) {
      setAnalysisError(
        error instanceof Error
          ? error.message
          : "Could not connect to the backend."
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <nav className="flex justify-between items-center max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-cyan-400">
          TrendPilot AI
        </h1>
        <span className="text-sm text-slate-400">
          Career Intelligence
        </span>
      </nav>

      <section className="max-w-3xl mx-auto mt-24 text-center">
        <p className="text-cyan-400 font-semibold">
          YOUR FUTURE, DATA-DRIVEN
        </p>

        <h2 className="text-5xl font-bold mt-4 leading-tight">
          Discover the skills
          <br />
          <span className="text-cyan-400">
            the future demands.
          </span>
        </h2>

        <p className="text-slate-400 mt-6">
          Explore technology skills and discover what to learn next.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mt-10">
          <input
            value={skill}
            onChange={(event) => setSkill(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                analyzeSkill();
              }
            }}
            placeholder="Try Python, SQL, JavaScript..."
            className="flex-1 rounded-xl bg-slate-900 border border-slate-700 p-4 outline-none focus:border-cyan-400"
          />

          <button
            onClick={analyzeSkill}
            disabled={isAnalyzing}
            className="rounded-xl bg-cyan-400 text-slate-950 font-bold px-6 py-4 hover:bg-cyan-300 disabled:opacity-50"
          >
            {isAnalyzing ? "Analyzing..." : "Analyze Skill"}
          </button>
        </div>

        {analysisError && (
          <div className="mt-6 rounded-xl border border-red-800 bg-red-950/40 p-4 text-left text-red-300">
            {analysisError}
          </div>
        )}

        {analysis && (
          <div className="mt-8 text-left">
            <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 mb-5">
              <p className="text-cyan-400 font-semibold">
                Your Skills
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {analysis.input_skills.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-slate-800 border border-slate-700 px-3 py-1 text-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <h3 className="text-xl font-bold mb-4">
              Recommended Career Paths
            </h3>

            <MatchScoreChart roles={analysis.roles} />

            <div className="grid grid-cols-1 gap-4">
              {analysis.roles.map((role) => (
                <div
                  key={role.title}
                  className="rounded-xl border border-slate-700 bg-slate-900 p-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h4 className="text-lg font-bold">
                      {role.title}
                    </h4>
                    <span className="text-cyan-400 font-bold">
                      {role.match_score}% match
                    </span>
                  </div>

                  <div className="h-2 bg-slate-800 rounded-full mt-3 overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 rounded-full"
                      style={{
                        width: `${role.match_score}%`,
                      }}
                    />
                  </div>

                  <p className="text-slate-400 text-sm mt-4">
                    {role.description}
                  </p>

                  <p className="text-sm font-semibold mt-4">
                    Matched skills
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {role.matched_skills.length > 0 ? (
                      role.matched_skills.map((item) => (
                        <span
                          key={item}
                          className="rounded-full bg-emerald-950 text-emerald-300 px-3 py-1 text-xs"
                        >
                          {item}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 text-sm">
                        No matching skills yet.
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-semibold mt-4">
                    Skills to develop
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {role.missing_skills.map((item) => (
                      <span
                        key={item}
                        className="rounded-full bg-amber-950 text-amber-300 px-3 py-1 text-xs"
                      >
                        {item}
                      </span>
                    ))}
                  </div>

                  <p className="text-sm font-semibold mt-4">
                    Suggested learning pathway
                  </p>
                  <ol className="list-decimal list-inside text-sm text-slate-300 mt-2 space-y-1">
                    {role.learning_pathway.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ol>

                  <p className="text-sm font-semibold mt-4">
                    SDG Alignment
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {role.sdg_alignment.map((item) => (
                      <span
                        key={item}
                        className="rounded-lg border border-slate-700 px-3 py-1 text-xs text-slate-300"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-500 mt-4">
              {analysis.data_note}
            </p>
            <p className="text-sm text-slate-400 mt-2">
              Next step: {analysis.next_step}
            </p>
          </div>
        )}
      </section>

      <section className="max-w-5xl mx-auto mt-20">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
          <div>
            <p className="text-cyan-400 font-semibold">
              MARKET INTELLIGENCE
            </p>
            <h2 className="text-2xl font-bold mt-2">
              Malaysia Employment Trends
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Published labor market indicators with source information.
            </p>
          </div>

          {market && (
            <span className="text-xs text-slate-500">
              {market.data_period}
            </span>
          )}
        </div>

        {isLoadingMarket && (
          <p className="text-slate-400">
            Loading market data...
          </p>
        )}

        {marketError && (
          <div className="rounded-xl border border-amber-800 bg-amber-950/30 p-4 text-amber-300">
            {marketError}
          </div>
        )}

        {market && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {market.indicators.map((indicator) => (
                <div
                  key={indicator.name}
                  className="rounded-xl bg-slate-900 p-5 border border-slate-800"
                >
                  <p className="text-slate-400 text-sm">
                    {indicator.name}
                  </p>
                  <h3 className="text-3xl font-bold text-cyan-400 mt-3">
                    {indicator.value.toLocaleString("en-MY")}
                  </h3>
                  <p className="text-slate-500 text-xs mt-2">
                    {indicator.unit}
                  </p>

                  {indicator.year_over_year_change_percent !== null && (
                    <p className="text-sm text-slate-300 mt-3">
                      Year-on-year change:{" "}
                      {indicator.year_over_year_change_percent > 0
                        ? "+"
                        : ""}
                      {indicator.year_over_year_change_percent}%
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 mt-5">
              <h3 className="font-bold">Data Source and Limitations</h3>
              <p className="text-slate-300 text-sm mt-2">
                {market.source}
              </p>
              <p className="text-slate-400 text-sm mt-1">
                {market.report} · Released {market.release_date}
              </p>
              <p className="text-slate-400 text-sm mt-3">
                {market.limitations}
              </p>
              <a
                href={market.source_url}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-cyan-400 hover:text-cyan-300 text-sm mt-4 underline"
              >
                View Original Source
              </a>
            </div>
          </>
        )}
      </section>

      <section className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 mb-10">
        <div className="rounded-xl bg-slate-900 p-5 border border-slate-800">
          <p className="text-slate-400 text-sm">Feature 01</p>
          <h3 className="font-bold mt-2">Skill Trends</h3>
          <p className="text-slate-400 text-sm mt-2">
            Explore published labor market indicators.
          </p>
        </div>

        <div className="rounded-xl bg-slate-900 p-5 border border-slate-800">
          <p className="text-slate-400 text-sm">Feature 02</p>
          <h3 className="font-bold mt-2">Career Insights</h3>
          <p className="text-slate-400 text-sm mt-2">
            Compare your skills with example career profiles.
          </p>
        </div>

        <div className="rounded-xl bg-slate-900 p-5 border border-slate-800">
          <p className="text-slate-400 text-sm">Feature 03</p>
          <h3 className="font-bold mt-2">AI Roadmap</h3>
          <p className="text-slate-400 text-sm mt-2">
            Identify skills to develop next.
          </p>
        </div>
      </section>
    </main>
  );
}
