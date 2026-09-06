import {
  ShieldAlert,
  AlertTriangle,
  CircleCheck,
} from "lucide-react";

const riskData = [
  {
    label: "Critical",
    count: 11,
    percentage: 8,
    icon: ShieldAlert,
    className: "text-red-400",
    bar: "bg-red-400",
  },
  {
    label: "High",
    count: 42,
    percentage: 31,
    icon: AlertTriangle,
    className: "text-orange-400",
    bar: "bg-orange-400",
  },
  {
    label: "Medium",
    count: 86,
    percentage: 42,
    icon: AlertTriangle,
    className: "text-yellow-400",
    bar: "bg-yellow-400",
  },
  {
    label: "Low",
    count: 214,
    percentage: 19,
    icon: CircleCheck,
    className: "text-emerald-400",
    bar: "bg-emerald-400",
  },
];

export default function RiskOverview() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0c1016] p-5">
      <div className="mb-6">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
          AI Risk Engine
        </p>

        <h3 className="mt-1 text-lg font-semibold text-white">
          Risk Distribution
        </h3>
      </div>

      <div className="space-y-5">
        {riskData.map((risk) => {
          const Icon = risk.icon;

          return (
            <div key={risk.label}>
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`h-4 w-4 ${risk.className}`}
                    strokeWidth={1.8}
                  />

                  <span className="text-xs text-slate-400">
                    {risk.label}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">
                    {risk.count}
                  </span>

                  <span className="text-[9px] text-slate-600">
                    projects
                  </span>
                </div>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                <div
                  className={`h-full rounded-full ${risk.bar}`}
                  style={{ width: `${risk.percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-lg border border-red-400/10 bg-red-400/[0.03] p-3">
        <div className="flex items-start gap-2.5">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />

          <div>
            <p className="text-[11px] font-medium text-red-300">
              11 critical projects require immediate attention
            </p>

            <p className="mt-1 text-[10px] leading-relaxed text-slate-600">
              AI engine detected significant financial or execution anomalies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}