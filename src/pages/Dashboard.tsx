import { useEffect, useMemo, useState } from "react";

import AppLayout from "../components/layout/AppLayout";
import CompletedWorks from "../components/projects/CompletedWorks";

import {
  getStateSummaries,
  type StateSummary,
} from "../api/mpladsApi";

export default function Dashboard() {
  const [states, setStates] = useState<StateSummary[]>(
    [],
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =====================================================
     LOAD LIVE MPLADS DATA
  ====================================================== */

  useEffect(() => {
    async function loadStates() {
      try {
        setLoading(true);
        setError("");

        const data = await getStateSummaries();

        setStates(
          Array.isArray(data)
            ? data
            : [],
        );
      } catch (err) {
        console.error(
          "MPLADS STATE API ERROR:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load MPLADS data.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadStates();
  }, []);

  /* =====================================================
     CALCULATE NATIONAL TOTALS
  ====================================================== */

  const totals = useMemo(() => {
    return {
      mps: states.reduce(
        (sum, state) =>
          sum +
          Number(
            state.totalMPs || 0,
          ),
        0,
      ),

      completed: states.reduce(
        (sum, state) =>
          sum +
          Number(
            state.completedWorksCount ||
              0,
          ),
        0,
      ),

      allocated: states.reduce(
        (sum, state) =>
          sum +
          Number(
            state.totalAllocated || 0,
          ),
        0,
      ),

      expenditure: states.reduce(
        (sum, state) =>
          sum +
          Number(
            state.totalExpenditure || 0,
          ),
        0,
      ),
    };
  }, [states]);

  /* =====================================================
     UI
  ====================================================== */

  return (
    <AppLayout>
      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="mb-7">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-400">
          Live Data Connection
        </p>

        <h1 className="text-2xl font-semibold tracking-tight text-white">
          MPLADS Intelligence
        </h1>

        <p className="mt-1 text-xs text-slate-500">
          Fund, project and risk monitoring
          powered by live public MPLADS data.
        </p>
      </div>

      {/* =================================================
          LOADING STATE
      ================================================= */}

      {loading && (
        <div className="rounded-xl border border-white/[0.06] bg-[#0c1016] p-6">
          <p className="text-sm text-slate-400">
            Loading MPLADS data...
          </p>
        </div>
      )}

      {/* =================================================
          ERROR STATE
      ================================================= */}

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
          <p className="text-sm font-medium text-red-400">
            Unable to load MPLADS data
          </p>

          <p className="mt-1 text-xs text-red-300/70">
            {error}
          </p>
        </div>
      )}

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      {!loading && !error && (
        <>
          {/* =============================================
              KPI CARDS
          ============================================== */}

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {/* STATES / UTs */}

            <div className="rounded-xl border border-white/[0.06] bg-[#0c1016] p-5">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                States / UTs
              </p>

              <p className="mt-2 text-3xl font-semibold text-white">
                {states.length}
              </p>

              <p className="mt-2 text-[10px] text-slate-600">
                Live regional coverage
              </p>
            </div>

            {/* MPs */}

            <div className="rounded-xl border border-white/[0.06] bg-[#0c1016] p-5">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                Total MPs
              </p>

              <p className="mt-2 text-3xl font-semibold text-white">
                {totals.mps.toLocaleString(
                  "en-IN",
                )}
              </p>

              <p className="mt-2 text-[10px] text-slate-600">
                Across available states / UTs
              </p>
            </div>

            {/* COMPLETED WORKS */}

            <div className="rounded-xl border border-white/[0.06] bg-[#0c1016] p-5">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                Completed Works
              </p>

              <p className="mt-2 text-3xl font-semibold text-white">
                {totals.completed.toLocaleString(
                  "en-IN",
                )}
              </p>

              <p className="mt-2 text-[10px] text-emerald-500/70">
                Live completed-work records
              </p>
            </div>

            {/* EXPENDITURE */}

            <div className="rounded-xl border border-white/[0.06] bg-[#0c1016] p-5">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                Total Expenditure
              </p>

              <p className="mt-2 text-3xl font-semibold text-white">
                ₹
                {(
                  totals.expenditure /
                  10000000
                ).toLocaleString(
                  "en-IN",
                  {
                    maximumFractionDigits: 1,
                  },
                )}
                Cr
              </p>

              <p className="mt-2 text-[10px] text-slate-600">
                Aggregated live data
              </p>
            </div>
          </div>

          {/* =============================================
              STATE-WISE TABLE
          ============================================== */}

          <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#0c1016]">
            <div className="border-b border-white/[0.06] px-5 py-4">
              <h2 className="text-sm font-semibold text-white">
                State-wise MPLADS Data
              </h2>

              <p className="mt-1 text-[11px] text-slate-500">
                Live regional fund and project
                statistics
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead>
                  <tr className="border-b border-white/[0.06] text-[10px] uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-3">
                      State
                    </th>

                    <th className="px-5 py-3">
                      MPs
                    </th>

                    <th className="px-5 py-3">
                      Allocated
                    </th>

                    <th className="px-5 py-3">
                      Expenditure
                    </th>

                    <th className="px-5 py-3">
                      Utilization
                    </th>

                    <th className="px-5 py-3">
                      Completed
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {Array.isArray(states) &&
                    states.map((state) => (
                      <tr
                        key={state.state}
                        className="border-b border-white/[0.04] transition hover:bg-white/[0.02]"
                      >
                        <td className="px-5 py-4 text-sm font-medium text-white">
                          {state.state}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-400">
                          {Number(
                            state.totalMPs ||
                              0,
                          ).toLocaleString(
                            "en-IN",
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-400">
                          ₹
                          {Number(
                            state.totalAllocated ||
                              0,
                          ).toLocaleString(
                            "en-IN",
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-400">
                          ₹
                          {Number(
                            state.totalExpenditure ||
                              0,
                          ).toLocaleString(
                            "en-IN",
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-sm font-medium text-emerald-400">
                            {Number(
                              state.utilizationPercentage ||
                                0,
                            ).toFixed(1)}
                            %
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-400">
                          {Number(
                            state.completedWorksCount ||
                              0,
                          ).toLocaleString(
                            "en-IN",
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* =============================================
              COMPLETED WORKS
          ============================================== */}

          <CompletedWorks
            state="Maharashtra"
          />
        </>
      )}
    </AppLayout>
  );
}