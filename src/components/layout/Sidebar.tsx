import {
  LayoutDashboard,
  FolderKanban,
  ShieldAlert,
  BrainCircuit,
  BarChart3,
  Map,
  ClipboardCheck,
  Settings,
  Activity,
  ChevronRight,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const navigation = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    label: "Projects",
    icon: FolderKanban,
    path: "/projects",
  },
  {
    label: "Risk Center",
    icon: ShieldAlert,
    path: "/risk",
  },
  {
    label: "AI Insights",
    icon: BrainCircuit,
    path: "/ai-insights",
  },
  {
    label: "Analytics",
    icon: BarChart3,
    path: "/analytics",
  },
  {
    label: "Geo Intelligence",
    icon: Map,
    path: "/geo",
  },
  {
    label: "Compliance",
    icon: ClipboardCheck,
    path: "/compliance",
  },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[250px] flex-col border-r border-white/[0.06] bg-[#090c11]">
      {/* =====================================================
          BRAND
      ====================================================== */}

      <div className="flex h-[76px] shrink-0 items-center border-b border-white/[0.06] px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 ring-1 ring-blue-500/20">
            <Activity
              className="h-5 w-5 text-blue-400"
              strokeWidth={1.8}
            />
          </div>

          <div>
            <h1 className="text-[15px] font-semibold tracking-wide text-white">
              MPLADS
            </h1>

            <p className="text-[9px] font-medium tracking-[0.18em] text-slate-500">
              SENTINEL
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          NAVIGATION
      ====================================================== */}

      <div className="flex-1 overflow-y-auto px-3 py-6">
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
          Monitoring
        </p>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  [
                    "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5",
                    "text-left text-[13px] transition-all duration-200",
                    isActive
                      ? "bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/10"
                      : "text-slate-500 hover:bg-white/[0.03] hover:text-slate-200",
                  ].join(" ")
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Active pointer / indicator */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-r-full bg-blue-400" />
                    )}

                    <Icon
                      className={`h-[17px] w-[17px] shrink-0 ${
                        isActive
                          ? "text-blue-400"
                          : "text-slate-600 group-hover:text-slate-300"
                      }`}
                      strokeWidth={1.8}
                    />

                    <span className="flex-1">
                      {item.label}
                    </span>

                    {isActive && (
                      <ChevronRight
                        className="h-3.5 w-3.5 text-blue-500/60"
                        strokeWidth={1.8}
                      />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="my-6 h-px bg-white/[0.05]" />

        {/* =====================================================
            SYSTEM
        ====================================================== */}

        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
          System
        </p>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            [
              "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5",
              "text-[13px] transition-all duration-200",
              isActive
                ? "bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/10"
                : "text-slate-500 hover:bg-white/[0.03] hover:text-slate-200",
            ].join(" ")
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-r-full bg-blue-400" />
              )}

              <Settings
                className={`h-[17px] w-[17px] shrink-0 ${
                  isActive
                    ? "text-blue-400"
                    : "text-slate-600 group-hover:text-slate-300"
                }`}
                strokeWidth={1.8}
              />

              <span className="flex-1">
                Settings
              </span>

              {isActive && (
                <ChevronRight
                  className="h-3.5 w-3.5 text-blue-500/60"
                  strokeWidth={1.8}
                />
              )}
            </>
          )}
        </NavLink>
      </div>

      {/* =====================================================
          SYSTEM STATUS
      ====================================================== */}

      <div className="shrink-0 border-t border-white/[0.06] p-4">
        <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
          <div className="mb-2 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />

              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>

            <span className="text-[11px] font-medium text-slate-300">
              System Operational
            </span>
          </div>

          <p className="text-[10px] leading-relaxed text-slate-600">
            AI monitoring engine is active
          </p>
        </div>
      </div>
    </aside>
  );
}