
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { differenceInDays } from 'date-fns';
import { Activity, Bike, Footprints } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { ExerciseLog } from '@/lib/types';

interface ExercisePageHeaderProps {
  exerciseLogs: ExerciseLog[];
  isLoading: boolean;
}

const ExercisePageHeader: React.FC<ExercisePageHeaderProps> = ({ exerciseLogs, isLoading }) => {
  const { profile } = useAuth();
  const isImperial = profile?.measurementUnit === 'imperial';

  // Group activities by type
  const walkingActivities = exerciseLogs.filter(e => e.type === 'walk');
  const runningActivities = exerciseLogs.filter(e => e.type === 'run');
  const cyclingActivities = exerciseLogs.filter(e => e.type === 'bike');
  
  const activityGroups = [
    { type: 'Walking', activities: walkingActivities, icon: Footprints },
    { type: 'Running', activities: runningActivities, icon: Activity },
    { type: 'Cycling', activities: cyclingActivities, icon: Bike }
  ];
  
  const today = new Date();
  
  const formatDistance = (distance: number): string => {
    if (isImperial) {
      // Convert km to miles
      const miles = distance * 0.621371;
      return `${miles.toFixed(1)} mi`;
    }
    return `${distance.toFixed(1)} km`;
  };
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-t-4 animate-pulse">
            <CardContent className="pt-6 h-40"></CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {activityGroups.map((activity, index) => {
        // Find the most recent activity of this type
        const sortedActivities = [...activity.activities].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        const lastActivity = sortedActivities.length > 0 ? sortedActivities[0] : null;
        const daysAgo = lastActivity ? differenceInDays(today, new Date(lastActivity.date)) : null;
        const totalTime = activity.activities.reduce((sum, e) => sum + e.minutes, 0);
        const totalDistance = activity.activities.reduce((sum, e) => sum + (e.distance || 0), 0);
        
        return (
          <Card key={index} className="border-t-4" style={{ borderTopColor: getActivityColor(activity.type) }}>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full" style={{ backgroundColor: getActivityColorLight(activity.type) }}>
                  <activity.icon className="h-5 w-5" style={{ color: getActivityColor(activity.type) }} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{activity.type} Activities</h3>
                  <p className="text-sm text-muted-foreground">{activity.activities.length}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Last Activity</p>
                  <p className="font-medium">
                    {activity.activities.length > 0 
                      ? (daysAgo === 0 
                        ? 'Today' 
                        : daysAgo === 1 
                          ? 'Yesterday' 
                          : `${daysAgo} days ago`) 
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Time</p>
                  <p className="font-medium">{formatMinutes(totalTime)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Distance</p>
                  <p className="font-medium">{formatDistance(totalDistance)}</p>
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
