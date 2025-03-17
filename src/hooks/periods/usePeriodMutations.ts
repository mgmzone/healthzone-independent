
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Period } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { usePeriodCalculations } from './usePeriodCalculations';
import { ensureDate } from '@/lib/utils/dateUtils';

export function usePeriodMutations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { calculateProjectedEndDate } = usePeriodCalculations();

  const addPeriod = useMutation({
    mutationFn: async (period: {
      startWeight: number,
      targetWeight: number,
      type: 'weightLoss' | 'maintenance',
      startDate: Date,
      endDate?: Date,
      fastingSchedule: string,
      weightLossPerWeek: number
    }) => {
      const projectedEndDate = period.type === 'weightLoss' 
        ? calculateProjectedEndDate(period.startWeight, period.targetWeight, period.weightLossPerWeek, period.startDate)
        : undefined;
      
      const { data, error } = await supabase
        .from('periods')
        .insert([{
          start_weight: period.startWeight,
          target_weight: period.targetWeight,
          weight_loss_per_week: period.weightLossPerWeek,
          type: period.type,
          start_date: period.startDate.toISOString(),
          end_date: period.endDate ? period.endDate.toISOString() : null,
          original_end_date: period.endDate ? period.endDate.toISOString() : null,
          fasting_schedule: period.fastingSchedule,
          projected_end_date: projectedEndDate ? projectedEndDate.toISOString() : null,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }])
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['periods'] });
      toast({
        title: 'Period added',
        description: 'Your new period has been created successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error adding period',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const updatePeriod = useMutation({
    mutationFn: async (period: Period) => {
      const startDate = ensureDate(period.startDate);
      const endDate = period.endDate ? ensureDate(period.endDate) : null;
      
      const projectedEndDate = period.type === 'weightLoss' && startDate
        ? calculateProjectedEndDate(period.startWeight, period.targetWeight, period.weightLossPerWeek, startDate)
        : undefined;
      
      const { data, error } = await supabase
        .from('periods')
        .update({
          start_weight: period.startWeight,
          target_weight: period.targetWeight,
          weight_loss_per_week: period.weightLossPerWeek,
          type: period.type,
          start_date: startDate?.toISOString(),
          end_date: endDate ? endDate.toISOString() : null,
          fasting_schedule: period.fastingSchedule,
          projected_end_date: projectedEndDate ? projectedEndDate.toISOString() : null
        })
        .eq('id', period.id)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['periods'] });
      toast({
        title: 'Period updated',
        description: 'Your period has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating period',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const deletePeriod = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('periods')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['periods'] });
      toast({
        title: 'Period deleted',
        description: 'Your period has been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error deleting period',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  return {
    addPeriod: addPeriod.mutate,
    updatePeriod: updatePeriod.mutate,
    deletePeriod: deletePeriod.mutate
  };
}
