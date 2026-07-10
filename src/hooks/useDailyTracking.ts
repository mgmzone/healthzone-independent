import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EventType } from '@/lib/types';
import {
  getEventTypes,
  getTrackedEvents,
  getTodayTotals,
  logTrackedEvent,
  deleteTrackedEvent,
} from '@/lib/services/trackingService';
import { useToast } from '@/hooks/use-toast';

function todayRange(): { start: Date; end: Date } {
  const now = new Date();
  return {
    start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0),
    end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999),
  };
}

// Powers the one-tap daily tracker tiles: the active tracker definitions, each
// tracker's summed total for today, and log / undo actions.
export function useDailyTracking() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: eventTypes = [], isLoading: typesLoading } = useQuery({
    queryKey: ['eventTypes'],
    queryFn: () => getEventTypes(false),
  });

  const { data: totals = {}, isLoading: totalsLoading } = useQuery({
    queryKey: ['trackedEventTotals', 'today'],
    queryFn: () => getTodayTotals(),
  });

  const { data: todayEvents = [] } = useQuery({
    queryKey: ['trackedEvents', 'today'],
    queryFn: () => {
      const { start, end } = todayRange();
      return getTrackedEvents(start, end);
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['trackedEventTotals', 'today'] });
    queryClient.invalidateQueries({ queryKey: ['trackedEvents', 'today'] });
  };

  const logEvent = useMutation({
    mutationFn: (params: { eventType: EventType; quantity?: number; notes?: string }) =>
      logTrackedEvent(params),
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
      const last = todayEvents.find((e) => e.eventKey === eventKey);
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
    todayEvents,
    isLoading: typesLoading || totalsLoading,
    logEvent: (eventType: EventType, quantity?: number) => logEvent.mutate({ eventType, quantity }),
    undoLast: (eventKey: string) => undoLast.mutate(eventKey),
    isLogging: logEvent.isPending,
  };
}
