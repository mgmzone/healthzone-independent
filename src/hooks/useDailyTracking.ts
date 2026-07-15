import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EventType } from '@/lib/types';
import {
  getEventTypes,
  getTrackedEvents,
  logTrackedEvent,
  deleteTrackedEvent,
} from '@/lib/services/trackingService';
import { useToast } from '@/hooks/use-toast';
import { toLocalDateString, localDayRange, localNoon, isLocalToday } from '@/lib/utils/dateUtils';

// Powers the one-tap daily tracker tiles: the active tracker definitions, each
// tracker's summed total for the day, and log / undo actions. Defaults to today;
// pass a past date to view/backfill that day (entries land at local noon).
export function useDailyTracking(date: Date = new Date()) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const dateStr = toLocalDateString(date);
  const isToday = isLocalToday(date);

  const { data: eventTypes = [], isLoading: typesLoading } = useQuery({
    queryKey: ['eventTypes'],
    queryFn: () => getEventTypes(false),
  });

  const { data: dayEvents = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['trackedEvents', dateStr],
    queryFn: () => {
      const { start, end } = localDayRange(date);
      return getTrackedEvents(start, end);
    },
  });

  const totals = dayEvents.reduce<Record<string, number>>((acc, e) => {
    acc[e.eventKey] = (acc[e.eventKey] ?? 0) + e.quantity;
    return acc;
  }, {});

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['trackedEvents', dateStr] });
  };

  const logEvent = useMutation({
    mutationFn: (params: { eventType: EventType; quantity?: number; notes?: string }) =>
      logTrackedEvent({ ...params, occurredAt: isToday ? undefined : localNoon(date) }),
    onSuccess: (_data, params) => {
      invalidate();
      toast({ title: `Logged ${params.eventType.label}` });
    },
    onError: (error: Error) => {
      toast({ title: 'Could not log entry', description: error.message, variant: 'destructive' });
    },
  });

  // Undo the most recent event for a given tracker key (the "oops, tapped twice" case).
  const undoLast = useMutation({
    mutationFn: async (eventKey: string) => {
      const last = dayEvents.find((e) => e.eventKey === eventKey);
      if (!last) return;
      await deleteTrackedEvent(last.id);
    },
    onSuccess: (_data, eventKey) => {
      invalidate();
      toast({ title: 'Removed last entry' });
    },
    onError: (error: Error) => {
      toast({ title: 'Could not undo', description: error.message, variant: 'destructive' });
    },
  });

  return {
    eventTypes,
    totals,
    todayEvents: dayEvents,
    isLoading: typesLoading || eventsLoading,
    logEvent: (eventType: EventType, quantity?: number) => logEvent.mutate({ eventType, quantity }),
    undoLast: (eventKey: string) => undoLast.mutate(eventKey),
    isLogging: logEvent.isPending,
  };
}
