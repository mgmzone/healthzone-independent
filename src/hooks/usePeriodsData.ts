import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Period } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ensureDate } from '@/lib/utils/dateUtils';
import { addWeeks, addDays } from 'date-fns';

export function usePeriodsData() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: periods = [], isLoading } = useQuery({
    queryKey: ['periods'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('periods')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) {
        console.error('Error fetching periods:', error);
        toast({
          title: 'Error fetching periods data',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }

      return data.map(item => ({
        id: item.id,
        userId: item.user_id,
        startDate: new Date(item.start_date),
        endDate: item.end_date ? new Date(item.end_date) : undefined,
        originalEndDate: item.end_date ? new Date(item.end_date) : undefined, // Use end_date as originalEndDate too
        type: item.type as 'weightLoss' | 'maintenance',
        startWeight: item.start_weight,
        targetWeight: item.target_weight,
        fastingSchedule: item.fasting_schedule || '16:8',
        weightLossPerWeek: item.weight_loss_per_week || 0.5,
        projectedEndDate: item.projected_end_date ? new Date(item.projected_end_date) : undefined
      })) as Period[];
    }
  });

  const calculateProjectedEndDate = (startWeight: number, targetWeight: number, weightLossPerWeek: number, startDate: Date) => {
    if (startWeight > targetWeight && weightLossPerWeek > 0) {
      const totalWeightToLose = startWeight - targetWeight;
      const weeksNeeded = Math.ceil(totalWeightToLose / weightLossPerWeek);
      return addWeeks(startDate, weeksNeeded);
    }
    return undefined;
  };

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

  const getCurrentPeriod = () => {
    const today = new Date();
    return periods.find(period => {
      const startDate = ensureDate(period.startDate);
      const endDate = ensureDate(period.endDate);
      
      return startDate && startDate <= today && (!endDate || endDate >= today);
    });
  };

  return {
    periods,
    isLoading,
    addPeriod: addPeriod.mutate,
    updatePeriod: updatePeriod.mutate,
    deletePeriod: deletePeriod.mutate,
    getCurrentPeriod
  };
}
