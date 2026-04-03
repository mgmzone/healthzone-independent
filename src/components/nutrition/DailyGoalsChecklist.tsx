import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Flame, Trophy } from 'lucide-react';
import { DailyGoal, DailyGoalEntry, GOAL_CATEGORIES } from '@/lib/types';
import { format, addDays, subDays, isToday } from 'date-fns';

interface DailyGoalsChecklistProps {
  goals: DailyGoal[];
  entries: DailyGoalEntry[];
  onToggle: (goalId: string, date: Date, met: boolean) => Promise<any>;
  getEntriesForDate: (date: Date) => DailyGoalEntry[];
  getGoalStreak: (goalId: string) => number;
  getPerfectDayStreak: () => number;
}

const CATEGORY_COLORS: Record<string, string> = {
  dietary: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  hydration: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  supplement: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  lifestyle: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
};

const DailyGoalsChecklist: React.FC<DailyGoalsChecklistProps> = ({
  goals,
  onToggle,
  getEntriesForDate,
  getGoalStreak,
  getPerfectDayStreak,
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const dateEntries = getEntriesForDate(selectedDate);
  const perfectStreak = getPerfectDayStreak();

  // Group goals by category
  const groupedGoals = GOAL_CATEGORIES.reduce((acc, category) => {
    const categoryGoals = goals.filter(g => g.category === category);
    if (categoryGoals.length > 0) {
      acc.push({ category, goals: categoryGoals });
    }
    return acc;
  }, [] as { category: string; goals: DailyGoal[] }[]);

  const isGoalMet = (goalId: string) => {
    return dateEntries.some(e => e.goalId === goalId && e.met);
  };

  const handleToggle = async (goalId: string) => {
    const currentlyMet = isGoalMet(goalId);
    await onToggle(goalId, selectedDate, !currentlyMet);
  };

  const metCount = goals.filter(g => isGoalMet(g.id)).length;
  const totalCount = goals.length;
  const complianceRate = totalCount > 0 ? Math.round((metCount / totalCount) * 100) : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Daily Goals</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSelectedDate(prev => subDays(prev, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant={isToday(selectedDate) ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedDate(new Date())}
            >
              {isToday(selectedDate) ? 'Today' : format(selectedDate, 'MMM d, yyyy')}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSelectedDate(prev => addDays(prev, 1))}
              disabled={isToday(selectedDate)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">
            No goals configured yet. Add goals in the Manage Goals tab.
          </p>
        ) : (
          <>
            {groupedGoals.map(({ category, goals: categoryGoals }) => (
              <div key={category} className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground capitalize">{category}</h4>
                {categoryGoals.map(goal => {
                  const met = isGoalMet(goal.id);
                  const streak = getGoalStreak(goal.id);
                  return (
                    <div
                      key={goal.id}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={met}
                          onCheckedChange={() => handleToggle(goal.id)}
                        />
                        <div>
                          <span className={met ? 'line-through text-muted-foreground' : ''}>
                            {goal.name}
                          </span>
                          {goal.description && (
                            <p className="text-xs text-muted-foreground">{goal.description}</p>
                          )}
                        </div>
                      </div>
                      {streak > 0 && (
                        <div className="flex items-center gap-1 text-xs text-orange-500">
                          <Flame className="h-3 w-3" />
                          <span>{streak}d</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Summary footer */}
            <div className="border-t pt-3 mt-3 flex items-center justify-between">
              <div className="text-sm">
                <span className="font-medium">{metCount}/{totalCount}</span>
                <span className="text-muted-foreground ml-1">({complianceRate}%)</span>
              </div>
              {perfectStreak > 0 && (
                <div className="flex items-center gap-1.5 text-sm">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">{perfectStreak} day perfect streak</span>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyGoalsChecklist;
