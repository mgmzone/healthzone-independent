
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { WeighIn } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export function useWeightData() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

      return data.map(item => ({
        ...item,
        date: new Date(item.date)
      })) as WeighIn[];
    }
  });

  const addWeighIn = useMutation({
    mutationFn: async (weight: number) => {
      const { data, error } = await supabase
        .from('weigh_ins')
        .insert([{
          weight,
          date: new Date().toISOString(),
          user_id: (await supabase.auth.getUser()).data.user?.id
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

  return {
    weighIns,
    isLoading,
    addWeighIn: addWeighIn.mutate
  };
}
