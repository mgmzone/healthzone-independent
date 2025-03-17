
import { useMutation } from '@tanstack/react-query';
import { useWeightBase } from './useWeightBase';
import { usePeriodCalculations } from '@/hooks/periods/usePeriodCalculations';
import { performWeighInMutation } from './services/weighInMutationService';

export function useAddWeighIn() {
  const { toast, queryClient, supabase, getCurrentPeriod } = useWeightBase();
  const { calculateProjectedEndDate } = usePeriodCalculations();

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
      
      return performWeighInMutation(
        supabase,
        weight,
        date,
        currentPeriod,
        calculateProjectedEndDate,
        additionalMetrics
      );
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
