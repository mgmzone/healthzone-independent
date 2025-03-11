
import { useMutation } from '@tanstack/react-query';
import { useWeightBase } from './useWeightBase';

export function useAddWeighIn() {
  const { toast, queryClient, getCurrentPeriod, supabase } = useWeightBase();

  const addWeighIn = useMutation({
    mutationFn: async ({ 
      weight, 
      date, 
      additionalMetrics 
    }: { 
      weight: number, 
      date: Date, 
      additionalMetrics?: {
        bmi?: number;
        bodyFatPercentage?: number;
        skeletalMuscleMass?: number;
        boneMass?: number;
        bodyWaterPercentage?: number;
      } 
    }) => {
      const currentPeriod = getCurrentPeriod();
      
      const { data, error } = await supabase
        .from('weigh_ins')
        .insert([{
          weight,
          date: date.toISOString(),
          user_id: (await supabase.auth.getUser()).data.user?.id,
          period_id: currentPeriod?.id || null,
          bmi: additionalMetrics?.bmi || null,
          body_fat_percentage: additionalMetrics?.bodyFatPercentage || null,
          skeletal_muscle_mass: additionalMetrics?.skeletalMuscleMass || null,
          bone_mass: additionalMetrics?.boneMass || null,
          body_water_percentage: additionalMetrics?.bodyWaterPercentage || null
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weighIns'] });
      toast({
        title: 'Weight added',
        description: 'Your weight has been recorded successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error adding weight',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  return {
    addWeighIn: addWeighIn.mutate
  };
}
