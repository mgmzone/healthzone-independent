
import { useMutation } from '@tanstack/react-query';
import { useWeightBase } from './useWeightBase';
import { updateProfileCurrentWeight } from '@/lib/services/profileService';

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
      
      // Update the user's profile with the latest weight
      try {
        await updateProfileCurrentWeight(weight);
      } catch (profileError) {
        console.error('Error updating profile with new weight:', profileError);
        // We don't throw here, as we still want to consider the weigh-in successful
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weighIns'] });
      // Also invalidate the profile data to ensure it gets refreshed
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      // Also invalidate the periods data to get the updated projected end date
      queryClient.invalidateQueries({ queryKey: ['periods'] });
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
