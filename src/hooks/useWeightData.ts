
import { useWeightQuery } from './weight/useWeightQuery';
import { useAddWeighIn } from './weight/useAddWeighIn';
import { useUpdateWeighIn } from './weight/useUpdateWeighIn';
import { useDeleteWeighIn } from './weight/useDeleteWeighIn';

export function useWeightData() {
  const { weighIns, isLoading } = useWeightQuery();
  const { addWeighIn } = useAddWeighIn();
  const { updateWeighIn } = useUpdateWeighIn();
  const { deleteWeighIn } = useDeleteWeighIn();

  return {
    weighIns,
    isLoading,
    addWeighIn,
    updateWeighIn,
    deleteWeighIn
  };
}
