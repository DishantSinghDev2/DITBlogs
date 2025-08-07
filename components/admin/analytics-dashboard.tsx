"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { format, subDays } from "date-fns";

// Import Chart.js components
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { getCssVariableHSL } from "@/lib/utils";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler);


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
  initialDateRange: { from?: Date; to?: Date };
}

export function AnalyticsDashboard({ data, initialDateRange }: AnalyticsDashboardProps) {
  const router = useRouter();
  const [date, setDate] = useState<DateRange | undefined>({
    from: initialDateRange.from || subDays(new Date(), 29),
    to: initialDateRange.to || new Date(),
  });

  // --- FIX: State for chart data that depends on client-side colors ---
  const [lineChartData, setLineChartData] = useState<any>(null);

  useEffect(() => {
    if (data) {
      const primaryColorHSL = getCssVariableHSL('--primary');
      const backgroundColorHSL = getCssVariableHSL('--background'); // Get background color too

      if (!primaryColorHSL || !backgroundColorHSL) return; // Exit if colors aren't ready

      // --- FIX: Replace spaces with commas ---
      const primaryColor = primaryColorHSL.replace(/\s/g, ', ');
      const backgroundColor = backgroundColorHSL.replace(/\s/g, ', ');

      setLineChartData({
        labels: data.charts.viewsByDay.map(d => format(new Date(d.date), "MMM d")),
        datasets: [{
          label: 'Views',
          data: data.charts.viewsByDay.map(d => d.views),
          borderColor: `hsl(${primaryColor})`, // Use the comma-separated string
          backgroundColor: (context: any) => {
              const ctx = context.chart.ctx;
              const gradient = ctx.createLinearGradient(0, 0, 0, 200);
              // Use the comma-separated string in the hsla() function
              gradient.addColorStop(0, `hsla(${primaryColor}, 0.3)`);
              gradient.addColorStop(1, `hsla(${primaryColor}, 0)`);
              return gradient;
          },
          tension: 0.4,
          fill: true,
          pointBackgroundColor: `hsl(${backgroundColor})`, // Use the comma-separated string
          pointBorderColor: `hsl(${primaryColor})`, // Use the comma-separated string
        }]
      });
    }
  }, [data]);


  // Function to update URL with new date range
  const handleDateChange = (newDate: DateRange | undefined) => {
    setDate(newDate);
    if (newDate?.from && newDate?.to) {
      const params = new URLSearchParams();
      params.set('from', format(newDate.from, 'yyyy-MM-dd'));
      params.set('to', format(newDate.to, 'yyyy-MM-dd'));
      router.push(`/dashboard/analytics?${params.toString()}`, { scroll: false });
    }
  }

  if (!data) {
    return <p>No analytics data available for this organization.</p>;
  }

  const donutChartData = {
    labels: data.charts.postsByCategory.map(c => c.name),
    datasets: [{
      data: data.charts.postsByCategory.map(c => c.value),
      backgroundColor: ["#16A34A", "#2563EB", "#F97316", "#DC2626", "#9333EA"],
      hoverOffset: 8,
      borderWidth: 0,
    }]
  };

  const barChartData = {
    labels: data.charts.topAuthors.map(a => a.name),
    datasets: [{
      label: 'Posts Published',
      data: data.charts.topAuthors.map(a => a._count.posts),
      backgroundColor: 'hsl(var(--primary))',
      borderRadius: 4,
    }]
  };


  return (
    <div className="space-y-6">
      {/* Date Range Picker and Overview Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button id="date" variant={"outline"} className="w-[300px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (date.to ? (<> {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")} </>) : (format(date.from, "LLL dd, y"))) : (<span>Pick a date</span>)}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar initialFocus mode="range" defaultMonth={date?.from} selected={date} onSelect={handleDateChange} />
          </PopoverContent>
        </Popover>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader><CardTitle className="text-sm font-medium">Total Members</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{data.overview.totalMembers}</div></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm font-medium">Published Posts</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{data.overview.totalPosts}</div></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm font-medium">Total Views</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{data.overview.totalViews}</div></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm font-medium">Total Comments</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{data.overview.totalComments}</div></CardContent></Card>
      </div>


      {/* --- Charts Area --- */}
      <Card>
        <CardHeader><CardTitle>Views Over Time</CardTitle></CardHeader>
        <CardContent className="h-[350px]">
          {/* --- FIX IS HERE --- */}
          {/* We only render the Line chart if lineChartData is NOT null. */}
          {/* Otherwise, we render a placeholder/loader. */}
          {lineChartData ? (
            <Line
              data={lineChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
          </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-[100vw]">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Posts by Category</CardTitle></CardHeader>
          <CardContent className="h-[300px]"><Doughnut data={donutChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} /></CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Top Performing Members</CardTitle></CardHeader>
          <CardContent className="h-[300px]"><Bar data={barChartData} options={{ indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} /></CardContent>
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
  );
}