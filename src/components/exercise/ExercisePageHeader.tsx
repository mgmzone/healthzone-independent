import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { differenceInDays } from 'date-fns';
import { Heart, Dumbbell, Trophy, Wind, Activity } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { ExerciseLog, ExerciseCategory, EXERCISE_CATEGORIES, EXERCISE_CATEGORY_LABELS } from '@/lib/types';

interface ExercisePageHeaderProps {
  exerciseLogs: ExerciseLog[];
  isLoading: boolean;
}

const CATEGORY_META: Record<ExerciseCategory, { icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; color: string; colorLight: string }> = {
  cardio:      { icon: Heart,    color: '#f43f5e', colorLight: 'rgba(244, 63, 94, 0.1)' },
  resistance:  { icon: Dumbbell, color: '#f59e0b', colorLight: 'rgba(245, 158, 11, 0.1)' },
  sports:      { icon: Trophy,   color: '#10b981', colorLight: 'rgba(16, 185, 129, 0.1)' },
  flexibility: { icon: Wind,     color: '#0ea5e9', colorLight: 'rgba(14, 165, 233, 0.1)' },
  other:       { icon: Activity, color: '#a855f7', colorLight: 'rgba(168, 85, 247, 0.1)' },
};

const formatMinutes = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

const ExercisePageHeader: React.FC<ExercisePageHeaderProps> = ({ exerciseLogs, isLoading }) => {
  const { profile } = useAuth();
  const isImperial = profile?.measurementUnit === 'imperial';
  const today = new Date();

  const formatDistance = (distance: number): string => {
    if (distance === 0) return '—';
    if (isImperial) return `${(distance * 0.621371).toFixed(1)} mi`;
    return `${distance.toFixed(1)} km`;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        {EXERCISE_CATEGORIES.map((c) => (
          <Card key={c} className="border-t-4 animate-pulse">
            <CardContent className="pt-6 h-32"></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
      {EXERCISE_CATEGORIES.map((category) => {
        const activities = exerciseLogs.filter((e) => e.type === category);
        const sorted = [...activities].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const last = sorted[0] || null;
        const daysAgo = last ? differenceInDays(today, new Date(last.date)) : null;
        const totalTime = activities.reduce((sum, e) => sum + e.minutes, 0);
        const totalDistance = activities.reduce((sum, e) => sum + (e.distance || 0), 0);
        const meta = CATEGORY_META[category];
        const Icon = meta.icon;

        return (
          <Card key={category} className="border-t-4" style={{ borderTopColor: meta.color }}>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full" style={{ backgroundColor: meta.colorLight }}>
                  <Icon className="h-4 w-4" style={{ color: meta.color }} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm truncate">{EXERCISE_CATEGORY_LABELS[category]}</h3>
                  <p className="text-xs text-muted-foreground">{activities.length} logged</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                <div>
                  <p className="text-muted-foreground">Last</p>
                  <p className="font-medium">
                    {last
                      ? daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo}d ago`
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Time</p>
                  <p className="font-medium">{totalTime > 0 ? formatMinutes(totalTime) : '—'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Distance</p>
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

export default ExercisePageHeader;
