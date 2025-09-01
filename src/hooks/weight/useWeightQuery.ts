
import { useQuery } from '@tanstack/react-query';
import { WeighIn } from '@/lib/types';
import { useWeightBase } from './useWeightBase';
import { getCurrentPeriodRange } from '@/lib/services/periodsService';

export function useWeightQuery() {
  const { toast, supabase } = useWeightBase();

  const { data: weighIns = [], isLoading } = useQuery({
    queryKey: ['weighIns'],
    queryFn: async () => {
      const period = await getCurrentPeriodRange();
      if (!period?.start) {
        // No active period → show no data
        return [] as WeighIn[];
      }

      let query = supabase
        .from('weigh_ins')
        .select('*')
        .order('date', { ascending: false });

      if (period?.start) {
        query = query.gte('date', period.start);
      }
      if (period?.end) {
        query = query.lte('date', period.end);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching weigh-ins:', error);
        toast({
          title: 'Error fetching weight data',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }

      // Properly map database fields to our TypeScript interface
      return data.map(item => ({
        id: item.id,
        userId: item.user_id,
        periodId: item.period_id,
        date: new Date(item.date),
        weight: item.weight,
        bmi: item.bmi,
        bodyFatPercentage: item.body_fat_percentage,
        skeletalMuscleMass: item.skeletal_muscle_mass,
        boneMass: item.bone_mass,
        bodyWaterPercentage: item.body_water_percentage
      })) as WeighIn[];
    }
  });

  return {
    weighIns,
    isLoading
  };
}
