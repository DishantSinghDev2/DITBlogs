import { DashboardShell } from "@/components/dashboard/dashboard-shell-child";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export default function DashboardLoading() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Dashboard"
        text="Loading your dashboard..."
      />
      <div className="flex justify-center items-center py-16">
        <div className="w-12 h-12 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
      </div>
    </DashboardShell>
  );
}