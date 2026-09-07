import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";import {
  MapPin,
  Building2,
  IndianRupee,
  Users,
  AlertTriangle,
  Activity,
  RefreshCw,
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

export default function GeoIntelligencePage() {
  const [works, setWorks] = useState<CompletedWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getCompletedWorks(
        "Maharashtra",
        1,
        50,
      );

      setWorks(data);
    } catch (err) {
      console.error(err);
      setError(
        "Unable to load live geographical intelligence.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const riskData = useMemo(
    () => calculateWorksRisk(works),
    [works],
  );

  const districtData = useMemo(() => {
    const map = new Map<
      string,
      {
        district: string;
        works: number;
        expenditure: number;
        beneficiaries: number;
        risk: number;
      }
    >();

    works.forEach((work) => {
      const district =
        work.district?.trim() || "Unknown";

      const existing = map.get(district);

      const workRisk =
        riskData.find(
          (item) => item.work.id === work.id,
        );

      if (existing) {
        existing.works += 1;
        existing.expenditure += Number(
          work.cost || 0,
        );
        existing.beneficiaries += Number(
          work.beneficiaries || 0,
        );
        existing.risk += workRisk?.score || 0;
      } else {
        map.set(district, {
          district,
          works: 1,
          expenditure: Number(work.cost || 0),
          beneficiaries: Number(
            work.beneficiaries || 0,
          ),
          risk: workRisk?.score || 0,
        });
      }
    });

    return Array.from(map.values()).sort(
      (a, b) => b.works - a.works,
    );
  }, [works, riskData]);

  const totalExpenditure = works.reduce(
    (sum, work) =>
      sum + Number(work.cost || 0),
    0,
  );

  const totalBeneficiaries = works.reduce(
    (sum, work) =>
      sum + Number(work.beneficiaries || 0),
    0,
  );

  const highRiskWorks = riskData.filter(
    (item) =>
      item.level === "HIGH" ||
      item.level === "CRITICAL",
  ).length;

  const maxWorks = Math.max(
    ...districtData.map(
      (item) => item.works,
    ),
    1,
  );

  return (
    <AppLayout>
      {/* HEADER */}
      <div className="mb-7 flex items-end justify-between">
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-400">
            Geographic Intelligence
          </p>

          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Geo Intelligence
          </h1>

          <p className="mt-1 text-xs text-slate-500">
            District-level concentration, expenditure and
            risk intelligence for Maharashtra.
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-slate-300 transition hover:bg-white/[0.06]"
        >
          <RefreshCw
            size={14}
            className={
              loading ? "animate-spin" : ""
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

      {error && (
        <div className="mb-6 rounded-xl border border-red-400/20 bg-red-400/[0.05] p-4 text-xs text-red-300">
          {error}
        </div>
      )}

      {/* KPI CARDS */}
      <div className="mb-7 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={<MapPin size={17} />}
          label="Districts Covered"
          value={districtData.length}
          color="cyan"
        />

        <MetricCard
          icon={<Building2 size={17} />}
          label="Works Mapped"
          value={works.length}
          color="blue"
        />

        <MetricCard
          icon={<IndianRupee size={17} />}
          label="Mapped Expenditure"
          value={formatCurrency(
            totalExpenditure,
          )}
          color="emerald"
        />

        <MetricCard
          icon={<AlertTriangle size={17} />}
          label="High/Critical Signals"
          value={highRiskWorks}
          color="amber"
        />
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.5fr_1fr]">
        {/* DISTRICT CONCENTRATION */}
        <section className="rounded-xl border border-white/[0.06] bg-[#0c1016] p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">
                District Project Concentration
              </h2>

              <p className="mt-1 text-[11px] text-slate-500">
                Completed works by district
              </p>
            </div>

            <Activity
              size={17}
              className="text-cyan-400"
            />
          </div>

          {loading ? (
            <LoadingState />
          ) : districtData.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-4">
              {districtData.map(
                (district, index) => {
                  const width =
                    (district.works /
                      maxWorks) *
                    100;

                  return (
                    <div
                      key={district.district}
                    >
                      <div className="mb-1.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 text-[10px] text-slate-600">
                            {String(
                              index + 1,
                            ).padStart(2, "0")}
                          </span>

                          <span className="text-xs font-medium text-slate-300">
                            {district.district}
                          </span>
                        </div>

                        <span className="text-[11px] text-slate-500">
                          {district.works} works
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-white/[0.04]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
                          style={{
                            width: `${width}%`,
                          }}
                        />
                      </div>

                      <div className="mt-1.5 flex justify-between text-[10px] text-slate-600">
                        <span>
                          {formatCurrency(
                            district.expenditure,
                          )}
                        </span>

                        <span>
                          {district.beneficiaries.toLocaleString()} beneficiaries
                        </span>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          )}
        </section>

        {/* GEOGRAPHIC SIGNALS */}
        <section className="rounded-xl border border-white/[0.06] bg-[#0c1016] p-5">
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-white">
              Geographic Signals
            </h2>

            <p className="mt-1 text-[11px] text-slate-500">
              Areas requiring closer monitoring
            </p>
          </div>

          <div className="space-y-3">
            {districtData
              .slice()
              .sort(
                (a, b) =>
                  b.risk - a.risk,
              )
              .slice(0, 6)
              .map((district) => {
                const avgRisk =
                  district.works > 0
                    ? Math.round(
                        district.risk /
                          district.works,
                      )
                    : 0;

                const riskLabel =
                  avgRisk >= 45
                    ? "HIGH"
                    : avgRisk >= 20
                      ? "MEDIUM"
                      : "LOW";

                return (
                  <div
                    key={district.district}
                    className="rounded-lg border border-white/[0.05] bg-white/[0.02] p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin
                          size={14}
                          className="text-cyan-400"
                        />

                        <span className="text-xs font-medium text-slate-300">
                          {district.district}
                        </span>
                      </div>

                      <RiskBadge
                        level={riskLabel}
                      />
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <MiniStat
                        label="Works"
                        value={
                          district.works
                        }
                      />

                      <MiniStat
                        label="Risk"
                        value={`${avgRisk}`}
                      />

                      <MiniStat
                        label="Spend"
                        value={formatShortCurrency(
                          district.expenditure,
                        )}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      </div>

      {/* COVERAGE */}
      <section className="mt-5 rounded-xl border border-white/[0.06] bg-[#0c1016] p-5">
        <div className="mb-5">
          <h2 className="text-sm font-semibold text-white">
            Geographic Coverage
          </h2>

          <p className="mt-1 text-[11px] text-slate-500">
            Current dataset coverage and monitoring indicators
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <CoverageCard
            icon={<MapPin size={16} />}
            title="Spatial Coverage"
            value={`${districtData.length} districts`}
            description="District information available in loaded records."
          />

          <CoverageCard
            icon={<Users size={16} />}
            title="Beneficiary Mapping"
            value={totalBeneficiaries.toLocaleString()}
            description="Reported beneficiaries across loaded works."
          />

          <CoverageCard
            icon={<AlertTriangle size={16} />}
            title="Risk Coverage"
            value={`${highRiskWorks} signals`}
            description="High or critical risk signals requiring verification."
          />
        </div>
      </section>

      {/* DISCLAIMER */}
      <div className="mt-5 rounded-xl border border-amber-400/10 bg-amber-400/[0.025] p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">
          Monitoring Note
        </p>

        <p className="mt-1 text-[11px] leading-5 text-slate-500">
          Geographic signals are analytical indicators generated
          from available MPLADS records. They identify areas for
          verification and do not constitute findings of fraud or
          misconduct.
        </p>
      </div>
    </AppLayout>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function MetricCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: "cyan" | "blue" | "emerald" | "amber";
}) {
  const colorMap = {
    cyan: "text-cyan-400 bg-cyan-400/10",
    blue: "text-blue-400 bg-blue-400/10",
    emerald:
      "text-emerald-400 bg-emerald-400/10",
    amber: "text-amber-400 bg-amber-400/10",
  };

  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0c1016] p-4">
      <div className="mb-4 flex items-center justify-between">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${colorMap[color]}`}
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

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div>
      <p className="text-[9px] uppercase text-slate-600">
        {label}
      </p>

      <p className="mt-0.5 text-[11px] font-medium text-slate-300">
        {value}
      </p>
    </div>
  );
}

function RiskBadge({
  level,
}: {
  level: string;
}) {
  const styles =
    level === "HIGH"
      ? "bg-red-400/10 text-red-400"
      : level === "MEDIUM"
        ? "bg-amber-400/10 text-amber-400"
        : "bg-emerald-400/10 text-emerald-400";

  return (
    <span
      className={`rounded-full px-2 py-1 text-[9px] font-semibold ${styles}`}
    >
      {level}
    </span>
  );
}

function CoverageCard({
  icon,
  title,
  value,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-white/[0.05] bg-white/[0.02] p-4">
      <div className="mb-3 flex items-center gap-2 text-cyan-400">
        {icon}

        <span className="text-xs font-medium text-slate-300">
          {title}
        </span>
      </div>

      <p className="text-lg font-semibold text-white">
        {value}
      </p>

      <p className="mt-1 text-[10px] leading-4 text-slate-600">
        {description}
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex h-64 items-center justify-center text-xs text-slate-600">
      Loading geographical intelligence...
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-64 items-center justify-center text-xs text-slate-600">
      No geographical records available.
    </div>
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

function formatShortCurrency(
  value: number,
) {
  if (value >= 10000000) {
    return `₹${(
      value / 10000000
    ).toFixed(1)}Cr`;
  }

  if (value >= 100000) {
    return `₹${(
      value / 100000
    ).toFixed(1)}L`;
  }

  return `₹${Math.round(
    value / 1000,
  )}K`;
}