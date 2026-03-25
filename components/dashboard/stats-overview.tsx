'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Truck, Zap, Trash2 } from 'lucide-react';

interface StatsOverviewProps {
  stats: {
    total: number;
    transport: number;
    energy: number;
    waste: number;
    count: number;
  };
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const chartData = [
    {
      name: 'Transport',
      value: Math.round(stats.transport * 100) / 100,
      color: '#10b981',
    },
    {
      name: 'Energy',
      value: Math.round(stats.energy * 100) / 100,
      color: '#06b6d4',
    },
    {
      name: 'Waste',
      value: Math.round(stats.waste * 100) / 100,
      color: '#f59e0b',
    },
  ];

  const statCards = [
    {
      title: 'This Month',
      value: `${Math.round(stats.total * 100) / 100} kg CO₂`,
      description: 'Total emissions',
      icon: <Truck className="w-4 h-4" />,
      color: 'text-emerald-600',
    },
    {
      title: 'Transport',
      value: `${Math.round(stats.transport * 100) / 100} kg CO₂`,
      description: 'From travel',
      icon: <Truck className="w-4 h-4" />,
      color: 'text-emerald-600',
    },
    {
      title: 'Energy',
      value: `${Math.round(stats.energy * 100) / 100} kg CO₂`,
      description: 'From energy use',
      icon: <Zap className="w-4 h-4" />,
      color: 'text-cyan-600',
    },
    {
      title: 'Waste',
      value: `${Math.round(stats.waste * 100) / 100} kg CO₂`,
      description: 'From waste',
      icon: <Trash2 className="w-4 h-4" />,
      color: 'text-amber-600',
    },
  ];

  const pieData = chartData.filter(item => item.value > 0);

  const pieLabel = ({ name, percent, value }: { name: string; percent: number; value: number }) => {
    // Hide labels for zero/tiny slices to avoid text collisions.
    if (!value || percent < 0.04) return '';
    return `${name} ${(percent * 100).toFixed(0)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <span className={stat.color}>{stat.icon}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Emissions Breakdown</CardTitle>
            <CardDescription>This month's emissions by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `${value} kg CO₂`} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Emissions Distribution</CardTitle>
            <CardDescription>Percentage breakdown by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={pieLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" align="center" />
                <Tooltip formatter={(value) => `${value} kg CO₂`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
