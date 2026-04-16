import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BarChart, Dumbbell, UtensilsCrossed, Brain, DollarSign } from 'lucide-react';
import { SystemStats } from '@/lib/services/admin';

interface SystemStatsCardsProps {
  stats: SystemStats;
  isLoading: boolean;
}

const Placeholder = () => <span className="animate-pulse">--</span>;

const StatCard: React.FC<{
  title: string;
  value: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  subtitle?: string;
}> = ({ title, value, icon: Icon, subtitle }) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex items-center">
        <Icon className="h-4 w-4 mr-2 text-muted-foreground" />
        <span className="text-2xl font-bold">{value}</span>
      </div>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </CardContent>
  </Card>
);

const SystemStatsCards: React.FC<SystemStatsCardsProps> = ({ stats, isLoading }) => {
  const totalActivities = stats.totalWeighIns + stats.totalFasts + stats.totalExercises;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
      <StatCard
        title="Total Users"
        value={isLoading ? <Placeholder /> : stats.totalUsers}
        icon={Users}
      />
      <StatCard
        title="Active Periods"
        value={isLoading ? <Placeholder /> : stats.activePeriods}
        icon={BarChart}
      />
      <StatCard
        title="Total Activities"
        value={isLoading ? <Placeholder /> : totalActivities}
        icon={Dumbbell}
        subtitle="Weigh-ins + exercises + fasting"
      />
      <StatCard
        title="Meals Logged"
        value={isLoading ? <Placeholder /> : stats.totalMeals}
        icon={UtensilsCrossed}
      />
      <StatCard
        title="AI Calls (30d)"
        value={isLoading ? <Placeholder /> : stats.aiCalls30d.toLocaleString()}
        icon={Brain}
      />
      <StatCard
        title="AI Cost On Us (30d)"
        value={isLoading ? <Placeholder /> : `$${stats.aiFallbackCost30d.toFixed(4)}`}
        icon={DollarSign}
        subtitle="Fallback-key spending"
      />
    </div>
  );
};

export default SystemStatsCards;
