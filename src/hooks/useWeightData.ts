
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { WeighIn } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { usePeriodsData } from '@/hooks/usePeriodsData';

export function useWeightData() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { getCurrentPeriod } = usePeriodsData();

  const { data: weighIns = [], isLoading } = useQuery({
    queryKey: ['weighIns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weigh_ins')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching weigh-ins:', error);
        toast({
          title: 'Error fetching weight data',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }

      // Properly map database fields to our TypeScript interface
      return data.map(item => ({
        id: item.id,
        userId: item.user_id,
        periodId: item.period_id,
        date: new Date(item.date),
        weight: item.weight,
        bmi: item.bmi,
        bodyFatPercentage: item.body_fat_percentage,
        skeletalMuscleMass: item.skeletal_muscle_mass,
        boneMass: item.bone_mass,
        bodyWaterPercentage: item.body_water_percentage
      })) as WeighIn[];
    }
  });

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

  // Fixed: Changed to accept a combined object parameter rather than separate parameters
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

  const deleteWeighIn = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('weigh_ins')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weighIns'] });
      toast({
        title: 'Weight deleted',
        description: 'Your weight record has been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error deleting weight',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  return {
    weighIns,
    isLoading,
    addWeighIn: addWeighIn.mutate,
    updateWeighIn: updateWeighInWrapper, // Use the wrapper function
    deleteWeighIn: deleteWeighIn.mutate
  };
}
