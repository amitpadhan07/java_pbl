'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, LogOut, Calendar, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format, subMonths } from 'date-fns';

export default function ReportsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('User');
  const [reports, setReports] = useState<any[]>([]);
  const [yearlyData, setYearlyData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    const storedUserName = localStorage.getItem('userName');

    if (!storedUserId) {
      router.push('/');
      return;
    }

    setUserId(storedUserId);
    setUserName(storedUserName || 'User');
    fetchReports(storedUserId);
  }, [router]);

  const fetchReports = async (userId: string) => {
    try {
      const response = await fetch(`/api/reports?userId=${userId}`);
      const data = await response.json();

      if (data.reports) {
        setReports(data.reports);
        
        // Transform data for chart
        const chartData = data.reports
          .sort((a: any, b: any) => new Date(a.month).getTime() - new Date(b.month).getTime())
          .slice(-12)
          .map((report: any) => ({
            month: format(new Date(report.month), 'MMM'),
            total: Math.round(report.totalEmissions * 100) / 100,
            transport: Math.round(report.transportEmissions * 100) / 100,
            energy: Math.round(report.energyEmissions * 100) / 100,
            waste: Math.round(report.wasteEmissions * 100) / 100,
          }));

        setYearlyData(chartData);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    router.push('/');
  };

  if (!userId) return null;

  const totalEmissions = reports.reduce((sum, r) => sum + (r.totalEmissions || 0), 0);
  const averageMonthly = reports.length > 0 ? totalEmissions / reports.length : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-primary">CarbonTrack</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, {userName}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Your Carbon Reports</h2>
          <p className="text-muted-foreground">Track your emissions over time and see your progress</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Emissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {Math.round(totalEmissions * 100) / 100} kg CO₂
              </div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Average Monthly</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {Math.round(averageMonthly * 100) / 100} kg CO₂
              </div>
              <p className="text-xs text-muted-foreground">Per month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Months Tracked</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{reports.length}</div>
              <p className="text-xs text-muted-foreground">Months with data</p>
            </CardContent>
          </Card>
        </div>

        {/* Yearly Trend */}
        {yearlyData.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Yearly Trend</CardTitle>
              <CardDescription>Your emissions over the last 12 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={yearlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value} kg CO₂`} />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981' }}
                    name="Total"
                  />
                  <Line
                    type="monotone"
                    dataKey="transport"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={{ fill: '#06b6d4' }}
                    name="Transport"
                  />
                  <Line
                    type="monotone"
                    dataKey="energy"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ fill: '#f59e0b' }}
                    name="Energy"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Monthly Breakdown */}
        {yearlyData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Monthly Breakdown</CardTitle>
              <CardDescription>Emissions breakdown by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={yearlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value} kg CO₂`} />
                  <Bar dataKey="transport" fill="#10b981" name="Transport" />
                  <Bar dataKey="energy" fill="#06b6d4" name="Energy" />
                  <Bar dataKey="waste" fill="#f59e0b" name="Waste" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {isLoading && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Loading reports...</p>
            </CardContent>
          </Card>
        )}

        {!isLoading && reports.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No reports yet. Log some activities to see your reports!</p>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="mt-8 flex gap-4">
          <Button onClick={() => router.push('/dashboard')} variant="outline">
            Back to Dashboard
          </Button>
          <Button onClick={() => router.push('/profile')} variant="outline">
            Go to Profile
          </Button>
        </div>
      </main>
    </div>
  );
}
