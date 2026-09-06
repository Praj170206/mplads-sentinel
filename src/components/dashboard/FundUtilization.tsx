import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Apr", allocated: 38, utilized: 26 },
  { month: "May", allocated: 42, utilized: 31 },
  { month: "Jun", allocated: 46, utilized: 35 },
  { month: "Jul", allocated: 51, utilized: 39 },
  { month: "Aug", allocated: 55, utilized: 43 },
  { month: "Sep", allocated: 61, utilized: 49 },
  { month: "Oct", allocated: 66, utilized: 54 },
  { month: "Nov", allocated: 72, utilized: 59 },
  { month: "Dec", allocated: 78, utilized: 64 },
  { month: "Jan", allocated: 84, utilized: 69 },
  { month: "Feb", allocated: 91, utilized: 76 },
  { month: "Mar", allocated: 100, utilized: 82 },
];

export default function FundUtilization() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0c1016] p-5">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
            Fund Utilization
          </p>

          <h3 className="mt-1 text-lg font-semibold text-white">
            Allocation vs Expenditure
          </h3>
        </div>

        <div className="flex items-center gap-4 text-[10px]">
          <div className="flex items-center gap-2 text-slate-500">
            <span className="h-2 w-2 rounded-full bg-blue-400" />
            Allocated
          </div>

          <div className="flex items-center gap-2 text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Utilized
          </div>
        </div>
      </div>

      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="allocatedFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>

              <linearGradient id="utilizedFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke="#ffffff"
              strokeOpacity={0.05}
              vertical={false}
            />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#475569",
                fontSize: 10,
              }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#475569",
                fontSize: 10,
              }}
              tickFormatter={(value) => `₹${value}Cr`}
            />

            <Tooltip
              contentStyle={{
                background: "#11161e",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "10px",
                fontSize: "11px",
              }}
              labelStyle={{
                color: "#94a3b8",
              }}
              formatter={(value, name) => [
                `₹${value} Cr`,
                name === "allocated" ? "Allocated" : "Utilized",
              ]}
            />

            <Area
              type="monotone"
              dataKey="allocated"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#allocatedFill)"
            />

            <Area
              type="monotone"
              dataKey="utilized"
              stroke="#34d399"
              strokeWidth={2}
              fill="url(#utilizedFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}