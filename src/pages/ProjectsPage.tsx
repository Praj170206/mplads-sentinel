import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type { ReactNode } from "react";

import {
  Activity,
  AlertTriangle,
  ChevronDown,
  IndianRupee,
  Search,
  ShieldCheck,
} from "lucide-react";

import AppLayout from "../components/layout/AppLayout";

import {
  getCompletedWorks,
  getStateSummaries,
  type CompletedWork,
  type StateSummary,
} from "../api/mpladsApi";

import { calculateWorksRisk } from "../utils/riskEngine";

export default function ProjectsPage() {
  /* =========================================================
     STATE
  ========================================================= */

  const [states, setStates] = useState<
    StateSummary[]
  >([]);

  const [selectedState, setSelectedState] =
    useState("Maharashtra");

  const [works, setWorks] = useState<
    CompletedWork[]
  >([]);

  const [loadingStates, setLoadingStates] =
    useState(true);

  const [loadingWorks, setLoadingWorks] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [
    districtFilter,
    setDistrictFilter,
  ] = useState("ALL");

  /* =========================================================
     LOAD STATES
  ========================================================= */

  useEffect(() => {
    async function loadStates() {
      try {
        setLoadingStates(true);

        const data =
          await getStateSummaries();

        setStates(
          Array.isArray(data)
            ? data
            : [],
        );
      } catch (err) {
        console.error(
          "STATE LIST ERROR:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load states.",
        );
      } finally {
        setLoadingStates(false);
      }
    }

    loadStates();
  }, []);

  /* =========================================================
     LOAD WORKS WHEN STATE CHANGES
  ========================================================= */

  useEffect(() => {
    async function loadWorks() {
      try {
        setLoadingWorks(true);
        setError("");

        setDistrictFilter("ALL");

        const data =
          await getCompletedWorks(
            selectedState,
            1,
            50,
          );

        setWorks(
          Array.isArray(data)
            ? data
            : [],
        );
      } catch (err) {
        console.error(
          "PROJECTS API ERROR:",
          err,
        );

        setWorks([]);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load project data.",
        );
      } finally {
        setLoadingWorks(false);
      }
    }

    if (selectedState) {
      loadWorks();
    }
  }, [selectedState]);

  /* =========================================================
     RISK DATA
  ========================================================= */

  const riskData = useMemo(() => {
    return calculateWorksRisk(works);
  }, [works]);

  /* =========================================================
     DISTRICT LIST
  ========================================================= */

  const districts = useMemo(() => {
    const values = works
      .map((work) => work.district)
      .filter(Boolean);

    return Array.from(
      new Set(values),
    ).sort();
  }, [works]);

  /* =========================================================
     SEARCH + FILTER
  ========================================================= */

  const filteredWorks = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return riskData.filter((item) => {
      const work = item.work;

      const searchableText = [
        work.work_description,
        work.work_description_hi,
        work.work_id?.toString(),
        work.district,
        work.district_hi,
        work.location,
        work.category,
        work.category_hi,
        work.mp_details?.name,
        work.mp_details?.name_hi,
        work.mp_details?.constituency,
        work.mp_details?.party,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query ||
        searchableText.includes(query);

      const matchesDistrict =
        districtFilter === "ALL" ||
        work.district ===
          districtFilter;

      return (
        matchesSearch &&
        matchesDistrict
      );
    });
  }, [
    riskData,
    search,
    districtFilter,
  ]);

  /* =========================================================
     METRICS
  ========================================================= */

  const metrics = useMemo(() => {
    const totalCost = works.reduce(
      (sum, work) =>
        sum + Number(work.cost || 0),
      0,
    );

    const highRisk =
      riskData.filter(
        (item) =>
          item.level === "CRITICAL" ||
          item.level === "HIGH",
      ).length;

    const auditWatch =
      works.filter(
        (work) =>
          Number(work.cost || 0) >=
          1500000,
      ).length;

    const averageCost =
      works.length > 0
        ? totalCost / works.length
        : 0;

    return {
      total: works.length,
      highRisk,
      auditWatch,
      averageCost,
    };
  }, [works, riskData]);

  /* =========================================================
     HELPERS
  ========================================================= */

  function formatCurrency(
    amount: number,
  ) {
    if (amount >= 10000000) {
      return `₹${(
        amount / 10000000
      ).toFixed(2)} Cr`;
    }

    if (amount >= 100000) {
      return `₹${(
        amount / 100000
      ).toFixed(2)} L`;
    }

    return `₹${amount.toLocaleString(
      "en-IN",
    )}`;
  }

  function formatDate(
    value: string,
  ) {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return "—";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      },
    );
  }

  function getRiskBadge(
    level: string,
  ) {
    if (level === "CRITICAL") {
      return "border-red-500/20 bg-red-500/10 text-red-400";
    }

    if (level === "HIGH") {
      return "border-orange-500/20 bg-orange-500/10 text-orange-400";
    }

    if (level === "MEDIUM") {
      return "border-yellow-500/20 bg-yellow-500/10 text-yellow-400";
    }

    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <AppLayout>
      {/* HEADER */}
      <div className="mb-7">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-400">
          Project Intelligence
        </p>

        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Projects
        </h1>

        <p className="mt-1 text-xs text-slate-500">
          Explore and monitor MPLADS works
          across states, districts and
          constituencies.
        </p>
      </div>

      {/* STATE SELECTOR */}
      <div className="mb-5 rounded-xl border border-white/[0.06] bg-[#0c1016] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="flex-1">
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Select State / UT
            </label>

            <div className="relative">
              <select
                value={selectedState}
                onChange={(event) =>
                  setSelectedState(
                    event.target.value,
                  )
                }
                disabled={loadingStates}
                className="w-full appearance-none rounded-lg border border-white/[0.07] bg-[#080c11] px-3 py-3 pr-10 text-xs text-slate-300 outline-none transition focus:border-blue-500/40 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadingStates ? (
                  <option>
                    Loading states...
                  </option>
                ) : (
                  states.map((state) => (
                    <option
                      key={state.state}
                      value={state.state}
                    >
                      {state.state}
                    </option>
                  ))
                )}
              </select>

              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-600"
              />
            </div>
          </div>

          <div className="rounded-lg border border-blue-500/10 bg-blue-500/[0.03] px-4 py-3 lg:min-w-[220px]">
            <p className="text-[9px] uppercase tracking-wider text-slate-600">
              Active Region
            </p>

            <p className="mt-1 text-sm font-medium text-blue-400">
              {selectedState}
            </p>
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/5 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={17}
              className="mt-0.5 text-red-400"
            />

            <div>
              <p className="text-sm font-medium text-red-400">
                Unable to load project data
              </p>

              <p className="mt-1 text-xs text-red-300/70">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* WORK LOADING */}
      {loadingWorks && !error && (
        <div className="rounded-xl border border-white/[0.06] bg-[#0c1016] p-8">
          <div className="flex items-center gap-3">
            <Activity
              size={17}
              className="animate-pulse text-blue-400"
            />

            <p className="text-sm text-slate-400">
              Loading {selectedState} project
              records...
            </p>
          </div>
        </div>
      )}

      {/* CONTENT */}
      {!loadingWorks && !error && (
        <>
          {/* METRICS */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Projects Loaded"
              value={metrics.total.toLocaleString(
                "en-IN",
              )}
              subtitle={`Live records · ${selectedState}`}
              icon={
                <Activity size={17} />
              }
            />

            <MetricCard
              label="Risk Priority"
              value={metrics.highRisk.toLocaleString(
                "en-IN",
              )}
              subtitle="High / critical verification flags"
              icon={
                <AlertTriangle
                  size={17}
                />
              }
              warning
            />

            <MetricCard
              label="Audit Watch"
              value={metrics.auditWatch.toLocaleString(
                "en-IN",
              )}
              subtitle="Works ≥ ₹15 lakh"
              icon={
                <ShieldCheck
                  size={17}
                />
              }
            />

            <MetricCard
              label="Average Cost"
              value={formatCurrency(
                metrics.averageCost,
              )}
              subtitle="Across loaded projects"
              icon={
                <IndianRupee
                  size={17}
                />
              }
            />
          </div>

          {/* SEARCH + DISTRICT */}
          <div className="mb-5 rounded-xl border border-white/[0.06] bg-[#0c1016] p-4">
            <div className="flex flex-col gap-3 lg:flex-row">
              {/* GLOBAL SEARCH */}
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value,
                    )
                  }
                  placeholder="Search project, Work ID, district, MP or constituency..."
                  className="w-full rounded-lg border border-white/[0.07] bg-[#080c11] py-2.5 pl-9 pr-3 text-xs text-slate-300 outline-none placeholder:text-slate-600 focus:border-blue-500/40"
                />
              </div>

              {/* DISTRICT */}
              <div className="relative lg:w-[230px]">
                <select
                  value={districtFilter}
                  onChange={(event) =>
                    setDistrictFilter(
                      event.target.value,
                    )
                  }
                  className="w-full appearance-none rounded-lg border border-white/[0.07] bg-[#080c11] px-3 py-2.5 pr-9 text-xs text-slate-400 outline-none focus:border-blue-500/40"
                >
                  <option value="ALL">
                    All Districts
                  </option>

                  {districts.map(
                    (district) => (
                      <option
                        key={district}
                        value={district}
                      >
                        {district}
                      </option>
                    ),
                  )}
                </select>

                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-600"
                />
              </div>
            </div>

            {(search ||
              districtFilter !==
                "ALL") && (
              <div className="mt-3 flex items-center justify-between">
                <p className="text-[10px] text-slate-600">
                  Showing filtered results
                </p>

                <button
                  onClick={() => {
                    setSearch("");
                    setDistrictFilter(
                      "ALL",
                    );
                  }}
                  className="text-[10px] text-blue-400 transition hover:text-blue-300"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>

          {/* PROJECT TABLE */}
          <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#0c1016]">
            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-white">
                  Project Registry
                </h2>

                <p className="mt-1 text-[11px] text-slate-500">
                  {selectedState} · live
                  public MPLADS records
                </p>
              </div>

              <div className="rounded-md border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 text-[10px] text-slate-500">
                {filteredWorks.length}{" "}
                shown
              </div>
            </div>

            {filteredWorks.length ===
            0 ? (
              <div className="p-10 text-center">
                <Search
                  size={20}
                  className="mx-auto text-slate-700"
                />

                <p className="mt-3 text-sm text-slate-500">
                  No projects match the
                  current filters.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] text-left">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-[10px] uppercase tracking-wider text-slate-500">
                      <th className="px-5 py-3">
                        Project
                      </th>

                      <th className="px-5 py-3">
                        District
                      </th>

                      <th className="px-5 py-3">
                        MP /
                        Constituency
                      </th>

                      <th className="px-5 py-3">
                        Category
                      </th>

                      <th className="px-5 py-3">
                        Cost
                      </th>

                      <th className="px-5 py-3">
                        Completed
                      </th>

                      <th className="px-5 py-3">
                        Risk
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredWorks.map(
                      (item) => {
                        const work =
                          item.work;

                        return (
                          <tr
                            key={
                              work.id
                            }
                            className="border-b border-white/[0.04] transition hover:bg-white/[0.02]"
                          >
                            <td className="max-w-[330px] px-5 py-4">
                              <p className="truncate text-sm font-medium text-slate-200">
                                {
                                  work.work_description
                                }
                              </p>

                              <p className="mt-1 text-[10px] text-slate-600">
                                Work ID:{" "}
                                {
                                  work.work_id
                                }
                              </p>
                            </td>

                            <td className="px-5 py-4 text-xs text-slate-400">
                              {
                                work.district
                              }
                            </td>

                            <td className="px-5 py-4">
                              <p className="text-xs text-slate-300">
                                {
                                  work
                                    .mp_details
                                    ?.name
                                }
                              </p>

                              <p className="mt-1 text-[10px] text-slate-600">
                                {
                                  work
                                    .mp_details
                                    ?.constituency
                                }
                              </p>
                            </td>

                            <td className="px-5 py-4 text-[10px] text-slate-500">
                              {
                                work.category
                              }
                            </td>

                            <td className="px-5 py-4 text-xs font-medium text-slate-300">
                              {formatCurrency(
                                Number(
                                  work.cost ||
                                    0,
                                ),
                              )}
                            </td>

                            <td className="px-5 py-4 text-xs text-slate-500">
                              {formatDate(
                                work.completion_date,
                              )}
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex rounded-md border px-2 py-1 text-[9px] font-semibold tracking-wide ${getRiskBadge(
                                  item.level,
                                )}`}
                              >
                                {
                                  item.level
                                }
                              </span>

                              <p className="mt-1 text-[9px] text-slate-600">
                                Score{" "}
                                {
                                  item.score
                                }
                                /100
                              </p>
                            </td>
                          </tr>
                        );
                      },
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* DISCLAIMER */}
          <div className="mt-4 rounded-lg border border-blue-500/10 bg-blue-500/[0.03] px-4 py-3">
            <p className="text-[10px] leading-5 text-slate-600">
              Risk scores are explainable
              screening indicators generated
              from available public records.
              They prioritize verification and
              do not by themselves establish
              fraud, misconduct or
              non-compliance.
            </p>
          </div>
        </>
      )}
    </AppLayout>
  );
}

/* =========================================================
   METRIC CARD
========================================================= */

function MetricCard({
  label,
  value,
  subtitle,
  icon,
  warning = false,
}: {
  label: string;
  value: string;
  subtitle: string;
  icon: ReactNode;
  warning?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0c1016] p-5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-wider text-slate-500">
          {label}
        </p>

        <div
          className={
            warning
              ? "text-orange-400"
              : "text-blue-400"
          }
        >
          {icon}
        </div>
      </div>

      <p className="mt-3 text-2xl font-semibold text-white">
        {value}
      </p>

      <p className="mt-2 text-[10px] text-slate-600">
        {subtitle}
      </p>
    </div>
  );
}