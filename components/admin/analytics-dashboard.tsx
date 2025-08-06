"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, Brush,
} from "recharts";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

// Update props to match new data structure
interface AnalyticsDashboardProps {
  data: {
    overview: {
      totalMembers: number;
      totalPosts: number;
      totalViews: number;
      totalComments: number;
    };
    charts: {
      viewsByDay: Array<{ date: string; views: number }>;
      postsByCategory: Array<{ name: string; value: number }>;
      topAuthors: Array<{ id: string; name: string | null, image: string | null; _count: { posts: number } }>;
    };
    tables: {
        topPosts: Array<{ id: string; title: string; slug: string; _count: { views: number } }>;
    }
  } | null;
}

// Custom label for the donut chart center
const DonutCenterLabel = ({ total }: { total: number }) => {
    return (
        <g>
            <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {total}
            </text>
            <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '12px', fill: 'hsl(var(--muted-foreground))' }}>
                Total Posts
            </text>
        </g>
    );
};


export function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  if (!data) {
    return <p>No analytics data available for this organization.</p>;
  }

  const COLORS = ["#16A34A", "#2563EB", "#F97316", "#DC2626", "#9333EA", "#DB2777"];
  const totalPostsInCategoryChart = data.charts.postsByCategory.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader><CardTitle className="text-sm font-medium">Total Members</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{data.overview.totalMembers}</div></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm font-medium">Published Posts</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{data.overview.totalPosts}</div></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm font-medium">Total Views</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{data.overview.totalViews}</div></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm font-medium">Total Comments</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{data.overview.totalComments}</div></CardContent></Card>
      </div>

      {/* Main Chart Area */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Views Over Time</CardTitle>
            <CardDescription>Daily view count for the last 30 days. Drag the brush to zoom.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] pr-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.charts.viewsByDay}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip cursor={{ fill: 'hsl(var(--accent))' }} contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                <Bar dataKey="views" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Brush dataKey="date" height={30} stroke="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader><CardTitle>Posts by Category</CardTitle></CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.charts.postsByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                    {data.charts.postsByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                   <DonutCenterLabel total={totalPostsInCategoryChart} />
                  <Tooltip />
                  <Legend iconSize={10} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Top Performing Members</CardTitle><CardDescription>Members with the most posts published.</CardDescription></CardHeader>
            <CardContent className="h-[300px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={data.charts.topAuthors} margin={{left: 20}}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
                        <Tooltip cursor={{ fill: 'hsl(var(--accent))' }} />
                        <Bar dataKey="_count.posts" name="Posts" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        
        <Card>
            <CardHeader><CardTitle>Most Viewed Posts</CardTitle></CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Post Title</TableHead>
                            <TableHead className="text-right">Views</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.tables.topPosts.map(post => (
                            <TableRow key={post.id}>
                                <TableCell>
                                    <Link href={`/blog/${post.slug}`} className="font-medium hover:underline" target="_blank">
                                        {post.title}
                                    </Link>
                                </TableCell>
                                <TableCell className="text-right">{post._count.views}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}