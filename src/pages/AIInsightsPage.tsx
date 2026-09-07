import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Database,
  FileWarning,
  IndianRupee,
  MapPin,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import AppLayout from "../components/layout/AppLayout";
import {
  getCompletedWorks,
  type CompletedWork,
} from "../api/mpladsApi";
import {
  calculateWorksRisk,
  type WorkRisk,
} from "../utils/riskEngine";

type InsightType =
  | "critical"
  | "financial"
  | "data"
  | "location"
  | "timeline";

interface Insight {
  type: InsightType;
  title: string;
  summary: string;
  recommendation: string;
  metric: string;
  icon: typeof AlertTriangle;
}

function formatCurrency(value: number) {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  }

  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)} L`;
  }

  return `₹${value.toLocaleString("en-IN")}`;
}

function InsightCard({
  insight,
}: {
  insight: Insight;
}) {
  const Icon = insight.icon;

  const styles = {
    critical: {
      border: "border-red-500/20",
      icon: "text-red-400",
      badge: "bg-red-500/10 text-red-400",
    },
    financial: {
      border: "border-amber-500/20",
      icon: "text-amber-400",
      badge: "bg-amber-500/10 text-amber-400",
    },
    data: {
      border: "border-blue-500/20",
      icon: "text-blue-400",
      badge: "bg-blue-500/10 text-blue-400",
    },
    location: {
      border: "border-violet-500/20",
      icon: "text-violet-400",
      badge: "bg-violet-500/10 text-violet-400",
    },
    timeline: {
      border: "border-cyan-500/20",
      icon: "text-cyan-400",
      badge: "bg-cyan-500/10 text-cyan-400",
    },
  }[insight.type];

  return (
    <div
      className={`rounded-xl border ${styles.border} bg-[#0c1016] p-5`}
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] ${styles.icon}`}
        >
          <Icon size={19} />
        </div>

        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${styles.badge}`}
        >
          AI Signal
        </span>
      </div>

      <h3 className="mt-4 text-sm font-semibold text-white">
        {insight.title}
      </h3>

      <p className="mt-2 text-xs leading-5 text-slate-400">
        {insight.summary}
      </p>

      <div className="mt-4 rounded-lg border border-white/[0.05] bg-black/20 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
          Recommended Action
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-300">
          {insight.recommendation}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/[0.05] pt-3">
        <span className="text-[10px] uppercase tracking-wider text-slate-600">
          Signal Metric
        </span>

        <span className="text-xs font-semibold text-slate-200">
          {insight.metric}
        </span>
      </div>
    </div>
  );
}

function WorkRiskRow({
  item,
}: {
  item: WorkRisk;
}) {
  const levelStyles = {
    CRITICAL: "text-red-400 bg-red-500/10",
    HIGH: "text-orange-400 bg-orange-500/10",
    MEDIUM: "text-amber-400 bg-amber-500/10",
    LOW: "text-emerald-400 bg-emerald-500/10",
  };

  return (
    <div className="grid grid-cols-[1fr_150px_100px] gap-4 border-b border-white/[0.05] px-5 py-4 last:border-0">
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-slate-200">
          {item.work.work_description}
        </p>

        <p className="mt-1 text-[10px] text-slate-600">
          Work ID: {item.work.work_id} ·{" "}
          {item.work.district || "District unavailable"}
        </p>
      </div>

      <div className="flex items-center">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-blue-500"
            style={{
              width: `${item.score}%`,
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-end">
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${levelStyles[item.level]}`}
        >
          {item.level} · {item.score}
        </span>
      </div>
    </div>
  );
}

export default function AIInsightsPage() {
  const [works, setWorks] = useState<CompletedWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getCompletedWorks(
        "Maharashtra",
        1,
        50,
      );

      setWorks(result);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load MPLADS data.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const riskResults = useMemo(
    () => calculateWorksRisk(works),
    [works],
  );

  const statistics = useMemo(() => {
    const critical = riskResults.filter(
      (item) => item.level === "CRITICAL",
    ).length;

    const high = riskResults.filter(
      (item) => item.level === "HIGH",
    ).length;

    const auditWatch = works.filter(
      (work) => Number(work.cost || 0) >= 1500000,
    ).length;

    const beneficiaryFlags = works.filter(
      (work) => Number(work.beneficiaries || 0) === 0,
    ).length;

    const locationFlags = works.filter(
      (work) =>
        !work.location ||
        !work.district,
    ).length;

    const timelineFlags = works.filter(
      (work) => {
        if (!work.completion_date) {
          return true;
        }

        const date = new Date(
          work.completion_date,
        );

        return (
          Number.isNaN(date.getTime()) ||
          date.getTime() > Date.now()
        );
      },
    ).length;

    const highValueExposure = works
      .filter(
        (work) =>
          Number(work.cost || 0) >= 2500000,
      )
      .reduce(
        (sum, work) =>
          sum + Number(work.cost || 0),
        0,
      );

    return {
      critical,
      high,
      auditWatch,
      beneficiaryFlags,
      locationFlags,
      timelineFlags,
      highValueExposure,
    };
  }, [riskResults, works]);

  const insights = useMemo<Insight[]>(() => {
    const result: Insight[] = [];

    if (statistics.critical > 0) {
      result.push({
        type: "critical",
        title: "Critical verification signals detected",
        summary: `${statistics.critical} project${statistics.critical === 1 ? "" : "s"} currently meet the highest risk band under the explainable monitoring engine.`,
        recommendation:
          "Prioritize these works for supporting-document review and physical verification.",
        metric: `${statistics.critical} critical`,
        icon: ShieldAlert,
      });
    }

    if (statistics.auditWatch > 0) {
      result.push({
        type: "financial",
        title: "High-value works require enhanced attention",
        summary: `${statistics.auditWatch} loaded works fall at or above the ₹15 lakh monitoring threshold used by this prototype.`,
        recommendation:
          "Review estimates, sanction details, expenditure records and audit coverage for these works.",
        metric: `${statistics.auditWatch} works`,
        icon: IndianRupee,
      });
    }

    if (statistics.beneficiaryFlags > 0) {
      result.push({
        type: "data",
        title: "Beneficiary data quality needs review",
        summary: `${statistics.beneficiaryFlags} loaded records report zero beneficiaries. Zero may be valid for some asset types, but the field should be verified rather than treated as proof of irregularity.`,
        recommendation:
          "Cross-check beneficiary or community-impact information with the underlying work documentation.",
        metric: `${statistics.beneficiaryFlags} records`,
        icon: Database,
      });
    }

    if (statistics.locationFlags > 0) {
      result.push({
        type: "location",
        title: "Location metadata requires validation",
        summary: `${statistics.locationFlags} loaded records have incomplete district or location information.`,
        recommendation:
          "Validate location fields before using these records for geospatial analysis or field-verification planning.",
        metric: `${statistics.locationFlags} records`,
        icon: MapPin,
      });
    }

    if (statistics.timelineFlags > 0) {
      result.push({
        type: "timeline",
        title: "Completion timeline anomalies found",
        summary: `${statistics.timelineFlags} loaded records have missing, invalid or future-dated completion information.`,
        recommendation:
          "Verify completion certificates and project-status records before closing the monitoring cycle.",
        metric: `${statistics.timelineFlags} records`,
        icon: Clock3,
      });
    }

    if (result.length === 0) {
      result.push({
        type: "data",
        title: "No immediate intelligence signals",
        summary:
          "The currently loaded records did not trigger the configured monitoring rules.",
        recommendation:
          "Continue routine monitoring and refresh the dataset as new work records become available.",
        metric: "No active flags",
        icon: CheckCircle2,
      });
    }

    return result;
  }, [statistics]);

  const averageRisk = useMemo(() => {
    if (!riskResults.length) {
      return 0;
    }

    return Math.round(
      riskResults.reduce(
        (sum, item) => sum + item.score,
        0,
      ) / riskResults.length,
    );
  }, [riskResults]);

  return (
    <AppLayout>
      <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Sparkles
              size={14}
              className="text-blue-400"
            />

            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-400">
              AI Intelligence Layer
            </p>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-white">
            AI Insights
          </h1>

          <p className="mt-1 text-xs text-slate-500">
            Explainable intelligence generated from live MPLADS
            work records and risk signals.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="flex w-fit items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/[0.06] disabled:opacity-50"
        >
          <RefreshCw
            size={14}
            className={loading ? "animate-spin" : ""}
          />
          Refresh Intelligence
        </button>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.06] p-4">
          <AlertTriangle
            size={18}
            className="text-red-400"
          />

          <div>
            <p className="text-xs font-semibold text-red-300">
              Intelligence feed unavailable
            </p>

            <p className="mt-1 text-[11px] text-red-400/70">
              {error}
            </p>
          </div>
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-red-500/15 bg-[#0c1016] p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Critical Signals
            </span>

            <ShieldAlert
              size={16}
              className="text-red-400"
            />
          </div>

          <p className="mt-3 text-2xl font-semibold text-white">
            {loading ? "—" : statistics.critical}
          </p>

          <p className="mt-1 text-[10px] text-slate-600">
            Immediate verification priority
          </p>
        </div>

        <div className="rounded-xl border border-orange-500/15 bg-[#0c1016] p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              High Signals
            </span>

            <TrendingUp
              size={16}
              className="text-orange-400"
            />
          </div>

          <p className="mt-3 text-2xl font-semibold text-white">
            {loading ? "—" : statistics.high}
          </p>

          <p className="mt-1 text-[10px] text-slate-600">
            Enhanced review priority
          </p>
        </div>

        <div className="rounded-xl border border-amber-500/15 bg-[#0c1016] p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Audit Watch
            </span>

            <FileWarning
              size={16}
              className="text-amber-400"
            />
          </div>

          <p className="mt-3 text-2xl font-semibold text-white">
            {loading ? "—" : statistics.auditWatch}
          </p>

          <p className="mt-1 text-[10px] text-slate-600">
            Works ≥ ₹15 lakh
          </p>
        </div>

        <div className="rounded-xl border border-blue-500/15 bg-[#0c1016] p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Average Risk
            </span>

            <BrainCircuit
              size={16}
              className="text-blue-400"
            />
          </div>

          <p className="mt-3 text-2xl font-semibold text-white">
            {loading ? "—" : averageRisk}
          </p>

          <p className="mt-1 text-[10px] text-slate-600">
            Explainable score / 100
          </p>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-blue-500/15 bg-blue-500/[0.035] p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
            <BrainCircuit size={20} />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-white">
              Explainable AI Monitoring
            </h2>

            <p className="mt-1 max-w-4xl text-xs leading-5 text-slate-400">
              Sentinel combines live MPLADS records with
              transparent risk rules to surface financial,
              compliance, timeline and data-quality signals.
              Each signal is explainable and intended for
              verification — it is not a finding of fraud or
              wrongdoing.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">
              Priority Intelligence
            </h2>

            <p className="mt-1 text-[11px] text-slate-600">
              Highest-value signals from the current monitoring
              dataset
            </p>
          </div>

          <span className="text-[10px] uppercase tracking-wider text-slate-600">
            Maharashtra · Live Feed
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-56 animate-pulse rounded-xl border border-white/[0.05] bg-[#0c1016]"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {insights.map((insight) => (
              <InsightCard
                key={`${insight.type}-${insight.title}`}
                insight={insight}
              />
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_330px]">
        <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#0c1016]">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-white">
                Highest Priority Works
              </h2>

              <p className="mt-1 text-[10px] text-slate-600">
                Ranked using the explainable risk engine
              </p>
            </div>

            <span className="rounded-full bg-white/[0.04] px-2.5 py-1 text-[10px] text-slate-500">
              Top 5
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-600">
              Loading intelligence...
            </div>
          ) : riskResults.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle2
                size={24}
                className="mx-auto text-emerald-400"
              />

              <p className="mt-3 text-xs text-slate-400">
                No project records available.
              </p>
            </div>
          ) : (
            riskResults
              .slice(0, 5)
              .map((item) => (
                <WorkRiskRow
                  key={item.work.id}
                  item={item}
                />
              ))
          )}
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-[#0c1016] p-5">
          <div className="flex items-center gap-3">
            <IndianRupee
              size={17}
              className="text-amber-400"
            />

            <div>
              <h2 className="text-sm font-semibold text-white">
                Financial Exposure
              </h2>

              <p className="text-[10px] text-slate-600">
                High-value projects
              </p>
            </div>
          </div>

          <p className="mt-6 text-3xl font-semibold text-white">
            {loading
              ? "—"
              : formatCurrency(
                  statistics.highValueExposure,
                )}
          </p>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            Combined recorded cost of loaded works at or above
            ₹25 lakh.
          </p>

          <div className="mt-6 border-t border-white/[0.05] pt-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-slate-600">
                Data quality flags
              </span>

              <span className="text-xs font-semibold text-blue-400">
                {loading
                  ? "—"
                  : statistics.beneficiaryFlags +
                    statistics.locationFlags +
                    statistics.timelineFlags}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Beneficiary fields
                </span>

                <span className="text-xs text-slate-300">
                  {statistics.beneficiaryFlags}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Location fields
                </span>

                <span className="text-xs text-slate-300">
                  {statistics.locationFlags}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Timeline fields
                </span>

                <span className="text-xs text-slate-300">
                  {statistics.timelineFlags}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-xl border border-white/[0.05] bg-[#090d12] p-4">
        <AlertTriangle
          size={15}
          className="mt-0.5 shrink-0 text-slate-600"
        />

        <p className="text-[10px] leading-5 text-slate-600">
          Sentinel intelligence is a decision-support layer.
          Risk scores and AI signals identify records that
          deserve verification; they do not establish fraud,
          corruption or non-compliance on their own.
        </p>
      </div>
    </AppLayout>
  );
}