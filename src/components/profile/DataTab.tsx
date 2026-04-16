import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { exportAsCsv } from '@/lib/utils/csv';
import { useWeightData } from '@/hooks/useWeightData';
import { useExerciseData } from '@/hooks/useExerciseData';
import { useFastingData } from '@/hooks/useFastingData';
import { useMealData } from '@/hooks/useMealData';
import { useDailyGoalsData } from '@/hooks/useDailyGoalsData';
import { selfDeleteAccount } from '@/lib/services/admin';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

function stamp() {
  return new Date().toISOString().split('T')[0];
}

const DataTab: React.FC = () => {
  const { weighIns } = useWeightData();
  const { exerciseLogs } = useExerciseData();
  const { fastingLogs } = useFastingData();
  const { mealLogs } = useMealData();
  const { goals, entries } = useDailyGoalsData();
  const { user } = useAuth();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  const userEmail = user?.email || '';

  const handleSelfDelete = async () => {
    setDeleting(true);
    try {
      await selfDeleteAccount(deleteConfirm);
      toast.success('Account deleted. Signing out.');
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete account');
      setDeleting(false);
    }
  };

  const exports: Array<{ label: string; count: number; onClick: () => void }> = [
    {
      label: 'Weigh-ins',
      count: weighIns.length,
      onClick: () => exportAsCsv(`healthzone_weighins_${stamp()}.csv`, weighIns as any),
    },
    {
      label: 'Exercise logs',
      count: exerciseLogs.length,
      onClick: () => exportAsCsv(`healthzone_exercise_${stamp()}.csv`, exerciseLogs as any),
    },
    {
      label: 'Fasting logs',
      count: fastingLogs.length,
      onClick: () => exportAsCsv(`healthzone_fasting_${stamp()}.csv`, fastingLogs as any),
    },
    {
      label: 'Meal logs',
      count: mealLogs.length,
      onClick: () => exportAsCsv(`healthzone_meals_${stamp()}.csv`, mealLogs as any),
    },
    {
      label: 'Daily goals',
      count: goals.length,
      onClick: () => exportAsCsv(`healthzone_goals_${stamp()}.csv`, goals as any),
    },
    {
      label: 'Daily goal entries',
      count: entries.length,
      onClick: () => exportAsCsv(`healthzone_goal_entries_${stamp()}.csv`, entries as any),
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Export your data</h3>
        <p className="text-sm text-muted-foreground">
          Download CSV files of your tracked data. Exports include the records loaded for the active period.
        </p>
      </div>
      <div className="space-y-2">
        {exports.map(e => (
          <div
            key={e.label}
            className="flex items-center justify-between rounded-md border px-4 py-3"
          >
            <div>
              <div className="font-medium text-sm">{e.label}</div>
              <div className="text-xs text-muted-foreground">{e.count} record{e.count === 1 ? '' : 's'}</div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={e.onClick}
              disabled={e.count === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              CSV
            </Button>
          </div>
        ))}
      </div>

      <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4 mt-6 space-y-3">
        <div>
          <h3 className="text-base font-semibold text-destructive">Danger zone</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Delete your HealthZone account and every piece of data associated with it. This cannot be undone — export first if you want to keep anything.
          </p>
        </div>
        <AlertDialog
          open={deleteOpen}
          onOpenChange={(open) => {
            setDeleteOpen(open);
            if (!open) setDeleteConfirm('');
          }}
        >
          <AlertDialogTrigger asChild>
            <Button type="button" variant="destructive" size="sm">
              <Trash2 className="mr-2 h-4 w-4" /> Delete my account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete your account?</AlertDialogTitle>
              <AlertDialogDescription>
                Every meal, weigh-in, exercise, fasting session, period, milestone, and AI log tied to <strong>{userEmail}</strong> will be permanently deleted. You'll be signed out immediately.
                <br /><br />
                Type your email <code className="bg-muted px-1 rounded">{userEmail}</code> to confirm.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2 py-2">
              <Label htmlFor="self-delete-confirm">Confirm email</Label>
              <Input
                id="self-delete-confirm"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder={userEmail}
                autoComplete="off"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleSelfDelete}
                disabled={deleting || deleteConfirm.trim().toLowerCase() !== userEmail.toLowerCase()}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? 'Deleting…' : 'Delete permanently'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default DataTab;
