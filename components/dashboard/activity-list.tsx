'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, Zap, Trash2, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { format } from 'date-fns';

interface ActivityListProps {
  activities: any[];
  onRefresh: () => void;
}

export function ActivityList({ activities, onRefresh }: ActivityListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'TRANSPORT':
        return <Truck className="w-4 h-4 text-emerald-600" />;
      case 'ENERGY':
        return <Zap className="w-4 h-4 text-cyan-600" />;
      case 'WASTE':
        return <Trash2 className="w-4 h-4 text-amber-600" />;
      default:
        return null;
    }
  };

  const getActivityLabel = (activity: any) => {
    if (activity.activityType === 'TRANSPORT') {
      return `${activity.transportMode.charAt(0) + activity.transportMode.slice(1).toLowerCase()} - ${activity.distance} km`;
    } else if (activity.activityType === 'ENERGY') {
      return `${activity.energyType.replace(/_/g, ' ')} - ${activity.consumption} kWh`;
    } else if (activity.activityType === 'WASTE') {
      return `${activity.wasteType.charAt(0) + activity.wasteType.slice(1).toLowerCase()} - ${activity.amount} kg`;
    }
    return 'Unknown Activity';
  };

  const handleDelete = async (activityId: string) => {
    if (!confirm('Are you sure you want to delete this activity?')) return;

    setDeletingId(activityId);
    try {
      const response = await fetch(`/api/activities/${activityId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Activity deleted successfully');
        onRefresh();
      } else {
        toast.error('Failed to delete activity');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
        <CardDescription>Your logged activities this month</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.slice(0, 20).map((activity) => (
            <div
              key={activity._id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
                  {getActivityIcon(activity.activityType)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{getActivityLabel(activity)}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(activity.createdAt), 'MMM dd, yyyy')}
                    {activity.notes && ` • ${activity.notes}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-semibold text-sm">
                    {Math.round(activity.emissions * 100) / 100} kg CO₂
                  </p>
                  <p className="text-xs text-muted-foreground">{activity.activityType}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(activity._id)}
                  disabled={deletingId === activity._id}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
