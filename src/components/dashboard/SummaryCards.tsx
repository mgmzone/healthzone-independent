
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Scale, Timer, Calendar } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: string;
}

interface SummaryCardsProps {
  latestWeight: number | null;
  weightUnit: string;
  currentPeriod: any;
  exerciseLogs: any[];
  fastingLogs: any[];
  getDaysRemaining: (date: Date) => number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  latestWeight,
  weightUnit,
  currentPeriod,
  exerciseLogs,
  fastingLogs,
  getDaysRemaining
}) => {
  const summaryCards: SummaryCardProps[] = [
    {
      title: "Weight Progress",
      value: latestWeight ? `${latestWeight.toFixed(1)} ${weightUnit}` : "No data",
      icon: Scale,
      color: "#4287f5"
    },
    {
      title: "Active Period",
      value: currentPeriod ? `${getDaysRemaining(currentPeriod.endDate)} days left` : "No active period",
      icon: Calendar,
      color: "#f5a742"
    },
    {
      title: "Exercise Minutes",
      value: `${exerciseLogs.reduce((sum, log) => sum + log.minutes, 0)} mins`,
      icon: Activity,
      color: "#42f5ad"
    },
    {
      title: "Fasting Streaks",
      value: `${fastingLogs.filter(log => log.endTime).length} fasts`,
      icon: Timer,
      color: "#f542a7"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {summaryCards.map((card, index) => (
        <Card key={index} className="border-t-4" style={{ borderTopColor: card.color }}>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full" style={{ backgroundColor: `${card.color}10` }}>
                <card.icon className="h-5 w-5" style={{ color: card.color }} />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">{card.title}</h3>
                <p className="text-sm text-muted-foreground">{card.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
