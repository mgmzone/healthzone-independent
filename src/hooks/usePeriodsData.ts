import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Period } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

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
        type: item.type as 'weightLoss' | 'maintenance',
        startWeight: item.start_weight,
        targetWeight: item.target_weight,
        fastingSchedule: item.fasting_schedule || '16:8'
      })) as Period[];
    }
  });

  const addPeriod = useMutation({
    mutationFn: async (period: {
      startWeight: number,
      targetWeight: number,
      type: 'weightLoss' | 'maintenance',
      startDate: Date,
      endDate?: Date,
      fastingSchedule: string
    }) => {
      const { data, error } = await supabase
        .from('periods')
        .insert([{
          start_weight: period.startWeight,
          target_weight: period.targetWeight,
          type: period.type,
          start_date: period.startDate.toISOString(),
          end_date: period.endDate ? period.endDate.toISOString() : null,
          fasting_schedule: period.fastingSchedule,
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
      const { data, error } = await supabase
        .from('periods')
        .update({
          start_weight: period.startWeight,
          target_weight: period.targetWeight,
          type: period.type,
          start_date: period.startDate.toISOString(),
          end_date: period.endDate ? period.endDate.toISOString() : null,
          fasting_schedule: period.fastingSchedule
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
      const startDate = new Date(period.startDate);
      const endDate = period.endDate ? new Date(period.endDate) : null;
      
      return startDate <= today && (!endDate || endDate >= today);
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
