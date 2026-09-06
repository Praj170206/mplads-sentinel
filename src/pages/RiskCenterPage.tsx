import AppLayout from "../components/layout/AppLayout";
import RiskCenter from "../components/risk/RiskCenter";

export default function RiskCenterPage() {
  return (
    <AppLayout>
      <div className="mb-7">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-400">
          AI Risk Intelligence
        </p>

        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Risk Center
        </h1>

        <p className="mt-1 text-xs text-slate-500">
          Explainable risk scoring and verification priorities
          across live MPLADS works.
        </p>
      </div>

      <RiskCenter state="Maharashtra" />
    </AppLayout>
  );
}