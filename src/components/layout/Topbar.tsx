import {
  Bell,
  Search,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";

interface TopbarProps {
  title?: string;
  subtitle?: string;
}

export default function Topbar({
  title = "MPLADS Intelligence",
  subtitle = "Fund, project and risk monitoring",
}: TopbarProps) {
  return (
    <header className="fixed left-[250px] right-0 top-0 z-30 h-[76px] border-b border-white/[0.06] bg-[#090c11]/95 backdrop-blur-xl">
      <div className="flex h-full items-center justify-between px-8">
        {/* Page heading */}
        <div>
          <h2 className="text-[15px] font-semibold text-white">
            {title}
          </h2>

          <p className="mt-0.5 text-[11px] text-slate-600">
            {subtitle}
          </p>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="hidden items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 md:flex">
            <Search className="h-4 w-4 text-slate-600" />

            <input
              type="text"
              placeholder="Search projects..."
              className="w-44 bg-transparent text-xs text-slate-300 outline-none placeholder:text-slate-700"
            />

            <kbd className="rounded border border-white/[0.06] px-1.5 py-0.5 text-[9px] text-slate-700">
              /
            </kbd>
          </div>

          {/* Notification */}
          <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-slate-500 transition hover:bg-white/[0.05] hover:text-slate-200">
            <Bell className="h-4 w-4" />

            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-400 ring-2 ring-[#090c11]" />
          </button>

          {/* Divider */}
          <div className="h-8 w-px bg-white/[0.06]" />

          {/* User */}
          <button className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition hover:bg-white/[0.03]">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 ring-1 ring-blue-500/20">
              <ShieldCheck className="h-4 w-4 text-blue-400" />
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-[11px] font-medium text-slate-300">
                District Authority
              </p>
              <p className="text-[9px] text-slate-600">
                Maharashtra
              </p>
            </div>

            <ChevronDown className="h-3.5 w-3.5 text-slate-600" />
          </button>
        </div>
      </div>
    </header>
  );
}