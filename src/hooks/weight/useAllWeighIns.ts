import { useQuery } from '@tanstack/react-query';
import { WeighIn } from '@/lib/types';
import { getWeighIns } from '@/lib/services/weighInsService';

// Fetches every weigh-in for the user, ignoring the active-period scoping
// that useWeightQuery applies. Used by the Periods page so historical period
// rows can compute final/lowest weight and actual loss from their own windows.
export function useAllWeighIns() {
  const { data: weighIns = [], isLoading } = useQuery<WeighIn[]>({
    queryKey: ['weighIns', 'all'],
    queryFn: () => getWeighIns(),
  });

  return { weighIns, isLoading };
}
