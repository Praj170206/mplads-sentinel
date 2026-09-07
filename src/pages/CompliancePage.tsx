import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  FileWarning,
  IndianRupee,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";

import AppLayout from "../components/layout/AppLayout";
import {
  getCompletedWorks,
  type CompletedWork,
} from "../api/mpladsApi";

/* =========================================================
   TYPES
========================================================= */

type ComplianceStatus =
  | "COMPLIANT"
  | "REVIEW"
  | "CRITICAL";

interface ComplianceCheck {
  title: string;
  description: string;
  status: ComplianceStatus;
  points: number;
}

interface WorkCompliance {
  work: CompletedWork;
  score: number;
  status: ComplianceStatus;
  checks: ComplianceCheck[];
  recommendation: string;
}

/* =========================================================
   COMPLIANCE ENGINE
========================================================= */

function calculateCompliance(
  work: CompletedWork,
): WorkCompliance {
  const checks: ComplianceCheck[] = [];

  const cost = Number(work.cost || 0);
  const beneficiaries = Number(
    work.beneficiaries || 0,
  );

  /*
   * Cost-based audit coverage.
   *
   * This is treated as a monitoring rule rather than
   * a finding of non-compliance.
   */
  if (cost >= 2500000) {
    checks.push({
      title: "Mandatory Audit Watch",
      description:
        "Work cost is ₹25 lakh or above and should receive mandatory physical-audit attention.",
      status: "REVIEW",
      points: 20,
    });
  } else {
    checks.push({
      title: "Cost Threshold",
      description:
        "Recorded work cost is below the ₹25 lakh audit-watch threshold.",
      status: "COMPLIANT",
      points: 0,
    });
  }

  /* Beneficiary data */
  if (beneficiaries <= 0) {
    checks.push({
      title: "Beneficiary Information",
      description:
        "The public record reports zero beneficiaries. Supporting records should be checked.",
      status: "REVIEW",
      points: 20,
    });
  } else {
    checks.push({
      title: "Beneficiary Information",
      description:
        "Beneficiary information is present in the returned record.",
      status: "COMPLIANT",
      points: 0,
    });
  }

  /* Location */
  if (
    !work.district ||
    !work.location
  ) {
    checks.push({
      title: "Location Mapping",
      description:
        "District or location information is incomplete.",
      status: "CRITICAL",
      points: 30,
    });
  } else {
    checks.push({
      title: "Location Mapping",
      description:
        "District and location information are available.",
      status: "COMPLIANT",
      points: 0,
    });
  }

  /* MP mapping */
  if (
    !work.mp_details?.name ||
    !work.mp_details?.constituency
  ) {
    checks.push({
      title: "MP / Constituency Mapping",
      description:
        "MP or constituency information is incomplete.",
      status: "CRITICAL",
      points: 30,
    });
  } else {
    checks.push({
      title: "MP / Constituency Mapping",
      description:
        "MP and constituency information are available.",
      status: "COMPLIANT",
      points: 0,
    });
  }

  /* Completion date */
  if (!work.completion_date) {
    checks.push({
      title: "Completion Record",
      description:
        "No completion date is available in the returned record.",
      status: "CRITICAL",
      points: 30,
    });
  } else {
    const completionDate = new Date(
      work.completion_date,
    );

    if (
      Number.isNaN(
        completionDate.getTime(),
      )
    ) {
      checks.push({
        title: "Completion Record",
        description:
          "The completion date could not be interpreted as a valid date.",
        status: "CRITICAL",
        points: 30,
      });
    } else if (
      completionDate.getTime() >
      Date.now()
    ) {
      checks.push({
        title: "Completion Record",
        description:
          "Recorded completion date is later than the current date and requires verification.",
        status: "CRITICAL",
        points: 40,
      });
    } else {
      checks.push({
        title: "Completion Record",
        description:
          "A valid completion date is available.",
        status: "COMPLIANT",
        points: 0,
      });
    }
  }

  const score = Math.min(
    100,
    checks.reduce(
      (sum, check) =>
        sum + check.points,
      0,
    ),
  );

  let status: ComplianceStatus =
    "COMPLIANT";

  if (
    checks.some(
      (check) =>
        check.status === "CRITICAL",
    )
  ) {
    status = "CRITICAL";
  } else if (
    checks.some(
      (check) =>
        check.status === "REVIEW",
    )
  ) {
    status = "REVIEW";
  }

  let recommendation =
    "No immediate compliance action required.";

  if (status === "REVIEW") {
    recommendation =
      "Review the flagged fields and supporting documents.";
  }

  if (status === "CRITICAL") {
    recommendation =
      "Prioritize document verification and physical validation.";
  }

  return {
    work,
    score,
    status,
    checks,
    recommendation,
  };
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function CompliancePage() {
  const [works, setWorks] = useState<
    CompletedWork[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [selectedWork, setSelectedWork] =
    useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await getCompletedWorks(
          "Maharashtra",
          1,
          50,
        );

      setWorks(data);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to load live compliance data.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const complianceData =
    useMemo(
      () =>
        works
          .map(calculateCompliance)
          .sort(
            (a, b) =>
              b.score - a.score,
          ),
      [works],
    );

  const compliantCount =
    complianceData.filter(
      (item) =>
        item.status ===
        "COMPLIANT",
    ).length;

  const reviewCount =
    complianceData.filter(
      (item) =>
        item.status ===
        "REVIEW",
    ).length;

  const criticalCount =
    complianceData.filter(
      (item) =>
        item.status ===
        "CRITICAL",
    ).length;

  const averageCompliance =
    complianceData.length > 0
      ? Math.round(
          complianceData.reduce(
            (sum, item) =>
              sum + item.score,
            0,
          ) /
            complianceData.length,
        )
      : 0;

  const auditWatchCount =
    complianceData.filter(
      (item) =>
        Number(
          item.work.cost || 0,
        ) >= 2500000,
    ).length;

  return (
    <AppLayout>
      {/* HEADER */}
      <div className="mb-7 flex items-end justify-between">
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-400">
            Governance Intelligence
          </p>

          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Compliance
          </h1>

          <p className="mt-1 text-xs text-slate-500">
            Rule-based compliance and verification
            monitoring across live MPLADS works.
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-slate-300 transition hover:bg-white/[0.06]"
        >
          <RefreshCw
            size={14}
            className={
              loading
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>
      </div>

      {/* LIVE STATUS */}
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-400/10 bg-emerald-400/[0.03] px-4 py-3">
        <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />

        <span className="text-xs font-medium text-emerald-300">
          LIVE DATA
        </span>

        <span className="text-xs text-slate-500">
          Maharashtra MPLADS completed works
        </span>

        <span className="ml-auto text-[10px] text-slate-600">
          {works.length} records loaded
        </span>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/[0.05] p-4 text-xs text-red-300">
          <AlertTriangle size={15} />
          {error}
        </div>
      )}

      {/* KPI CARDS */}
      <div className="mb-7 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          icon={
            <ShieldCheck size={17} />
          }
          label="Compliant"
          value={compliantCount}
          color="emerald"
        />

        <MetricCard
          icon={
            <FileWarning size={17} />
          }
          label="Review Required"
          value={reviewCount}
          color="amber"
        />

        <MetricCard
          icon={
            <AlertTriangle size={17} />
          }
          label="Critical"
          value={criticalCount}
          color="red"
        />

        <MetricCard
          icon={
            <ClipboardCheck size={17} />
          }
          label="Audit Watch"
          value={auditWatchCount}
          color="violet"
        />

        <MetricCard
          icon={
            <ActivityIcon />
          }
          label="Avg. Issue Score"
          value={`${averageCompliance}%`}
          color="blue"
        />
      </div>

      {/* SUMMARY PANEL */}
      <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-[1fr_1.5fr]">
        {/* SCORE */}
        <section className="rounded-xl border border-white/[0.06] bg-[#0c1016] p-5">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">
                Compliance Overview
              </h2>

              <p className="mt-1 text-[11px] text-slate-500">
                Verification status across loaded records
              </p>
            </div>

            <ShieldCheck
              size={18}
              className="text-violet-400"
            />
          </div>

          <div className="flex items-center gap-7">
            <div className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full border-[10px] border-white/[0.04]">
              <div className="absolute inset-0 rounded-full border-[10px] border-violet-500/70" />

              <div className="text-center">
                <p className="text-2xl font-semibold text-white">
                  {complianceData.length >
                  0
                    ? Math.max(
                        0,
                        100 -
                          averageCompliance,
                      )
                    : 0}
                  %
                </p>

                <p className="text-[9px] uppercase tracking-wider text-slate-600">
                  Issue Index
                </p>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <StatusLine
                label="Compliant"
                value={
                  compliantCount
                }
                color="bg-emerald-400"
              />

              <StatusLine
                label="Review Required"
                value={
                  reviewCount
                }
                color="bg-amber-400"
              />

              <StatusLine
                label="Critical"
                value={
                  criticalCount
                }
                color="bg-red-400"
              />
            </div>
          </div>
        </section>

        {/* RULES */}
        <section className="rounded-xl border border-white/[0.06] bg-[#0c1016] p-5">
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-white">
              Active Compliance Checks
            </h2>

            <p className="mt-1 text-[11px] text-slate-500">
              Automated checks applied to available public records
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <RuleCard
              icon={
                <IndianRupee size={15} />
              }
              title="Cost Threshold"
              description="Identifies works requiring enhanced audit attention based on recorded cost."
            />

            <RuleCard
              icon={
                <Users size={15} />
              }
              title="Beneficiary Data"
              description="Checks whether beneficiary information is present in the record."
            />

            <RuleCard
              icon={
                <MapIcon />
              }
              title="Location Mapping"
              description="Checks district and location availability."
            />

            <RuleCard
              icon={
                <ClipboardCheck size={15} />
              }
              title="Completion Record"
              description="Validates availability and basic consistency of completion dates."
            />
          </div>
        </section>
      </div>

      {/* WORK TABLE */}
      <section className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#0c1016]">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-white">
              Work-level Compliance
            </h2>

            <p className="mt-1 text-[11px] text-slate-500">
              Highest verification priorities appear first
            </p>
          </div>

          <span className="rounded-full bg-white/[0.04] px-3 py-1 text-[10px] text-slate-500">
            {complianceData.length} records
          </span>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center text-xs text-slate-600">
            Running compliance checks...
          </div>
        ) : complianceData.length ===
          0 ? (
          <div className="flex h-64 items-center justify-center text-xs text-slate-600">
            No compliance records available.
          </div>
        ) : (
          <div>
            {complianceData
              .slice(0, 20)
              .map((item) => {
                const isOpen =
                  selectedWork ===
                  item.work.id;

                return (
                  <div
                    key={item.work.id}
                    className="border-b border-white/[0.04] last:border-b-0"
                  >
                    <button
                      onClick={() =>
                        setSelectedWork(
                          isOpen
                            ? null
                            : item.work.id,
                        )
                      }
                      className="w-full px-5 py-4 text-left transition hover:bg-white/[0.02]"
                    >
                      <div className="grid grid-cols-[1fr_auto_auto] items-center gap-5">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-slate-300">
                            {
                              item.work
                                .work_description
                            }
                          </p>

                          <p className="mt-1 text-[10px] text-slate-600">
                            {
                              item.work
                                .district
                            }{" "}
                            ·{" "}
                            {
                              item.work
                                .mp_details
                                ?.constituency
                            }
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xs font-medium text-slate-300">
                            {formatCurrency(
                              Number(
                                item.work
                                  .cost ||
                                  0,
                              ),
                            )}
                          </p>

                          <p className="mt-1 text-[9px] text-slate-600">
                            Issue score{" "}
                            {item.score}
                          </p>
                        </div>

                        <StatusBadge
                          status={
                            item.status
                          }
                        />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="border-t border-white/[0.04] bg-black/10 px-5 py-5">
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          {item.checks.map(
                            (
                              check,
                              index,
                            ) => (
                              <CheckRow
                                key={`${item.work.id}-${index}`}
                                check={
                                  check
                                }
                              />
                            ),
                          )}
                        </div>

                        <div className="mt-4 rounded-lg border border-blue-400/10 bg-blue-400/[0.025] p-3">
                          <p className="text-[9px] font-semibold uppercase tracking-wider text-blue-400">
                            Recommended Action
                          </p>

                          <p className="mt-1 text-[11px] text-slate-400">
                            {
                              item.recommendation
                            }
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </section>

      {/* NOTE */}
      <div className="mt-5 rounded-xl border border-amber-400/10 bg-amber-400/[0.025] p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">
          Compliance Note
        </p>

        <p className="mt-1 text-[11px] leading-5 text-slate-500">
          Compliance indicators are generated from fields
          available in the public MPLADS dataset. A review or
          critical signal indicates that supporting records or
          physical status should be verified; it is not, by itself,
          a finding of fraud, misconduct or non-compliance.
        </p>
      </div>
    </AppLayout>
  );
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function MetricCard({
  icon,
  label,
  value,
  color,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  color:
    | "emerald"
    | "amber"
    | "red"
    | "violet"
    | "blue";
}) {
  const styles = {
    emerald:
      "bg-emerald-400/10 text-emerald-400",
    amber:
      "bg-amber-400/10 text-amber-400",
    red:
      "bg-red-400/10 text-red-400",
    violet:
      "bg-violet-400/10 text-violet-400",
    blue:
      "bg-blue-400/10 text-blue-400",
  };

  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0c1016] p-4">
      <div className="mb-4 flex items-center justify-between">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${styles[color]}`}
        >
          {icon}
        </div>

        <span className="text-[9px] uppercase tracking-wider text-slate-600">
          Live
        </span>
      </div>

      <p className="text-[10px] uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-xl font-semibold text-white">
        {value}
      </p>
    </div>
  );
}

function StatusLine({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span
          className={`h-2 w-2 rounded-full ${color}`}
        />

        <span className="text-[11px] text-slate-400">
          {label}
        </span>
      </div>

      <span className="text-xs font-semibold text-slate-300">
        {value}
      </span>
    </div>
  );
}

function RuleCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-white/[0.05] bg-white/[0.02] p-3">
      <div className="mb-2 flex items-center gap-2 text-violet-400">
        {icon}

        <span className="text-xs font-medium text-slate-300">
          {title}
        </span>
      </div>

      <p className="text-[10px] leading-4 text-slate-600">
        {description}
      </p>
    </div>
  );
}

function CheckRow({
  check,
}: {
  check: ComplianceCheck;
}) {
  const isCritical =
    check.status === "CRITICAL";

  const isReview =
    check.status === "REVIEW";

  return (
    <div className="rounded-lg border border-white/[0.05] bg-white/[0.02] p-3">
      <div className="flex items-start gap-3">
        {isCritical ? (
          <AlertTriangle
            size={15}
            className="mt-0.5 shrink-0 text-red-400"
          />
        ) : isReview ? (
          <FileWarning
            size={15}
            className="mt-0.5 shrink-0 text-amber-400"
          />
        ) : (
          <CheckCircle2
            size={15}
            className="mt-0.5 shrink-0 text-emerald-400"
          />
        )}

        <div>
          <p className="text-xs font-medium text-slate-300">
            {check.title}
          </p>

          <p className="mt-1 text-[10px] leading-4 text-slate-600">
            {check.description}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: ComplianceStatus;
}) {
  const config = {
    COMPLIANT: {
      label: "COMPLIANT",
      style:
        "bg-emerald-400/10 text-emerald-400",
    },

    REVIEW: {
      label: "REVIEW",
      style:
        "bg-amber-400/10 text-amber-400",
    },

    CRITICAL: {
      label: "CRITICAL",
      style:
        "bg-red-400/10 text-red-400",
    },
  };

  const item = config[status];

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[9px] font-semibold ${item.style}`}
    >
      {item.label}
    </span>
  );
}

function ActivityIcon() {
  return (
    <div className="h-4 w-4 rounded-full border-2 border-blue-400/70" />
  );
}

function MapIcon() {
  return (
    <div className="h-3.5 w-3.5 rounded-full border border-violet-400/70" />
  );
}

function formatCurrency(
  value: number,
) {
  if (value >= 10000000) {
    return `₹${(
      value / 10000000
    ).toFixed(2)} Cr`;
  }

  if (value >= 100000) {
    return `₹${(
      value / 100000
    ).toFixed(2)} L`;
  }

  return `₹${value.toLocaleString(
    "en-IN",
  )}`;
}