import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";

import Dashboard from "./pages/Dashboard";
import RiskCenterPage from "./pages/RiskCenterPage";

function PlaceholderPage({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <AppLayout>
      <div className="mb-7">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-400">
          MPLADS SENTINEL
        </p>

        <h1 className="text-2xl font-semibold tracking-tight text-white">
          {title}
        </h1>

        <p className="mt-1 text-xs text-slate-500">
          {subtitle}
        </p>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-[#0c1016] p-6">
        <p className="text-sm text-slate-400">
          This module is under development.
        </p>
      </div>
    </AppLayout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* =================================================
            OVERVIEW
        ================================================== */}

        <Route
          path="/"
          element={<Dashboard />}
        />

        {/* =================================================
            PROJECTS
        ================================================== */}

        <Route
          path="/projects"
          element={
            <PlaceholderPage
              title="Projects"
              subtitle="MPLADS project monitoring and work-level intelligence."
            />
          }
        />

        {/* =================================================
            RISK CENTER
        ================================================== */}

        <Route
          path="/risk"
          element={<RiskCenterPage />}
        />

        {/* =================================================
            AI INSIGHTS
        ================================================== */}

        <Route
          path="/ai-insights"
          element={
            <PlaceholderPage
              title="AI Insights"
              subtitle="AI-generated trends, anomalies and decision support."
            />
          }
        />

        {/* =================================================
            ANALYTICS
        ================================================== */}

        <Route
          path="/analytics"
          element={
            <PlaceholderPage
              title="Analytics"
              subtitle="Fund utilization, expenditure and project analytics."
            />
          }
        />

        {/* =================================================
            GEO INTELLIGENCE
        ================================================== */}

        <Route
          path="/geo"
          element={
            <PlaceholderPage
              title="Geo Intelligence"
              subtitle="Geospatial monitoring of MPLADS works and regional patterns."
            />
          }
        />

        {/* =================================================
            COMPLIANCE
        ================================================== */}

        <Route
          path="/compliance"
          element={
            <PlaceholderPage
              title="Compliance"
              subtitle="Audit, guideline and compliance monitoring."
            />
          }
        />

        {/* =================================================
            SETTINGS
        ================================================== */}

        <Route
          path="/settings"
          element={
            <PlaceholderPage
              title="Settings"
              subtitle="System configuration and monitoring preferences."
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;