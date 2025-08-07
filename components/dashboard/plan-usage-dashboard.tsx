"use client";

import { Organization } from "@prisma/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLAN_LIMITS } from "@/config/plans";
import Link from "next/link";
import { ArrowRight, CheckCircle, Star } from "lucide-react";

interface PlanUsageProps {
    organization: Organization & { _count: { members: number; posts: number } };
}


const calculatePercentage = (current: number, limit: number) => {
    if (limit === Infinity) return 0;
    return Math.min((current / limit) * 100, 100);
};
// A helper to format large numbers
const formatNumber = (num: number) => num.toLocaleString('en-US');

export function PlanUsageDashboard({ organization }: PlanUsageProps) {
    const currentPlan = organization.plan;
    const limits = PLAN_LIMITS[currentPlan];

    const usage = {
        members: organization._count.members,
        posts: organization._count.posts,
        views: organization.monthlyPostViews,
    };


    const isCustomPlan = currentPlan === 'CUSTOM';

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Current Plan</CardTitle>
                        <CardDescription>You are currently on the {currentPlan} plan.</CardDescription>
                    </div>
                    <Badge variant={isCustomPlan ? "default" : "secondary"} className="text-lg capitalize">{currentPlan}</Badge>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader><CardTitle>Monthly Usage</CardTitle><CardDescription>Your usage resets at the start of each month.</CardDescription></CardHeader>
                <CardContent className="space-y-6">
                    {/* Members Usage */}
                    <UsageMeter title="Members" current={usage.members} limit={limits.members} />
                    {/* Posts Usage */}
                    {limits.posts !== Infinity && <UsageMeter title="Posts" current={usage.posts} limit={limits.posts} />}
                    {/* Views Usage */}
                    <UsageMeter title="Post Views" current={usage.views} limit={limits.viewsPerMonth} />
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle>Upgrade Your Plan</CardTitle>
                        <CardDescription>Unlock more features and increase your limits by upgrading your plan.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <p className="text-sm text-muted-foreground">All payments and subscriptions are securely managed by our partner, WhatsYour.Info.</p>
                    </CardContent>
                    <CardFooter>
                        {/* This link should go to your WYI payment/subscription management page */}
                        <Button asChild className="w-full"><Link href="https://whatsyour.info/billing" target="_blank">Manage Subscription <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
                    </CardFooter>
                </Card>

                <Card className="flex flex-col border-primary/50">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Star className="h-5 w-5 text-primary" />
                            <CardTitle>Enterprise Solutions</CardTitle>
                        </div>
                        <CardDescription>Need unlimited usage or custom features? We've got you covered.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-primary" />Unlimited Everything</li>
                            <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-primary" />Priority Support</li>
                            <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-primary" />Custom Integrations</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button asChild variant="outline" className="w-full"><Link href="mailto:sales@ditblogs.com">Contact Sales</Link></Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}

// A reusable component for the usage meters
const UsageMeter = ({ title, current, limit }: { title: string, current: number, limit: number }) => (
    <div>
        <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-muted-foreground">{title}</span>
            <span>
                <span className="font-semibold">{formatNumber(current)}</span> / {limit === Infinity ? 'Unlimited' : formatNumber(limit)}
            </span>
        </div>
        <Progress value={calculatePercentage(current, limit)} />
    </div>
);