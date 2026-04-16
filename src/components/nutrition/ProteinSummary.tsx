import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MealLog, PROTEIN_TARGET_MIN as DEFAULT_MIN, PROTEIN_TARGET_MAX as DEFAULT_MAX } from '@/lib/types';
import { format, subDays } from 'date-fns';
import { toLocalDateString } from '@/lib/utils/dateUtils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';

interface ProteinSummaryProps {
  mealLogs: MealLog[];
  targetMealsPerDay: number;
  proteinTargetMin?: number;
  proteinTargetMax?: number;
}

const ProteinSummary: React.FC<ProteinSummaryProps> = ({
  mealLogs,
  targetMealsPerDay,
  proteinTargetMin,
  proteinTargetMax,
}) => {
  const PROTEIN_TARGET_MIN = proteinTargetMin ?? DEFAULT_MIN;
  const PROTEIN_TARGET_MAX = proteinTargetMax ?? DEFAULT_MAX;
  // Today's totals
  const todayStr = toLocalDateString(new Date());
  const todayMeals = mealLogs.filter(
    log => toLocalDateString(new Date(log.date)) === todayStr
  );
  const todayProtein = todayMeals.reduce((sum, m) => sum + (m.proteinGrams || 0), 0);
  const todayCarbs = todayMeals.reduce((sum, m) => sum + (m.carbsGrams || 0), 0);
  const todayFat = todayMeals.reduce((sum, m) => sum + (m.fatGrams || 0), 0);
  const todayCalories = todayMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const progressPercent = Math.min((todayProtein / PROTEIN_TARGET_MIN) * 100, 100);
  const hasAnyMacroData = mealLogs.some(
    m => m.carbsGrams != null || m.fatGrams != null || m.calories != null
  );

  // Last 14 days chart data
  const chartData = [];
  for (let i = 13; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dateStr = toLocalDateString(date);
    const dayMeals = mealLogs.filter(
      log => toLocalDateString(new Date(log.date)) === dateStr
    );
    const protein = dayMeals.reduce((sum, m) => sum + (m.proteinGrams || 0), 0);
    const carbs = dayMeals.reduce((sum, m) => sum + (m.carbsGrams || 0), 0);
    const fat = dayMeals.reduce((sum, m) => sum + (m.fatGrams || 0), 0);
    const calories = dayMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
    chartData.push({
      date: format(date, 'M/d'),
      protein,
      carbs,
      fat,
      calories,
      inRange: protein >= PROTEIN_TARGET_MIN && protein <= PROTEIN_TARGET_MAX,
      above: protein > PROTEIN_TARGET_MAX,
    });
  }

  // Streak: consecutive days hitting protein target
  let proteinStreak = 0;
  for (let i = 0; i < chartData.length; i++) {
    const day = chartData[chartData.length - 1 - i];
    // Skip today if no meals logged yet
    if (i === 0 && day.protein === 0) continue;
    if (day.protein >= PROTEIN_TARGET_MIN) {
      proteinStreak++;
    } else {
      break;
    }
  }

  // Violation-free streak
  let violationFreeStreak = 0;
  for (let i = 0; i < 90; i++) {
    const date = subDays(new Date(), i);
    const dateStr = toLocalDateString(date);
    const dayMeals = mealLogs.filter(
      log => toLocalDateString(new Date(log.date)) === dateStr
    );
    // Skip days with no meals logged
    if (dayMeals.length === 0) {
      if (i === 0) continue; // Today might not be logged yet
      break;
    }
    if (dayMeals.some(m => m.irritantViolation)) {
      break;
    }
    violationFreeStreak++;
  }

  const getBarColor = (entry: typeof chartData[0]) => {
    if (entry.protein === 0) return '#e5e7eb'; // gray for no data
    if (entry.inRange) return '#22c55e'; // green for in range
    if (entry.above) return '#f59e0b'; // amber for above
    return '#ef4444'; // red for below
  };

  return (
    <div className="space-y-4">
      {/* Today's progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Today's Protein</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-2xl">{todayProtein}g</span>
              <span className="text-muted-foreground self-end">
                Target: {PROTEIN_TARGET_MIN}-{PROTEIN_TARGET_MAX}g
              </span>
            </div>
            <Progress value={progressPercent} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {todayProtein >= PROTEIN_TARGET_MIN
                  ? todayProtein <= PROTEIN_TARGET_MAX
                    ? 'In range!'
                    : 'Above target'
                  : `${PROTEIN_TARGET_MIN - todayProtein}g to go`}
              </span>
              <span>{todayMeals.length}/{targetMealsPerDay} meals logged</span>
            </div>
          </div>

          {/* Today's macros */}
          {hasAnyMacroData && (
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-xl font-semibold">{Math.round(todayCarbs)}g</div>
                <div className="text-xs text-muted-foreground">Carbs</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold">{Math.round(todayFat)}g</div>
                <div className="text-xs text-muted-foreground">Fat</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold">{Math.round(todayCalories)}</div>
                <div className="text-xs text-muted-foreground">Calories</div>
              </div>
            </div>
          )}

          {/* Streaks */}
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{proteinStreak}</div>
              <div className="text-xs text-muted-foreground">Day protein streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{violationFreeStreak}</div>
              <div className="text-xs text-muted-foreground">Days violation-free</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 14-day trends */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">14-Day Trends</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Protein</div>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={[0, 'auto']} />
                  <Tooltip
                    formatter={(value: number) => [`${value}g`, 'Protein']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <ReferenceLine
                    y={PROTEIN_TARGET_MIN}
                    stroke="#22c55e"
                    strokeDasharray="3 3"
                    label={{ value: `${PROTEIN_TARGET_MIN}g`, position: 'right', fontSize: 10 }}
                  />
                  <ReferenceLine
                    y={PROTEIN_TARGET_MAX}
                    stroke="#f59e0b"
                    strokeDasharray="3 3"
                    label={{ value: `${PROTEIN_TARGET_MAX}g`, position: 'right', fontSize: 10 }}
                  />
                  <Bar dataKey="protein" radius={[2, 2, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={getBarColor(entry)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {hasAnyMacroData && (
            <div className="grid grid-cols-3 gap-3 pt-2 border-t">
              <MiniMacroChart data={chartData} dataKey="carbs" label="Carbs" unit="g" color="#3b82f6" />
              <MiniMacroChart data={chartData} dataKey="fat" label="Fat" unit="g" color="#a855f7" />
              <MiniMacroChart data={chartData} dataKey="calories" label="Calories" unit="" color="#f97316" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

interface MiniMacroChartProps {
  data: Array<{ date: string; carbs: number; fat: number; calories: number }>;
  dataKey: 'carbs' | 'fat' | 'calories';
  label: string;
  unit: string;
  color: string;
}

const MiniMacroChart: React.FC<MiniMacroChartProps> = ({ data, dataKey, label, unit, color }) => (
  <div>
    <div className="text-xs text-muted-foreground mb-1">{label}</div>
    <div className="h-[100px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <XAxis dataKey="date" tick={{ fontSize: 9 }} interval={1} />
          <YAxis tick={{ fontSize: 9 }} domain={[0, 'auto']} width={28} />
          <Tooltip
            formatter={(value: number) => [`${Math.round(value)}${unit}`, label]}
            labelFormatter={(lbl) => `Date: ${lbl}`}
          />
          <Bar dataKey={dataKey} fill={color} radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default ProteinSummary;
