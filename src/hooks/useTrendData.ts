import { useState, useEffect } from 'react';
import { Vitals, TrackedEvent, EventType, ExerciseLog } from '@/lib/types';
import { getVitalsInRange } from '@/lib/services/vitalsService';
import { getTrackedEvents, getEventTypes } from '@/lib/services/trackingService';
import { getExerciseLogsInRange } from '@/lib/services/exerciseService';

export const TREND_WINDOW_DAYS = 90;

// Fetches the full 90-day window once; the Trends card filters client-side
// when the user narrows the range, so switching 7/30/90 never refetches.
// Exercise is fetched here (range-based) rather than taken from the
// dashboard's useExerciseData, whose default 'week' filter would blank
// everything before Monday out of the chart.
export function useTrendData() {
  const [vitals, setVitals] = useState<Vitals[]>([]);
  const [trackedEvents, setTrackedEvents] = useState<TrackedEvent[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - TREND_WINDOW_DAYS);
      start.setHours(0, 0, 0, 0);

      const [vitalsData, eventsData, typesData, exerciseData] = await Promise.all([
        getVitalsInRange(start, end),
        getTrackedEvents(start, end),
        getEventTypes(),
        getExerciseLogsInRange(start, end),
      ]);

      if (cancelled) return;
      setVitals(vitalsData);
      setTrackedEvents(eventsData);
      setEventTypes(typesData);
      setExerciseLogs(exerciseData);
      setIsLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { vitals, trackedEvents, eventTypes, exerciseLogs, isLoading };
}
