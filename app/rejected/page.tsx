import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function RejectedPage() {
  return (
    <div className="container flex min-h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/50">
            <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <CardTitle className="mt-4 text-2xl">Request Not Approved</CardTitle>
          <CardDescription>
            Your request to join the organization was not approved. Contact the
            admin directly, or create your own organization.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Button asChild variant="outline">
              <Link href="/dashboard/organizations/join">Join Another Organization</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">Create Your Own</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
