
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
      console.log("Adding weigh-in with data:", { weight, date, additionalMetrics });
      const currentPeriod = getCurrentPeriod();
      const userId = (await supabase.auth.getUser()).data.user?.id;
      
      if (!userId) {
        throw new Error("User not authenticated");
      }
      
      const weighInData = {
        weight,
        date: date.toISOString(),
        user_id: userId,
        period_id: currentPeriod?.id || null,
        bmi: additionalMetrics?.bmi || null,
        body_fat_percentage: additionalMetrics?.bodyFatPercentage || null,
        skeletal_muscle_mass: additionalMetrics?.skeletalMuscleMass || null,
        bone_mass: additionalMetrics?.boneMass || null,
        body_water_percentage: additionalMetrics?.bodyWaterPercentage || null
      };
      
      const { data, error } = await supabase
        .from('weigh_ins')
        .insert(weighInData)
        .select()
        .single();

      if (error) {
        console.error("Error inserting weigh-in:", error);
        throw error;
      }
      
      console.log("Weigh-in added successfully:", data);
      
      try {
        await updateProfileCurrentWeight(weight);
      } catch (profileError) {
        console.error('Error updating profile with new weight:', profileError);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weighIns'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['periods'] });
      toast({
        title: 'Weight added',
        description: 'Your weight has been recorded successfully.',
      });
    },
    onError: (error: Error) => {
      console.error("Error in add weigh-in mutation:", error);
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
