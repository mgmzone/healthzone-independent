
import { useMutation } from '@tanstack/react-query';
import { useWeightBase } from './useWeightBase';
import { useWeightQuery } from './useWeightQuery';
import { updateProfile } from '@/lib/services/profileService';

export function useUpdateWeighIn() {
  const { toast, queryClient, supabase } = useWeightBase();
  const { weighIns } = useWeightQuery();

  const updateWeighIn = useMutation({
    mutationFn: async ({
      id,
      weight,
      date,
      additionalMetrics
    }: {
      id: string;
      weight: number;
      date: Date;
      additionalMetrics: {
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
          bmi: additionalMetrics.bmi || null,
          body_fat_percentage: additionalMetrics.bodyFatPercentage || null,
          skeletal_muscle_mass: additionalMetrics.skeletalMuscleMass || null,
          bone_mass: additionalMetrics.boneMass || null,
          body_water_percentage: additionalMetrics.bodyWaterPercentage || null
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // If this is the latest weigh-in, update the profile
      if (weighIns.length > 0 && weighIns[0].id === id) {
        try {
          await updateProfile({ currentWeight: weight });
        } catch (profileError) {
          console.error('Error updating profile with edited weight:', profileError);
          // We don't throw here to still consider the weigh-in update successful
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weighIns'] });
      // Also invalidate the profile data
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: 'Weight updated',
        description: 'Your weight entry has been updated successfully.',
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

  return {
    updateWeighIn: (
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
    ) => updateWeighIn.mutate({ id, weight, date, additionalMetrics })
  };
}
