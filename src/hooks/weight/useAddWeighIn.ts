
import { useMutation } from '@tanstack/react-query';
import { useWeightBase } from './useWeightBase';
import { updateProfileCurrentWeight } from '@/lib/services/profileService';
import { addWeeks, differenceInDays } from 'date-fns';

export function useAddWeighIn() {
  const { toast, queryClient, getCurrentPeriod, supabase } = useWeightBase();

  const calculateNewProjectedEndDate = async (periodId: string, currentWeight: number) => {
    try {
      // Get period data with explicit table alias
      const { data: periodData, error: periodError } = await supabase
        .from('periods as p')
        .select('p.start_weight, p.target_weight, p.weight_loss_per_week')
        .eq('p.id', periodId)
        .single();
      
      if (periodError || !periodData) {
        console.error("Period data error:", periodError);
        return null;
      }
      
      // Get weigh-ins for analysis with explicit table alias
      const { data: weighIns, error: weighInsError } = await supabase
        .from('weigh_ins as w')
        .select('w.weight, w.date')
        .eq('w.period_id', periodId)
        .order('w.date', { ascending: true });
      
      if (weighInsError || !weighIns || weighIns.length < 2) {
        console.error("Weigh-ins data error or insufficient data:", weighInsError);
        return null;
      }
      
      // Calculate date differences and weight loss rate
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
      
      // Calculate total weight to lose and progress - using explicit variable names
      const periodStartWeight = periodData.start_weight;
      const periodTargetWeight = periodData.target_weight;
      const totalWeightToLose = currentWeight - periodTargetWeight;
      
      if (totalWeightToLose <= 0) {
        console.log("Already at or below target weight");
        return null;
      }
      
      const totalGoalWeight = periodStartWeight - periodTargetWeight;
      const currentProgress = (periodStartWeight - currentWeight) / totalGoalWeight;
      
      // Simulate gradual weight loss
      let remainingWeight = totalWeightToLose;
      let weeksNeeded = 0;
      
      while (remainingWeight > 0) {
        const progressFactor = Math.min(1, (periodStartWeight - currentWeight + (totalWeightToLose - remainingWeight)) / totalGoalWeight * 1.5);
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
            console.log("Attempting to update projected end date to:", newProjectedEndDate);
            
            // Use a direct, simple update with no ambiguity
            const { error: updateError } = await supabase
              .from('periods')
              .update({ projected_end_date: newProjectedEndDate.toISOString() })
              .eq('id', currentPeriod.id);
              
            if (updateError) {
              console.error("Error updating projected end date:", updateError);
            } else {
              console.log("Successfully updated projected end date to:", newProjectedEndDate);
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
