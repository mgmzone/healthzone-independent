
import { useMutation } from '@tanstack/react-query';
import { useWeightBase } from './useWeightBase';
import { differenceInDays, addDays } from 'date-fns';
import { updateProfile } from '@/lib/services/profileService';
import { usePeriodCalculations } from '@/hooks/periods/usePeriodCalculations';

export function useAddWeighIn() {
  const { toast, queryClient, supabase, getCurrentPeriod } = useWeightBase();
  const { calculateProjectedEndDate } = usePeriodCalculations();

  const calculateProjectedEndDateFromWeights = async (periodId: string, currentWeight: number) => {
    try {
      // Get period details
      const { data: periodData, error: periodError } = await supabase
        .from('periods')
        .select('*')
        .eq('id', periodId)
        .single();
        
      if (periodError || !periodData) return null;
      
      // Only proceed for weight loss periods
      if (periodData.type !== 'weightLoss') return null;
      
      // Get all weigh-ins for this period
      const { data: weighIns, error: weighInsError } = await supabase
        .from('weigh_ins')
        .select('*')
        .eq('period_id', periodId)
        .order('date', { ascending: true });
        
      if (weighInsError || !weighIns || weighIns.length < 2) {
        // If we don't have enough data points, use the target weight loss rate
        // and the period starting weight
        const remainingWeight = currentWeight - periodData.target_weight;
        if (remainingWeight <= 0) return null;
        
        // Use the same algorithm as in usePeriodCalculations
        return calculateProjectedEndDate(
          currentWeight, 
          periodData.target_weight, 
          periodData.weight_loss_per_week, 
          new Date()
        );
      }
      
      // Calculate based on actual data
      const oldestWeighIn = weighIns[0];
      const latestWeight = currentWeight; // Use the new weight we're adding
      
      const startDate = new Date(oldestWeighIn.date);
      const latestDate = new Date(); // Use current date as the latest
      const daysDifference = differenceInDays(latestDate, startDate);
      
      if (daysDifference < 1) return null;
      
      // Calculate weight loss rate
      const totalWeightLoss = oldestWeighIn.weight - latestWeight;
      
      // Only proceed if we're actually losing weight
      if (totalWeightLoss <= 0) return null;
      
      // Get weekly rate from actual data
      const actualWeeklyRate = (totalWeightLoss / daysDifference) * 7;
      
      console.log('Add weigh-in projected end date calculation:', {
        startWeight: oldestWeighIn.weight,
        latestWeight,
        totalWeightLoss,
        daysDifference,
        actualWeeklyRate,
        targetWeight: periodData.target_weight
      });
      
      const remainingWeightToLose = latestWeight - periodData.target_weight;
      
      // If we've reached the target weight, return current date
      if (remainingWeightToLose <= 0) return new Date();
      
      // Use the same algorithm as in usePeriodCalculations
      return calculateProjectedEndDate(
        latestWeight, 
        periodData.target_weight, 
        actualWeeklyRate, 
        new Date()
      );
    } catch (error) {
      console.error("Error calculating projected end date:", error);
      return null;
    }
  };

  const addWeighIn = useMutation({
    mutationFn: async ({
      weight,
      date = new Date(),
      additionalMetrics = {}
    }: {
      weight: number;
      date?: Date;
      additionalMetrics?: {
        bmi?: number;
        bodyFatPercentage?: number;
        skeletalMuscleMass?: number;
        boneMass?: number;
        bodyWaterPercentage?: number;
      }
    }) => {
      // Get the current period to associate with this weigh-in
      const currentPeriod = getCurrentPeriod();
      
      const { data, error } = await supabase
        .from('weigh_ins')
        .insert({
          weight,
          date: date.toISOString(),
          bmi: additionalMetrics.bmi || null,
          body_fat_percentage: additionalMetrics.bodyFatPercentage || null,
          skeletal_muscle_mass: additionalMetrics.skeletalMuscleMass || null,
          bone_mass: additionalMetrics.boneMass || null,
          body_water_percentage: additionalMetrics.bodyWaterPercentage || null,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          period_id: currentPeriod?.id || null
        })
        .select()
        .single();

      if (error) throw error;

      // Update current weight in profile
      try {
        await updateProfile({ currentWeight: weight });
      } catch (profileError) {
        console.error('Error updating profile with new weight:', profileError);
      }
      
      // Update projected end date for the period if applicable
      if (currentPeriod?.id && currentPeriod.type === 'weightLoss') {
        try {
          const newProjectedEndDate = await calculateProjectedEndDateFromWeights(currentPeriod.id, weight);
          
          if (newProjectedEndDate) {
            console.log("Updating projected end date to:", newProjectedEndDate);
            
            const updateResult = await supabase
              .from('periods')
              .update({ projected_end_date: newProjectedEndDate.toISOString() })
              .eq('id', currentPeriod.id);
              
            if (updateResult.error) {
              console.error("Error updating projected end date:", updateResult.error);
            } else {
              console.log("Successfully updated projected end date to:", newProjectedEndDate);
            }
          }
        } catch (e) {
          console.error("Error updating projected end date:", e);
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
        description: 'Your weight has been added successfully.',
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
    addWeighIn: (
      weight: number,
      date: Date = new Date(),
      additionalMetrics: {
        bmi?: number;
        bodyFatPercentage?: number;
        skeletalMuscleMass?: number;
        boneMass?: number;
        bodyWaterPercentage?: number;
      } = {}
    ) => addWeighIn.mutate({ weight, date, additionalMetrics })
  };
}
