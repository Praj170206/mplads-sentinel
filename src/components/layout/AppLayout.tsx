import type { ReactNode } from "react";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({
  children,
}: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-[#06090d] text-slate-200">
      {/* Sidebar */}
      <Sidebar />

      {/* Topbar */}
      <Topbar />

      {/* Main Content */}
      <main className="ml-[250px] min-h-screen pt-[76px]">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}