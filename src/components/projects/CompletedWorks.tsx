import { useEffect, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
  MapPin,
  RefreshCw,
  UserRound,
} from "lucide-react";

import {
  getCompletedWorks,
  type CompletedWork,
} from "../../api/mpladsApi";

interface CompletedWorksProps {
  state: string;
}

export default function CompletedWorks({
  state,
}: CompletedWorksProps) {
  const [works, setWorks] = useState<CompletedWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);

  /* =====================================================
     LOAD WORKS
  ===================================================== */

  async function loadWorks() {
    try {
      setLoading(true);
      setError("");

      const data = await getCompletedWorks(
        state,
        page,
        20,
      );

      /*
       * FINAL SAFETY CHECK
       *
       * Even if something unexpected comes from the API,
       * React will ALWAYS receive an array.
       */

      if (Array.isArray(data)) {
        setWorks(data);
      } else {
        setWorks([]);
      }
    } catch (err) {
      console.error(
        "COMPLETED WORKS ERROR:",
        err,
      );

      setWorks([]);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load completed works.",
      );
    } finally {
      setLoading(false);
    }
  }

  /* =====================================================
     FETCH WHEN STATE / PAGE CHANGES
  ===================================================== */

  useEffect(() => {
    loadWorks();
  }, [state, page]);

  /* =====================================================
     FORMAT CURRENCY
  ===================================================== */

  function formatCurrency(value: number) {
    return `₹${Number(value || 0).toLocaleString(
      "en-IN",
    )}`;
  }

  /* =====================================================
     FORMAT DATE
  ===================================================== */

  function formatDate(value: string) {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <section className="mt-6 overflow-hidden rounded-xl border border-white/[0.06] bg-[#0c1016]">
        <div className="border-b border-white/[0.06] px-5 py-4">
          <div className="h-4 w-40 animate-pulse rounded bg-white/[0.06]" />

          <div className="mt-2 h-3 w-64 animate-pulse rounded bg-white/[0.04]" />
        </div>

        <div className="space-y-3 p-5">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="h-16 animate-pulse rounded-lg bg-white/[0.03]"
            />
          ))}
        </div>
      </section>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error) {
    return (
      <section className="mt-6 overflow-hidden rounded-xl border border-red-500/20 bg-[#0c1016]">
        <div className="border-b border-red-500/10 px-5 py-4">
          <h2 className="text-sm font-semibold text-white">
            Completed Works
          </h2>

          <p className="mt-1 text-[11px] text-slate-500">
            Live MPLADS completed-work records
          </p>
        </div>

        <div className="p-6">
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
            <p className="text-sm font-medium text-red-400">
              Unable to load completed works
            </p>

            <p className="mt-1 text-xs text-red-300/70">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={loadWorks}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
          >
            <RefreshCw size={14} />

            Retry
          </button>
        </div>
      </section>
    );
  }

  /* =====================================================
     EMPTY STATE
  ===================================================== */

  if (works.length === 0) {
    return (
      <section className="mt-6 overflow-hidden rounded-xl border border-white/[0.06] bg-[#0c1016]">
        <div className="border-b border-white/[0.06] px-5 py-4">
          <h2 className="text-sm font-semibold text-white">
            Completed Works
          </h2>

          <p className="mt-1 text-[11px] text-slate-500">
            Live MPLADS completed-work records
          </p>
        </div>

        <div className="p-8 text-center">
          <p className="text-sm text-slate-400">
            No completed works found for {state}.
          </p>

          <button
            type="button"
            onClick={loadWorks}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs text-slate-300 hover:bg-white/[0.06]"
          >
            <RefreshCw size={14} />

            Refresh
          </button>
        </div>
      </section>
    );
  }

  /* =====================================================
     MAIN UI
  ===================================================== */

  return (
    <section className="mt-6 overflow-hidden rounded-xl border border-white/[0.06] bg-[#0c1016]">
      {/* HEADER */}

      <div className="flex flex-col gap-3 border-b border-white/[0.06] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">
            Completed Works
          </h2>

          <p className="mt-1 text-[11px] text-slate-500">
            Live completed MPLADS works · {state}
          </p>
        </div>

        <button
          type="button"
          onClick={loadWorks}
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[11px] font-medium text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
        >
          <RefreshCw size={13} />

          Refresh
        </button>
      </div>

      {/* TABLE */}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left">
          <thead>
            <tr className="border-b border-white/[0.06] text-[10px] uppercase tracking-wider text-slate-500">
              <th className="px-5 py-3">
                Work
              </th>

              <th className="px-5 py-3">
                District
              </th>

              <th className="px-5 py-3">
                MP / Constituency
              </th>

              <th className="px-5 py-3">
                Cost
              </th>

              <th className="px-5 py-3">
                Completed
              </th>
            </tr>
          </thead>

          <tbody>
            {Array.isArray(works) &&
              works.map((work) => (
                <tr
                  key={work.id}
                  className="border-b border-white/[0.04] transition hover:bg-white/[0.02]"
                >
                  {/* WORK */}

                  <td className="max-w-[360px] px-5 py-4">
                    <div className="flex gap-3">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                        <IndianRupee size={14} />
                      </div>

                      <div>
                        <p className="line-clamp-2 text-sm font-medium leading-5 text-slate-200">
                          {work.work_description ||
                            "Work description unavailable"}
                        </p>

                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-[10px] text-slate-600">
                            ID #{work.work_id}
                          </span>

                          {work.category && (
                            <>
                              <span className="text-slate-700">
                                •
                              </span>

                              <span className="text-[10px] text-slate-500">
                                {work.category}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* DISTRICT */}

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <MapPin
                        size={13}
                        className="text-slate-600"
                      />

                      <div>
                        <p className="text-xs font-medium text-slate-300">
                          {work.district ||
                            "—"}
                        </p>

                        <p className="mt-0.5 max-w-[180px] truncate text-[10px] text-slate-600">
                          {work.location ||
                            "Location unavailable"}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* MP */}

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <UserRound
                        size={13}
                        className="text-slate-600"
                      />

                      <div>
                        <p className="max-w-[180px] truncate text-xs font-medium text-slate-300">
                          {work.mp_details?.name ||
                            "—"}
                        </p>

                        <p className="mt-0.5 text-[10px] text-slate-600">
                          {work.mp_details
                            ?.constituency ||
                            "—"}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* COST */}

                  <td className="px-5 py-4">
                    <p className="text-xs font-semibold text-emerald-400">
                      {formatCurrency(
                        work.cost,
                      )}
                    </p>
                  </td>

                  {/* DATE */}

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <CalendarDays
                        size={13}
                        className="text-slate-600"
                      />

                      <div>
                        <p className="text-xs text-slate-300">
                          {formatDate(
                            work.completion_date,
                          )}
                        </p>

                        <p className="mt-0.5 text-[10px] text-slate-600">
                          {work.completion_year ||
                            "—"}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* FOOTER / PAGINATION */}

      <div className="flex items-center justify-between border-t border-white/[0.06] px-5 py-3">
        <p className="text-[10px] text-slate-600">
          Showing {works.length} completed works
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page === 1}
            onClick={() =>
              setPage((current) =>
                Math.max(1, current - 1),
              )
            }
            className="flex h-7 w-7 items-center justify-center rounded-md border border-white/[0.08] bg-white/[0.02] text-slate-500 transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft size={14} />
          </button>

          <span className="min-w-[50px] text-center text-[10px] text-slate-500">
            Page {page}
          </span>

          <button
            type="button"
            disabled={works.length < 20}
            onClick={() =>
              setPage((current) =>
                current + 1,
              )
            }
            className="flex h-7 w-7 items-center justify-center rounded-md border border-white/[0.08] bg-white/[0.02] text-slate-500 transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}