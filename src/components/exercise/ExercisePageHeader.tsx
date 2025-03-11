
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { differenceInDays } from 'date-fns';
import { mockExerciseLogs } from '@/lib/types';
import { Activity, Bike, Footprints } from 'lucide-react';

const ExercisePageHeader = () => {
  // Placeholder data until we connect to the Strava API
  const lastActivities = [
    { type: 'Walking', count: mockExerciseLogs.filter(e => e.type === 'walk').length, icon: Footprints },
    { type: 'Running', count: mockExerciseLogs.filter(e => e.type === 'run').length, icon: Activity },
    { type: 'Cycling', count: mockExerciseLogs.filter(e => e.type === 'bike').length, icon: Bike }
  ];
  
  const today = new Date();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {lastActivities.map((activity, index) => {
        // Find the most recent activity of this type
        const filtered = mockExerciseLogs.filter(e => 
          e.type === activity.type.toLowerCase().substring(0, 4)
        );
        
        // Calculate stats for this activity type
        const lastActivity = filtered.length > 0 ? filtered[0] : null;
        const daysAgo = lastActivity ? differenceInDays(today, lastActivity.date) : null;
        const totalTime = filtered.reduce((sum, e) => sum + e.minutes, 0);
        const totalDistance = filtered.reduce((sum, e) => sum + (e.distance || 0), 0);
        
        return (
          <Card key={index} className="border-t-4" style={{ borderTopColor: getActivityColor(activity.type) }}>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full" style={{ backgroundColor: getActivityColorLight(activity.type) }}>
                  <activity.icon className="h-5 w-5" style={{ color: getActivityColor(activity.type) }} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{activity.type} Activities</h3>
                  <p className="text-sm text-muted-foreground">{activity.count}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Last {activity.count > 0 ? daysAgo : '-'}</p>
                  <p className="font-medium">{activity.count > 0 ? (daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`) : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Time</p>
                  <p className="font-medium">{formatMinutes(totalTime)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Distance</p>
                  <p className="font-medium">{totalDistance.toFixed(1)} km</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

function getActivityColor(type: string): string {
  switch (type.toLowerCase()) {
    case 'walking': return '#4287f5';
    case 'running': return '#f5a742';
    case 'cycling': return '#42f5ad';
    default: return '#9c9c9c';
  }
}

function getActivityColorLight(type: string): string {
  switch (type.toLowerCase()) {
    case 'walking': return 'rgba(66, 135, 245, 0.1)';
    case 'running': return 'rgba(245, 167, 66, 0.1)';
    case 'cycling': return 'rgba(66, 245, 173, 0.1)';
    default: return 'rgba(156, 156, 156, 0.1)';
  }
}

function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

export default ExercisePageHeader;
