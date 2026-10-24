type RoleScore = {
  title: string;
  match_score: number;
};

type MatchScoreChartProps = {
  roles: RoleScore[];
};

export default function MatchScoreChart({ roles }: MatchScoreChartProps) {
  if (!roles || roles.length === 0) {
    return null;
  }

  return (
    <section className="mb-6 rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
      <div className="mb-5">
        <h4 className="text-lg font-semibold text-white">
          Career Match Comparison
        </h4>
        <p className="mt-1 text-sm text-slate-400">
          Compare your skills with each sample role profile.
        </p>
      </div>

      <div className="space-y-5">
        {roles.map((role) => {
          const score = Math.max(
            0,
            Math.min(100, Number(role.match_score) || 0)
          );

          return (
            <div key={role.title}>
              <div className="mb-2 flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-slate-200">
                  {role.title}
                </span>
                <span className="text-sm font-bold text-cyan-400">
                  {score}%
                </span>
              </div>

              <div
                className="h-3 w-full overflow-hidden rounded-full bg-slate-800"
                role="progressbar"
                aria-label={`${role.title} match score`}
                aria-valuenow={score}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full bg-cyan-400 transition-all duration-700"
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-5 text-xs leading-5 text-slate-500">
        Scores are based on sample role profiles, not real employment
        probabilities.
      </p>
    </section>
  );
}
