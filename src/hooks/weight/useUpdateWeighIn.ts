import { useMutation } from '@tanstack/react-query';
import { useWeightBase } from './useWeightBase';
import { useWeightQuery } from './useWeightQuery';
import { updateProfile } from '@/lib/services/profileService';
import { addWeeks, differenceInDays } from 'date-fns';

export function useUpdateWeighIn() {
  const { toast, queryClient, supabase, getCurrentPeriod } = useWeightBase();
  const { weighIns } = useWeightQuery();

  const calculateNewProjectedEndDate = async (periodId: string, currentWeight: number) => {
    try {
      const { data: periodData, error: periodError } = await supabase
        .from('periods')
        .select('*')
        .eq('id', periodId)
        .single();
      
      if (periodError || !periodData) return null;
      
      const { data: weighIns, error: weighInsError } = await supabase
        .from('weigh_ins')
        .select('*')
        .eq('period_id', periodId)
        .order('date', { ascending: true });
      
      if (weighInsError || !weighIns || weighIns.length < 2) return null;
      
      const oldestWeighIn = weighIns[0];
      const latestWeighIn = weighIns[weighIns.length - 1];
      
      const startDate = new Date(oldestWeighIn.date);
      const latestDate = new Date(latestWeighIn.date);
      const daysDifference = differenceInDays(latestDate, startDate);
      
      if (daysDifference < 1) return null;
      
      const totalWeightLoss = oldestWeighIn.weight - latestWeighIn.weight;
      
      if (periodData.type === 'weightLoss' && totalWeightLoss <= 0) return null;
      
      const linearWeightLossPerDay = totalWeightLoss / daysDifference;
      const weightLossPerWeek = linearWeightLossPerDay * 7;
      
      console.log('Calculated weight change rate:', {
        oldestWeight: oldestWeighIn.weight,
        latestWeight: latestWeighIn.weight, 
        totalWeightLoss,
        daysDifference,
        linearWeightLossPerDay,
        weightLossPerWeek,
        targetWeight: periodData.target_weight
      });
      
      if (weightLossPerWeek <= 0.05) return null;
      
      const remainingWeightToLose = latestWeighIn.weight - periodData.target_weight;
      
      if (remainingWeightToLose <= 0) return new Date();
      
      const linearDaysNeeded = remainingWeightToLose / linearWeightLossPerDay;
      
      const curvedDaysNeeded = Math.ceil(linearDaysNeeded * 1.7);
      
      console.log(`Projected days needed: ${curvedDaysNeeded} (curved) vs ${Math.ceil(linearDaysNeeded)} (linear)`);
      
      const projectedEndDate = new Date(latestDate);
      projectedEndDate.setDate(projectedEndDate.getDate() + curvedDaysNeeded);
      
      return projectedEndDate;
    } catch (error) {
      console.error("Error calculating projected end date:", error);
      return null;
    }
  };

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

      if (weighIns.length > 0 && weighIns[0].id === id) {
        try {
          await updateProfile({ currentWeight: weight });
        } catch (profileError) {
          console.error('Error updating profile with edited weight:', profileError);
        }
      }
      
      const { data: weighInData } = await supabase
        .from('weigh_ins')
        .select('period_id')
        .eq('id', id)
        .single();
      
      if (weighInData?.period_id) {
        const { data: periodData } = await supabase
          .from('periods')
          .select('type')
          .eq('id', weighInData.period_id)
          .single();
        
        if (periodData?.type === 'weightLoss') {
          try {
            const newProjectedEndDate = await calculateNewProjectedEndDate(weighInData.period_id, weight);
            
            if (newProjectedEndDate) {
              const updateResult = await supabase
                .from('periods')
                .update({ projected_end_date: newProjectedEndDate.toISOString() })
                .eq('id', weighInData.period_id);
                
              if (updateResult.error) {
                console.error("Error saving projected end date:", updateResult.error);
              } else {
                console.log("Successfully updated projected end date to:", newProjectedEndDate);
              }
            }
          } catch (e) {
            console.error("Error updating projected end date:", e);
          }
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weighIns'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['periods'] });
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
