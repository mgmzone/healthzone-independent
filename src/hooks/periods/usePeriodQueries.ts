
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Period } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ensureDate } from '@/lib/utils/dateUtils';

export function usePeriodQueries() {
  const { toast } = useToast();

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
        originalEndDate: item.end_date ? new Date(item.end_date) : undefined,
        type: item.type as 'weightLoss' | 'maintenance',
        startWeight: item.start_weight,
        targetWeight: item.target_weight,
        fastingSchedule: item.fasting_schedule || '16:8',
        weightLossPerWeek: item.weight_loss_per_week || 0.5,
        projectedEndDate: item.projected_end_date ? new Date(item.projected_end_date) : undefined
      })) as Period[];
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
    getCurrentPeriod
  };
}
