
import { useMutation } from '@tanstack/react-query';
import { useWeightBase } from './useWeightBase';
import { updateProfileCurrentWeight } from '@/lib/services/profileService';
import { addWeeks, differenceInDays } from 'date-fns';

export function useAddWeighIn() {
  const { toast, queryClient, getCurrentPeriod, supabase } = useWeightBase();

  const calculateNewProjectedEndDate = async (periodId: string, currentWeight: number) => {
    try {
      // First get just the period ID to confirm it exists
      const { data: periodData, error: periodError } = await supabase
        .from('periods')
        .select('id, start_weight, target_weight, weight_loss_per_week')
        .eq('id', periodId)
        .single();
      
      if (periodError || !periodData) {
        console.error("Period data error:", periodError);
        return null;
      }
      
      // Get weigh-ins for this period
      const { data: weighIns, error: weighInsError } = await supabase
        .from('weigh_ins')
        .select('weight, date')
        .eq('period_id', periodId)
        .order('date', { ascending: true });
      
      if (weighInsError || !weighIns || weighIns.length < 2) {
        console.error("Weigh-ins data error or insufficient data:", weighInsError);
        return null;
      }
      
      // Calculate date differences and weight loss rate using local variables
      const oldestWeighIn = weighIns[0];
      const latestWeighIn = weighIns[weighIns.length - 1];
      
      const startDate = new Date(oldestWeighIn.date);
      const latestDate = new Date(latestWeighIn.date);
      const daysDifference = differenceInDays(latestDate, startDate);
      
      if (daysDifference < 1) {
        console.log("Insufficient day difference for calculation");
        return null;
      }
      
      // Calculate weight loss rate
      const initialWeightLossRate = 5.16; // Default high initial rate
      const finalWeightLossRate = 2.0; // Sustainable rate
      
      const totalWeightLoss = oldestWeighIn.weight - latestWeighIn.weight;
      let weightLossPerWeek = (totalWeightLoss / daysDifference) * 7;
      
      if (weightLossPerWeek <= 0.05) {
        weightLossPerWeek = periodData.weight_loss_per_week || 0.5;
      }
      
      // Store all values in local variables to avoid ambiguous column references
      const startWeight = periodData.start_weight;
      const targetWeight = periodData.target_weight;
      const totalWeightToLose = currentWeight - targetWeight;
      
      if (totalWeightToLose <= 0) {
        console.log("Already at or below target weight");
        return null;
      }
      
      const totalGoalWeight = startWeight - targetWeight;
      const currentProgress = (startWeight - currentWeight) / totalGoalWeight;
      
      // Simulate gradual weight loss
      let remainingWeight = totalWeightToLose;
      let weeksNeeded = 0;
      
      while (remainingWeight > 0) {
        const progressFactor = Math.min(1, (startWeight - currentWeight + (totalWeightToLose - remainingWeight)) / totalGoalWeight * 1.5);
        const currentRate = Math.max(
          finalWeightLossRate,
          weightLossPerWeek - (weightLossPerWeek - finalWeightLossRate) * progressFactor
        );
        
        remainingWeight -= currentRate;
        weeksNeeded++;
      }
      
      return addWeeks(new Date(), weeksNeeded);
    } catch (error) {
      console.error("Error calculating projected end date:", error);
      return null;
    }
  };

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
      
      // Insert the weigh-in record
      const { data, error } = await supabase
        .from('weigh_ins')
        .insert([{
          weight,
          date: date.toISOString(),
          user_id: userId,
          period_id: currentPeriod?.id || null,
          bmi: additionalMetrics?.bmi || null,
          body_fat_percentage: additionalMetrics?.bodyFatPercentage || null,
          skeletal_muscle_mass: additionalMetrics?.skeletalMuscleMass || null,
          bone_mass: additionalMetrics?.boneMass || null,
          body_water_percentage: additionalMetrics?.bodyWaterPercentage || null
        }])
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
      
      // Update the projected end date if this is a weight loss period
      if (currentPeriod?.id && currentPeriod.type === 'weightLoss') {
        try {
          const newProjectedEndDate = await calculateNewProjectedEndDate(currentPeriod.id, weight);
          
          if (newProjectedEndDate) {
            console.log("Calculated new projected end date:", newProjectedEndDate);
            
            // Simple update with no joins or complex queries
            const { error: updateError } = await supabase
              .from('periods')
              .update({ 
                projected_end_date: newProjectedEndDate.toISOString() 
              })
              .eq('id', currentPeriod.id);
              
            if (updateError) {
              console.error("Error updating projected end date:", updateError);
            } else {
              console.log("Successfully updated projected end date");
            }
          }
        } catch (e) {
          console.error("Error calculating or updating projected end date:", e);
        }
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
