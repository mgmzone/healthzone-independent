
import { useMutation } from '@tanstack/react-query';
import { useWeightBase } from './useWeightBase';

export function useDeleteWeighIn() {
  const { toast, queryClient, supabase } = useWeightBase();

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
    deleteWeighIn: deleteWeighIn.mutate
  };
}
