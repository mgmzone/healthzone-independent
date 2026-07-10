import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useDailyTracking } from '@/hooks/useDailyTracking';
import TrackerTile from '@/components/tracking/TrackerTile';
import MedsChecklist from '@/components/tracking/MedsChecklist';
import VitalsQuickDialog from '@/components/tracking/VitalsQuickDialog';
import TrackerManagerDialog from '@/components/tracking/TrackerManagerDialog';
import MedicationManagerDialog from '@/components/tracking/MedicationManagerDialog';

// Days since surgery ("POD" = post-op day), read straight from profiles.surgery_date.
function usePostOpDay() {
  return useQuery({
    queryKey: ['surgeryDate'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;
      const { data } = await supabase
        .from('profiles')
        .select('surgery_date')
        .eq('id', session.user.id)
        .maybeSingle();
      const raw = (data as { surgery_date?: string | null } | null)?.surgery_date;
      if (!raw) return null;
      // date-only string → local noon to avoid TZ off-by-one
      const surgery = new Date(`${raw}T12:00:00`);
      const today = new Date();
      const days = Math.floor((today.getTime() - surgery.getTime()) / (1000 * 60 * 60 * 24));
      return days >= 0 ? days : null;
    },
  });
}

const TrackingToday: React.FC = () => {
  const { eventTypes, totals, isLoading, logEvent, undoLast, isLogging } = useDailyTracking();
  const { data: postOpDay } = usePostOpDay();

  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Layout>
      <div className="container mx-auto max-w-4xl p-4 pt-24 pb-32">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Today</h1>
          <p className="text-sm text-muted-foreground">
            {todayLabel}
            {postOpDay != null && (
              <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                Post-op day {postOpDay}
              </span>
            )}
          </p>
        </div>

        {/* One-tap trackers */}
        <section className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Trackers
            </h2>
            <TrackerManagerDialog />
          </div>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : eventTypes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No trackers yet. Starter trackers (water, ostomy, bag changes) are added automatically —
              refresh if you don't see them.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {eventTypes.map((et) => (
                <TrackerTile
                  key={et.id}
                  eventType={et}
                  total={totals[et.key] ?? 0}
                  onLog={() => logEvent(et)}
                  onUndo={() => undoLast(et.key)}
                  disabled={isLogging}
                />
              ))}
            </div>
          )}
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Medications */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Medications</CardTitle>
              <MedicationManagerDialog />
            </CardHeader>
            <CardContent>
              <MedsChecklist />
            </CardContent>
          </Card>

          {/* Vitals */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Vitals</CardTitle>
              <VitalsQuickDialog />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Record blood pressure, pulse, oxygen, and temperature. Multiple readings per day are fine.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default TrackingToday;
