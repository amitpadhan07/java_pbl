'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Leaf, LogOut, Plus, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import { ActivityForm } from '@/components/dashboard/activity-form';
import { ActivityList } from '@/components/dashboard/activity-list';
import { StatsOverview } from '@/components/dashboard/stats-overview';

export default function DashboardPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('User');
  const [activities, setActivities] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    transport: 0,
    energy: 0,
    waste: 0,
    count: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showActivityForm, setShowActivityForm] = useState(false);
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
    fetchActivities(storedUserId);
    fetchStats(storedUserId);
  }, [router]);

  const fetchActivities = async (userId: string) => {
    try {
      const response = await fetch(`/api/activities?userId=${userId}`);
      const data = await response.json();

      if (data.success) {
        setActivities(data.activities || []);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async (userId: string) => {
    try {
      const now = new Date();
      const month = new Date(now.getFullYear(), now.getMonth(), 1);

      const response = await fetch(
        `/api/reports?userId=${userId}&month=${month.toISOString()}`
      );
      const data = await response.json();

      if (data.report) {
        setStats({
          total: data.report.totalEmissions || 0,
          transport: data.report.transportEmissions || 0,
          energy: data.report.energyEmissions || 0,
          waste: data.report.wasteEmissions || 0,
          count: data.report.activityCount || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleActivityAdded = () => {
    if (userId) {
      fetchActivities(userId);
      fetchStats(userId);
      setShowActivityForm(false);
      toast.success('Activity added successfully!');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    router.push('/');
  };

  if (!userId) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-primary">CarbonTrack</h1>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-foreground hover:text-primary font-medium"
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push('/reports')}
              className="text-muted-foreground hover:text-primary"
            >
              Reports
            </button>
            <button
              onClick={() => router.push('/profile')}
              className="text-muted-foreground hover:text-primary"
            >
              Profile
            </button>
          </nav>
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
        {/* Stats Overview */}
        <StatsOverview stats={stats} />

        {/* Tabs */}
        <Tabs defaultValue="activities" className="mt-8">
          <TabsList>
            <TabsTrigger value="activities">Recent Activities</TabsTrigger>
            <TabsTrigger value="add">Add Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="activities" className="mt-6">
            {isLoading ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">Loading activities...</p>
                </CardContent>
              </Card>
            ) : activities.length > 0 ? (
              <ActivityList activities={activities} onRefresh={() => {
                if (userId) {
                  fetchActivities(userId);
                  fetchStats(userId);
                }
              }} />
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <TrendingDown className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No activities yet. Start tracking your carbon footprint!</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="add" className="mt-6">
            {userId && <ActivityForm userId={userId} onActivityAdded={handleActivityAdded} />}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
