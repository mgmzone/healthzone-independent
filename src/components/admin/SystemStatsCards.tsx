import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BarChart, Dumbbell, Clock } from 'lucide-react';
import { SystemStats } from '@/lib/services/admin';

interface SystemStatsCardsProps {
  stats: SystemStats;
  isLoading: boolean;
}

const SystemStatsCards: React.FC<SystemStatsCardsProps> = ({ stats, isLoading }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-2xl font-bold">
              {isLoading ? <span className="animate-pulse">--</span> : stats.totalUsers}
            </span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Active Periods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <BarChart className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-2xl font-bold">
              {isLoading ? <span className="animate-pulse">--</span> : stats.activePeriods}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Dumbbell className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-2xl font-bold">
              {isLoading ? <span className="animate-pulse">--</span> : (
                stats.totalWeighIns + stats.totalFasts + stats.totalExercises
              )}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemStatsCards;
