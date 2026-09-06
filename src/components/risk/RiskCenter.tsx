import { useEffect, useMemo, useState } from "react";

import {
  AlertTriangle,
  CheckCircle2,
  CircleAlert,
  ShieldAlert,
} from "lucide-react";

import {
  getCompletedWorks,
  type CompletedWork,
} from "../../api/mpladsApi";

import {
  calculateWorksRisk,
  type RiskLevel,
  type WorkRisk,
} from "../../utils/riskEngine";

interface RiskCenterProps {
  state?: string;
}

function getRiskStyle(level: RiskLevel) {
  switch (level) {
    case "CRITICAL":
      return {
        text: "text-red-400",
        bg: "bg-red-500/10",
        border: "border-red-500/20",
      };

    case "HIGH":
      return {
        text: "text-orange-400",
        bg: "bg-orange-500/10",
        border: "border-orange-500/20",
      };

    case "MEDIUM":
      return {
        text: "text-yellow-400",
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/20",
      };

    default:
      return {
        text: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
      };
  }
}

export default function RiskCenter({
  state = "Maharashtra",
}: RiskCenterProps) {
  const [works, setWorks] = useState<CompletedWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadWorks() {
      try {
        setLoading(true);
        setError("");

        const data = await getCompletedWorks(
          state,
          1,
          10,
        );

        setWorks(
          Array.isArray(data)
            ? data
            : [],
        );
      } catch (err) {
        console.error(
          "RISK CENTER API ERROR:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load works.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadWorks();
  }, [state]);

  const risks: WorkRisk[] = useMemo(() => {
    try {
      return calculateWorksRisk(works);
    } catch (err) {
      console.error(
        "RISK ENGINE ERROR:",
        err,
      );

      return [];
    }
  }, [works]);

  const counts = useMemo(() => {
    return {
      critical: risks.filter(
        (risk) =>
          risk.level === "CRITICAL",
      ).length,

      high: risks.filter(
        (risk) =>
          risk.level === "HIGH",
      ).length,

      medium: risks.filter(
        (risk) =>
          risk.level === "MEDIUM",
      ).length,

      low: risks.filter(
        (risk) =>
          risk.level === "LOW",
      ).length,
    };
  }, [risks]);

  if (loading) {
    return (
      <section className="mt-6 rounded-xl border border-white/[0.06] bg-[#0c1016] p-6">
        <p className="text-sm text-slate-400">
          Running risk analysis...
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mt-6 rounded-xl border border-red-500/20 bg-[#0c1016] p-6">
        <p className="text-sm font-semibold text-red-400">
          Risk Center unavailable
        </p>

        <p className="mt-2 text-xs text-slate-500">
          {error}
        </p>
      </section>
    );
  }

  return (
    <section className="mt-6 overflow-hidden rounded-xl border border-white/[0.06] bg-[#0c1016]">
      <div className="border-b border-white/[0.06] px-5 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
              <ShieldAlert
                size={17}
                className="text-blue-400"
              />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-white">
                Explainable Risk Analysis
              </h2>

              <p className="mt-1 text-[10px] text-slate-600">
                Live completed works · {state}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-md border border-red-500/20 bg-red-500/5 px-2.5 py-1.5 text-[10px] text-red-400">
              Critical {counts.critical}
            </span>

            <span className="rounded-md border border-orange-500/20 bg-orange-500/5 px-2.5 py-1.5 text-[10px] text-orange-400">
              High {counts.high}
            </span>

            <span className="rounded-md border border-yellow-500/20 bg-yellow-500/5 px-2.5 py-1.5 text-[10px] text-yellow-400">
              Medium {counts.medium}
            </span>

            <span className="rounded-md border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1.5 text-[10px] text-emerald-400">
              Low {counts.low}
            </span>
          </div>
        </div>
      </div>

      <div className="border-b border-white/[0.06] bg-blue-500/[0.02] px-5 py-4">
        <p className="text-xs font-medium text-slate-300">
          AI-assisted monitoring
        </p>

        <p className="mt-1 text-[11px] leading-5 text-slate-600">
          Risk scores highlight records that may
          require additional verification. A flag
          does not indicate fraud by itself.
        </p>
      </div>

      <div>
        {risks.map((risk) => {
          const style = getRiskStyle(
            risk.level,
          );

          return (
            <RiskRow
              key={risk.work.id}
              risk={risk}
              style={style}
            />
          );
        })}
      </div>

      <div className="border-t border-white/[0.06] px-5 py-3">
        <p className="text-[10px] text-slate-600">
          Analyzed {risks.length} live works using
          explainable rule-based risk indicators.
        </p>
      </div>
    </section>
  );
}

function RiskRow({
  risk,
  style,
}: {
  risk: WorkRisk;
  style: {
    text: string;
    bg: string;
    border: string;
  };
}) {
  const [expanded, setExpanded] =
    useState(false);

  return (
    <div className="border-b border-white/[0.04] last:border-b-0">
      <button
        type="button"
        onClick={() =>
          setExpanded(
            (current) => !current,
          )
        }
        className="w-full px-5 py-4 text-left transition hover:bg-white/[0.02]"
      >
        <div className="flex items-center gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${style.border} ${style.bg}`}
          >
            <span
              className={`text-xs font-bold ${style.text}`}
            >
              {risk.score}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className={`rounded-md border px-2 py-1 text-[9px] font-bold ${style.border} ${style.bg} ${style.text}`}
              >
                {risk.level}
              </span>

              <span className="text-[10px] text-slate-600">
                #{risk.work.work_id}
              </span>
            </div>

            <p className="mt-1 truncate text-xs font-medium text-slate-300">
              {risk.work.work_description ||
                "Work description unavailable"}
            </p>

            <p className="mt-1 text-[10px] text-slate-600">
              {risk.work.district ||
                "Unknown district"}{" "}
              · ₹
              {Number(
                risk.work.cost || 0,
              ).toLocaleString("en-IN")}
            </p>
          </div>

          <div className="hidden md:block">
            <p className="text-[9px] uppercase tracking-wider text-slate-600">
              Indicators
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {risk.indicators.length}
            </p>
          </div>

          <span className="text-slate-600">
            {expanded ? "−" : "+"}
          </span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-white/[0.04] bg-black/10 px-5 py-5">
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Why flagged
              </p>

              <div className="space-y-2">
                {risk.indicators.map(
                  (indicator, index) => (
                    <div
                      key={`${indicator.title}-${index}`}
                      className="rounded-lg border border-white/[0.05] bg-white/[0.015] p-3"
                    >
                      <div className="flex gap-3">
                        {indicator.severity ===
                        "critical" ? (
                          <CircleAlert
                            size={15}
                            className="mt-0.5 shrink-0 text-red-400"
                          />
                        ) : indicator.severity ===
                          "high" ? (
                          <AlertTriangle
                            size={15}
                            className="mt-0.5 shrink-0 text-orange-400"
                          />
                        ) : (
                          <CheckCircle2
                            size={15}
                            className="mt-0.5 shrink-0 text-yellow-400"
                          />
                        )}

                        <div>
                          <p className="text-xs font-medium text-slate-300">
                            {indicator.title}
                          </p>

                          <p className="mt-1 text-[10px] leading-4 text-slate-600">
                            {indicator.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>

            <div>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Recommended action
              </p>

              <div className="rounded-lg border border-blue-500/10 bg-blue-500/[0.04] p-4">
                <p className="text-xs leading-5 text-slate-300">
                  {risk.recommendation}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}