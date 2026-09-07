import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  IndianRupee,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import AppLayout from "../components/layout/AppLayout";
import {
  getStateSummaries,
  type StateSummary,
} from "../api/mpladsApi";

const CHART_COLORS = [
  "#3B82F6", // Blue
  "#06B6D4", // Cyan
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#8B5CF6", // Violet
  "#EC4899", // Pink
  "#EF4444", // Red
  "#14B8A6", // Teal
];

function formatCurrency(value: number) {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  }

  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)} L`;
  }

  return `₹${value.toLocaleString("en-IN")}`;
}

function formatNumber(value: number) {
  return value.toLocaleString("en-IN");
}

export default function AnalyticsPage() {
  const [states, setStates] = useState<StateSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getStateSummaries();

      setStates(result);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load analytics data.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const analytics = useMemo(() => {
    const totalAllocated = states.reduce(
      (sum, state) =>
        sum + Number(state.totalAllocated || 0),
      0,
    );

    const totalExpenditure = states.reduce(
      (sum, state) =>
        sum + Number(state.totalExpenditure || 0),
      0,
    );

    const totalRecommended = states.reduce(
      (sum, state) =>
        sum +
        Number(
          state.totalRecommendedAmount || 0,
        ),
      0,
    );

    const totalMPs = states.reduce(
      (sum, state) =>
        sum +
        Number(
          state.mpCount ||
            state.totalMPs ||
            0,
        ),
      0,
    );

    const completedWorks = states.reduce(
      (sum, state) =>
        sum +
        Number(
          state.totalWorksCompleted ||
            state.completedWorksCount ||
            0,
        ),
      0,
    );

    const utilization =
      totalAllocated > 0
        ? (totalExpenditure /
            totalAllocated) *
          100
        : 0;

    return {
      totalAllocated,
      totalExpenditure,
      totalRecommended,
      totalMPs,
      completedWorks,
      utilization,
    };
  }, [states]);

  const topStates = useMemo(() => {
    return [...states]
      .sort(
        (a, b) =>
          Number(
            b.expenditurePercentage || 0,
          ) -
          Number(
            a.expenditurePercentage || 0,
          ),
      )
      .slice(0, 8)
      .map((state) => ({
        name:
          state.state.length > 15
            ? `${state.state.slice(0, 15)}…`
            : state.state,
        expenditure: Number(
          state.expenditurePercentage || 0,
        ),
      }));
  }, [states]);

  const lowestStates = useMemo(() => {
    return [...states]
      .sort(
        (a, b) =>
          Number(
            a.expenditurePercentage || 0,
          ) -
          Number(
            b.expenditurePercentage || 0,
          ),
      )
      .slice(0, 6);
  }, [states]);

  const workDistribution = useMemo(() => {
    const sorted = [...states]
      .sort(
        (a, b) =>
          Number(
            b.totalWorksCompleted ||
              b.completedWorksCount ||
              0,
          ) -
          Number(
            a.totalWorksCompleted ||
              a.completedWorksCount ||
              0,
          ),
      )
      .slice(0, 5);

    return sorted.map((state) => ({
      name:
        state.state.length > 12
          ? `${state.state.slice(0, 12)}…`
          : state.state,
      value: Number(
        state.totalWorksCompleted ||
          state.completedWorksCount ||
          0,
      ),
    }));
  }, [states]);

  const averageUtilization = useMemo(() => {
    if (!states.length) {
      return 0;
    }

    return (
      states.reduce(
        (sum, state) =>
          sum +
          Number(
            state.utilizationPercentage || 0,
          ),
        0,
      ) / states.length
    );
  }, [states]);

  return (
    <AppLayout>
      <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-400">
            MPLADS ANALYTICS
          </p>

          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Analytics
          </h1>

          <p className="mt-1 text-xs text-slate-500">
            Fund utilization, expenditure and state-level
            performance intelligence.
          </p>
        </div>

        <button
          type="button"
          onClick={loadAnalytics}
          disabled={loading}
          className="flex w-fit items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/[0.06] disabled:opacity-50"
        >
          <RefreshCw
            size={14}
            className={
              loading
                ? "animate-spin"
                : ""
            }
          />

          Refresh Analytics
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/[0.05] p-4">
          <p className="text-xs font-semibold text-red-300">
            Analytics feed unavailable
          </p>

          <p className="mt-1 text-[11px] text-red-400/70">
            {error}
          </p>
        </div>
      )}

      {/* KPI CARDS */}

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-white/[0.06] bg-[#0c1016] p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Total Allocated
            </span>

            <IndianRupee
              size={16}
              className="text-blue-400"
            />
          </div>

          <p className="mt-3 text-2xl font-semibold text-white">
            {loading
              ? "—"
              : formatCurrency(
                  analytics.totalAllocated,
                )}
          </p>

          <p className="mt-1 text-[10px] text-slate-600">
            Across loaded states
          </p>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-[#0c1016] p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Total Expenditure
            </span>

            <TrendingUp
              size={16}
              className="text-emerald-400"
            />
          </div>

          <p className="mt-3 text-2xl font-semibold text-white">
            {loading
              ? "—"
              : formatCurrency(
                  analytics.totalExpenditure,
                )}
          </p>

          <p className="mt-1 text-[10px] text-slate-600">
            Recorded expenditure
          </p>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-[#0c1016] p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Utilization
            </span>

            <BarChart3
              size={16}
              className="text-amber-400"
            />
          </div>

          <p className="mt-3 text-2xl font-semibold text-white">
            {loading
              ? "—"
              : `${analytics.utilization.toFixed(
                  1,
                )}%`}
          </p>

          <p className="mt-1 text-[10px] text-slate-600">
            Expenditure / allocation
          </p>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-[#0c1016] p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Completed Works
            </span>

            <CheckCircle2
              size={16}
              className="text-cyan-400"
            />
          </div>

          <p className="mt-3 text-2xl font-semibold text-white">
            {loading
              ? "—"
              : formatNumber(
                  analytics.completedWorks,
                )}
          </p>

          <p className="mt-1 text-[10px] text-slate-600">
            Reported completed projects
          </p>
        </div>
      </div>

      {/* MAIN CHARTS */}

      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="rounded-xl border border-white/[0.06] bg-[#0c1016] p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">
                State Expenditure Performance
              </h2>

              <p className="mt-1 text-[10px] text-slate-600">
                Highest expenditure percentages
              </p>
            </div>

            <TrendingUp
              size={16}
              className="text-blue-400"
            />
          </div>

          <div className="h-[320px]">
            {loading ? (
              <div className="flex h-full items-center justify-center text-xs text-slate-600">
                Loading analytics...
              </div>
            ) : (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={topStates}
                  margin={{
                    top: 10,
                    right: 10,
                    left: -20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                  />

                  <XAxis
                    dataKey="name"
                    tick={{
                      fill: "#64748b",
                      fontSize: 9,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    domain={[0, 100]}
                    tick={{
                      fill: "#64748b",
                      fontSize: 9,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    contentStyle={{
                      background:
                        "#10151d",
                      border:
                        "1px solid rgba(255,255,255,0.08)",
                      borderRadius:
                        "8px",
                      fontSize: "11px",
                    }}
                    formatter={(value) =>
                      `${Number(
                        value,
                      ).toFixed(1)}%`
                    }
                  />

                 <Bar
  dataKey="expenditure"
  radius={[5, 5, 0, 0]}
>
  {topStates.map((_, index) => (
    <Cell
      key={`bar-${index}`}
      fill={
        CHART_COLORS[
          index % CHART_COLORS.length
        ]
      }
    />
  ))}
</Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-[#0c1016] p-5">
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-white">
              Work Distribution
            </h2>

            <p className="mt-1 text-[10px] text-slate-600">
              Top states by completed works
            </p>
          </div>

          <div className="h-[260px]">
            {loading ? (
              <div className="flex h-full items-center justify-center text-xs text-slate-600">
                Loading...
              </div>
            ) : (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
  data={workDistribution}
  dataKey="value"
  nameKey="name"
  cx="50%"
  cy="50%"
  innerRadius={65}
  outerRadius={95}
  paddingAngle={3}
>
  {workDistribution.map((_, index) => (
    <Cell
      key={`pie-${index}`}
      fill={
        CHART_COLORS[
          index % CHART_COLORS.length
        ]
      }
    />
  ))}
</Pie>

                  <Tooltip
                    contentStyle={{
                      background:
                        "#10151d",
                      border:
                        "1px solid rgba(255,255,255,0.08)",
                      borderRadius:
                        "8px",
                      fontSize: "11px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="space-y-2">
            {workDistribution.map(
              (item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between"
                >
                  <span className="text-[10px] text-slate-500">
                    {item.name}
                  </span>

                  <span className="text-[10px] font-semibold text-slate-300">
                    {formatNumber(
                      item.value,
                    )}
                  </span>
                </div>
              ),
            )}
          </div>
        </div>
      </div>

      {/* LOWER ANALYTICS */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1fr_320px]">
        <div className="rounded-xl border border-white/[0.06] bg-[#0c1016] p-5">
          <div className="mb-5 flex items-center gap-3">
            <TrendingUp
              size={17}
              className="text-emerald-400"
            />

            <div>
              <h2 className="text-sm font-semibold text-white">
                Strongest Utilization
              </h2>

              <p className="text-[10px] text-slate-600">
                Top performing states
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {states
              .slice()
              .sort(
                (a, b) =>
                  Number(
                    b.utilizationPercentage ||
                      0,
                  ) -
                  Number(
                    a.utilizationPercentage ||
                      0,
                  ),
              )
              .slice(0, 5)
              .map((state) => (
                <div
                  key={state.state}
                  className="rounded-lg border border-white/[0.04] bg-white/[0.015] p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300">
                      {state.state}
                    </span>

                    <span className="text-xs font-semibold text-emerald-400">
                      {Number(
                        state.utilizationPercentage ||
                          0,
                      ).toFixed(1)}
                      %
                    </span>
                  </div>

                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.05]">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{
                        width: `${Math.min(
                          100,
                          Number(
                            state.utilizationPercentage ||
                              0,
                          ),
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-[#0c1016] p-5">
          <div className="mb-5 flex items-center gap-3">
            <TrendingDown
              size={17}
              className="text-amber-400"
            />

            <div>
              <h2 className="text-sm font-semibold text-white">
                Attention Required
              </h2>

              <p className="text-[10px] text-slate-600">
                Lowest expenditure performance
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {lowestStates.map(
              (state) => (
                <div
                  key={state.state}
                  className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.015] p-3"
                >
                  <div>
                    <p className="text-xs text-slate-300">
                      {state.state}
                    </p>

                    <p className="mt-1 text-[10px] text-slate-600">
                      {formatNumber(
                        Number(
                          state.totalWorksCompleted ||
                            state.completedWorksCount ||
                            0,
                        ),
                      )}{" "}
                      completed works
                    </p>
                  </div>

                  <span className="text-xs font-semibold text-amber-400">
                    {Number(
                      state.expenditurePercentage ||
                        0,
                    ).toFixed(1)}
                    %
                  </span>
                </div>
              ),
            )}
          </div>
        </div>

        <div className="rounded-xl border border-blue-500/15 bg-blue-500/[0.035] p-5">
          <div className="flex items-center gap-3">
            <Users
              size={17}
              className="text-blue-400"
            />

            <div>
              <h2 className="text-sm font-semibold text-white">
                Coverage
              </h2>

              <p className="text-[10px] text-slate-600">
                Current dataset
              </p>
            </div>
          </div>

          <p className="mt-6 text-3xl font-semibold text-white">
            {loading
              ? "—"
              : states.length}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            States / UTs represented
          </p>

          <div className="mt-5 space-y-3 border-t border-white/[0.05] pt-4">
            <div className="flex justify-between">
              <span className="text-[10px] text-slate-600">
                MPs
              </span>

              <span className="text-xs text-slate-300">
                {formatNumber(
                  analytics.totalMPs,
                )}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-[10px] text-slate-600">
                Avg utilization
              </span>

              <span className="text-xs text-slate-300">
                {averageUtilization.toFixed(
                  1,
                )}
                %
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-[10px] text-slate-600">
                Recommended amount
              </span>

              <span className="text-xs text-slate-300">
                {formatCurrency(
                  analytics.totalRecommended,
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-white/[0.05] bg-[#090d12] p-4">
        <p className="text-[10px] leading-5 text-slate-600">
          Analytics are derived from the currently available
          MPLADS API state-summary records. Percentages and
          financial values are displayed as returned by the
          source data and aggregated for decision support.
        </p>
      </div>
    </AppLayout>
  );
}