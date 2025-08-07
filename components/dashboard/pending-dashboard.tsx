import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

export function PendingDashboard({ request }: { request: any }) {
  return (
    <div className="flex h-full items-center justify-center">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
            <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="mt-4 text-2xl">Request Pending</CardTitle>
          <CardDescription>
            Your request to join <strong>{request.organization.name}</strong> is awaiting approval from an administrator.
            You will be notified once a decision has been made.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}