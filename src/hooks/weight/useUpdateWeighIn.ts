
import { useMutation } from '@tanstack/react-query';
import { useWeightBase } from './useWeightBase';

export function useUpdateWeighIn() {
  const { toast, queryClient, supabase } = useWeightBase();

  const updateWeighIn = useMutation({
    mutationFn: async ({ 
      id,
      weight, 
      date, 
      additionalMetrics 
    }: { 
      id: string,
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
      const { data, error } = await supabase
        .from('weigh_ins')
        .update({
          weight,
          date: date.toISOString(),
          bmi: additionalMetrics?.bmi || null,
          body_fat_percentage: additionalMetrics?.bodyFatPercentage || null,
          skeletal_muscle_mass: additionalMetrics?.skeletalMuscleMass || null,
          bone_mass: additionalMetrics?.boneMass || null,
          body_water_percentage: additionalMetrics?.bodyWaterPercentage || null
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weighIns'] });
      toast({
        title: 'Weight updated',
        description: 'Your weight record has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating weight',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Create a wrapper function to match the expected TypeScript interface
  const updateWeighInWrapper = (
    id: string,
    weight: number,
    date: Date,
    additionalMetrics: {
      bmi?: number;
      bodyFatPercentage?: number;
      skeletalMuscleMass?: number;
      boneMass?: number;
      bodyWaterPercentage?: number;
    }
  ) => {
    updateWeighIn.mutate({ id, weight, date, additionalMetrics });
  };

  return {
    updateWeighIn: updateWeighInWrapper
  };
}
