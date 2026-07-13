import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import { format } from 'date-fns';
import {
  WeighIn,
  MealLog,
  PROTEIN_TARGET_MIN,
  PROTEIN_TARGET_MAX,
} from '@/lib/types';
import { useTrendData } from '@/hooks/useTrendData';
import { toLocalDateString } from '@/lib/utils/dateUtils';
import { convertWeight } from '@/lib/weight/convertWeight';

const METRIC_STORAGE_KEY = 'hz-trends-metric';
const RANGE_STORAGE_KEY = 'hz-trends-range';

const DIASTOLIC_COLOR = '#f59e0b'; // amber; CVD-safe pair with the sky primary
const TARGET_COLOR = '#10b981';

type MetricKind = 'line' | 'bar' | 'bp';

interface TrendMetric {
  key: string;
  label: string;
  group: 'Vitals' | 'Daily counts' | 'Nutrition' | 'Activity' | 'Weight';
  kind: MetricKind;
  unit?: string;
  target?: number;
  targetBand?: [number, number];
  decimals: number;
}

interface DayPoint {
  day: string;
  label: string;
  value: number | null;
  systolic?: number | null;
  diastolic?: number | null;
}

// Vitals fields that trend as a single line, in dropdown order.
const VITAL_FIELDS = [
  { field: 'pulse', label: 'Pulse', unit: 'bpm' },
  { field: 'oxygenSaturation', label: 'Oxygen saturation', unit: '%' },
  { field: 'temperature', label: 'Temperature', unit: '°' },
  { field: 'bloodGlucose', label: 'Blood glucose', unit: 'mg/dL' },
  { field: 'respiratoryRate', label: 'Respiratory rate', unit: 'br/min' },
] as const;

interface TrendsSectionProps {
  weighIns: WeighIn[];
  mealLogs: MealLog[];
  isImperial: boolean;
  proteinTargetMin?: number;
  proteinTargetMax?: number;
}

const TrendsSection: React.FC<TrendsSectionProps> = ({
  weighIns,
  mealLogs,
  isImperial,
  proteinTargetMin,
  proteinTargetMax,
}) => {
  // exerciseLogs come from the trend hook (full 90-day range) — the dashboard's
  // own exercise data is week-filtered and would truncate the chart.
  const { vitals, trackedEvents, eventTypes, exerciseLogs, isLoading } = useTrendData();

  const [rangeDays, setRangeDays] = useState<number>(() => {
    const stored = Number(localStorage.getItem(RANGE_STORAGE_KEY));
    return [7, 30, 90].includes(stored) ? stored : 30;
  });
  const [metricKey, setMetricKey] = useState<string>(
    () => localStorage.getItem(METRIC_STORAGE_KEY) || ''
  );

  const weightUnit = isImperial ? 'lbs' : 'kg';
  const proteinBand: [number, number] = [
    proteinTargetMin ?? PROTEIN_TARGET_MIN,
    proteinTargetMax ?? PROTEIN_TARGET_MAX,
  ];

  // Per-day aggregates over the full 90-day window, computed once.
  const aggregates = useMemo(() => {
    const vitalSums = new Map<string, Map<string, { sum: number; count: number }>>();
    for (const v of vitals) {
      const day = toLocalDateString(v.measuredAt);
      let fields = vitalSums.get(day);
      if (!fields) {
        fields = new Map();
        vitalSums.set(day, fields);
      }
      const record = (field: string, value?: number) => {
        if (value == null) return;
        const acc = fields!.get(field) ?? { sum: 0, count: 0 };
        acc.sum += value;
        acc.count += 1;
        fields!.set(field, acc);
      };
      record('systolic', v.systolic);
      record('diastolic', v.diastolic);
      record('pulse', v.pulse);
      record('oxygenSaturation', v.oxygenSaturation);
      record('temperature', v.temperature);
      record('bloodGlucose', v.bloodGlucose);
      record('respiratoryRate', v.respiratoryRate);
    }

    const eventSums = new Map<string, Map<string, number>>();
    for (const e of trackedEvents) {
      const day = toLocalDateString(e.occurredAt);
      let keys = eventSums.get(day);
      if (!keys) {
        keys = new Map();
        eventSums.set(day, keys);
      }
      keys.set(e.eventKey, (keys.get(e.eventKey) ?? 0) + e.quantity);
    }

    const proteinByDay = new Map<string, number>();
    for (const m of mealLogs) {
      const day = toLocalDateString(new Date(m.date));
      proteinByDay.set(day, (proteinByDay.get(day) ?? 0) + (m.proteinGrams || 0));
    }

    const exerciseByDay = new Map<string, number>();
    for (const e of exerciseLogs) {
      const day = toLocalDateString(new Date(e.date));
      exerciseByDay.set(day, (exerciseByDay.get(day) ?? 0) + (e.minutes || 0));
    }

    const weightByDay = new Map<string, { sum: number; count: number }>();
    for (const w of weighIns) {
      const day = toLocalDateString(new Date(w.date));
      const acc = weightByDay.get(day) ?? { sum: 0, count: 0 };
      acc.sum += w.weight;
      acc.count += 1;
      weightByDay.set(day, acc);
    }

    return { vitalSums, eventSums, proteinByDay, exerciseByDay, weightByDay };
  }, [vitals, trackedEvents, mealLogs, exerciseLogs, weighIns]);

  const metrics = useMemo<TrendMetric[]>(() => {
    const list: TrendMetric[] = [];

    const hasVitalField = (field: string) => {
      for (const fields of aggregates.vitalSums.values()) {
        if (fields.has(field)) return true;
      }
      return false;
    };

    if (hasVitalField('systolic') || hasVitalField('diastolic')) {
      list.push({
        key: 'vital:bp',
        label: 'Blood pressure',
        group: 'Vitals',
        kind: 'bp',
        unit: 'mmHg',
        decimals: 0,
      });
    }
    for (const vf of VITAL_FIELDS) {
      if (!hasVitalField(vf.field)) continue;
      const unit =
        vf.field === 'temperature'
          ? `°${vitals.find((v) => v.temperature != null)?.temperatureUnit ?? 'F'}`
          : vf.unit;
      list.push({
        key: `vital:${vf.field}`,
        label: vf.label,
        group: 'Vitals',
        kind: 'line',
        unit,
        decimals: vf.field === 'temperature' ? 1 : 0,
      });
    }

    for (const et of eventTypes) {
      list.push({
        key: `event:${et.key}`,
        label: et.label,
        group: 'Daily counts',
        kind: 'bar',
        unit: et.unit,
        target: et.dailyTarget,
        decimals: 0,
      });
    }

    if (mealLogs.length > 0) {
      list.push({
        key: 'protein',
        label: 'Protein per day',
        group: 'Nutrition',
        kind: 'bar',
        unit: 'g',
        targetBand: proteinBand,
        decimals: 0,
      });
    }
    if (exerciseLogs.length > 0) {
      list.push({
        key: 'exercise',
        label: 'Exercise minutes',
        group: 'Activity',
        kind: 'bar',
        unit: 'min',
        decimals: 0,
      });
    }
    if (weighIns.length > 0) {
      list.push({
        key: 'weight',
        label: 'Weight',
        group: 'Weight',
        kind: 'line',
        unit: weightUnit,
        decimals: 1,
      });
    }

    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aggregates, eventTypes, vitals, mealLogs.length, exerciseLogs.length, weighIns.length, weightUnit, proteinBand[0], proteinBand[1]]);

  // Fall back when the stored metric no longer exists (e.g. tracker deleted).
  useEffect(() => {
    if (isLoading || metrics.length === 0) return;
    if (!metrics.some((m) => m.key === metricKey)) {
      setMetricKey(metrics[0].key);
    }
  }, [isLoading, metrics, metricKey]);

  const metric = metrics.find((m) => m.key === metricKey);

  const chartData = useMemo<DayPoint[]>(() => {
    if (!metric) return [];

    const days: DayPoint[] = [];
    for (let i = rangeDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const day = toLocalDateString(d);
      days.push({ day, label: format(d, 'MMM d'), value: null });
    }

    const avg = (acc?: { sum: number; count: number }) =>
      acc && acc.count > 0 ? acc.sum / acc.count : null;

    for (const point of days) {
      if (metric.kind === 'bp') {
        const fields = aggregates.vitalSums.get(point.day);
        point.systolic = avg(fields?.get('systolic'));
        point.diastolic = avg(fields?.get('diastolic'));
      } else if (metric.key.startsWith('vital:')) {
        const field = metric.key.slice('vital:'.length);
        point.value = avg(aggregates.vitalSums.get(point.day)?.get(field));
      } else if (metric.key.startsWith('event:')) {
        const key = metric.key.slice('event:'.length);
        point.value = aggregates.eventSums.get(point.day)?.get(key) ?? 0;
      } else if (metric.key === 'protein') {
        point.value = aggregates.proteinByDay.get(point.day) ?? 0;
      } else if (metric.key === 'exercise') {
        point.value = aggregates.exerciseByDay.get(point.day) ?? 0;
      } else if (metric.key === 'weight') {
        const raw = avg(aggregates.weightByDay.get(point.day));
        point.value = raw == null ? null : convertWeight(raw, isImperial);
      }
    }
    return days;
  }, [metric, rangeDays, aggregates, isImperial]);

  const hasData = useMemo(() => {
    if (!metric) return false;
    if (metric.kind === 'bp') {
      return chartData.some((p) => p.systolic != null || p.diastolic != null);
    }
    if (metric.kind === 'bar') return chartData.some((p) => (p.value ?? 0) > 0);
    return chartData.some((p) => p.value != null);
  }, [metric, chartData]);

  const handleMetricChange = (key: string) => {
    setMetricKey(key);
    localStorage.setItem(METRIC_STORAGE_KEY, key);
  };

  const handleRangeChange = (value: string) => {
    if (!value) return; // toggle-group emits '' when re-clicking the active item
    const days = Number(value);
    setRangeDays(days);
    localStorage.setItem(RANGE_STORAGE_KEY, String(days));
  };

  const groups = ['Vitals', 'Daily counts', 'Nutrition', 'Activity', 'Weight'] as const;

  const tooltipStyle = {
    backgroundColor: 'hsl(var(--card))',
    borderColor: 'hsl(var(--border))',
    borderRadius: '0.5rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  };

  const formatValue = (value: number) =>
    `${value.toFixed(metric?.decimals ?? 0)}${metric?.unit ? ` ${metric.unit}` : ''}`;

  const axisProps = {
    stroke: 'hsl(var(--muted-foreground))',
    fontSize: 12,
    tickLine: false,
    axisLine: { stroke: 'hsl(var(--border))' },
  };

  const renderChart = () => {
    if (isLoading) {
      return (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          Loading…
        </div>
      );
    }
    if (!metric || !hasData) {
      return (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          {metric
            ? `No ${metric.label.toLowerCase()} data in the last ${rangeDays} days.`
            : 'Nothing to trend yet — log some data and it will show up here.'}
        </div>
      );
    }

    const margin = { top: 10, right: 10, left: 0, bottom: 0 };

    if (metric.kind === 'bar') {
      // Keep the target line/band on-screen even when the data sits below it.
      const targetTop = Math.max(metric.target ?? 0, metric.targetBand?.[1] ?? 0);
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={margin} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="label" minTickGap={24} {...axisProps} />
            <YAxis
              width={44}
              allowDecimals={false}
              domain={[0, (dataMax: number) => Math.max(dataMax, targetTop)]}
              {...axisProps}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
              formatter={(value: number) => [formatValue(value), metric.label]}
            />
            {metric.targetBand && (
              <ReferenceArea
                y1={metric.targetBand[0]}
                y2={metric.targetBand[1]}
                fill={TARGET_COLOR}
                fillOpacity={0.08}
                stroke={TARGET_COLOR}
                strokeOpacity={0.35}
                strokeDasharray="4 4"
              />
            )}
            {metric.target != null && (
              <ReferenceLine
                y={metric.target}
                stroke={TARGET_COLOR}
                strokeDasharray="4 4"
                label={{
                  value: `target ${metric.target}`,
                  position: 'insideTopRight',
                  fill: TARGET_COLOR,
                  fontSize: 11,
                }}
              />
            )}
            <Bar
              dataKey="value"
              name={metric.label}
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
            />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (metric.kind === 'bp') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={margin}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="label" minTickGap={24} {...axisProps} />
            <YAxis width={44} domain={['auto', 'auto']} {...axisProps} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: number, name: string) => [formatValue(value), name]}
            />
            <Legend iconType="plainline" wrapperStyle={{ fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="systolic"
              name="Systolic"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="diastolic"
              name="Diastolic"
              stroke={DIASTOLIC_COLOR}
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={margin}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis dataKey="label" minTickGap={24} {...axisProps} />
          <YAxis width={44} domain={['auto', 'auto']} {...axisProps} />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value: number) => [formatValue(value), metric.label]}
          />
          <Line
            type="monotone"
            dataKey="value"
            name={metric.label}
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Card className="w-full mb-8">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle>Trends</CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={metric?.key ?? ''} onValueChange={handleMetricChange}>
              <SelectTrigger className="w-[200px]" aria-label="Metric">
                <SelectValue placeholder="Choose a metric" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => {
                  const items = metrics.filter((m) => m.group === group);
                  if (items.length === 0) return null;
                  return (
                    <SelectGroup key={group}>
                      <SelectLabel>{group}</SelectLabel>
                      {items.map((m) => (
                        <SelectItem key={m.key} value={m.key}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  );
                })}
              </SelectContent>
            </Select>
            <ToggleGroup
              type="single"
              size="sm"
              value={String(rangeDays)}
              onValueChange={handleRangeChange}
              aria-label="Time range"
            >
              <ToggleGroupItem value="7">7d</ToggleGroupItem>
              <ToggleGroupItem value="30">30d</ToggleGroupItem>
              <ToggleGroupItem value="90">90d</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[280px]">{renderChart()}</CardContent>
    </Card>
  );
};

export default TrendsSection;
