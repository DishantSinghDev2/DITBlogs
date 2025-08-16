import { DashboardShell } from "@/components/dashboard/dashboard-shell-child";

export default function DashboardLoading() {
  return (
    <DashboardShell>
      <div className="flex justify-center items-center py-16">
        <div className="w-12 h-12 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
      </div>
    </DashboardShell>
  );
}