import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  trend: string;
  trendType: "positive" | "negative" | "neutral";
  icon: LucideIcon;
}

export default function StatCard({
  title,
  value,
  subtitle,
  trend,
  trendType,
  icon: Icon,
}: StatCardProps) {
  const trendStyles = {
    positive: {
      text: "text-emerald-400",
      bg: "bg-emerald-400/10",
      icon: ArrowUpRight,
    },
    negative: {
      text: "text-red-400",
      bg: "bg-red-400/10",
      icon: ArrowDownRight,
    },
    neutral: {
      text: "text-slate-400",
      bg: "bg-slate-400/10",
      icon: null,
    },
  };

  const currentTrend = trendStyles[trendType];
  const TrendIcon = currentTrend.icon;

  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-[#0c1016] p-5 transition-all duration-200 hover:border-blue-500/20 hover:bg-[#0e131b]">
      {/* Subtle glow */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-blue-500/5 blur-2xl transition-all duration-300 group-hover:bg-blue-500/10" />

      {/* Top Row */}
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            {title}
          </p>

          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
            {value}
          </h2>
        </div>

        {/* Icon */}
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-blue-400/10 bg-blue-500/[0.07]">
          <Icon
            className="h-[18px] w-[18px] text-blue-400"
            strokeWidth={1.7}
          />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="relative mt-4 flex items-center justify-between">
        <p className="text-[10px] text-slate-600">{subtitle}</p>

        <div
          className={`flex items-center gap-1 rounded-md px-2 py-1 text-[9px] font-medium ${currentTrend.text} ${currentTrend.bg}`}
        >
          {TrendIcon && (
            <TrendIcon
              className="h-3 w-3"
              strokeWidth={2}
            />
          )}

          <span>{trend}</span>
        </div>
      </div>

      {/* Bottom accent */}
      <div className="absolute bottom-0 left-0 h-px w-0 bg-blue-400/50 transition-all duration-300 group-hover:w-full" />
    </div>
  );
}