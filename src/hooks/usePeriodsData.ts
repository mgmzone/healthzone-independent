
import { usePeriodQueries } from './periods/usePeriodQueries';
import { usePeriodMutations } from './periods/usePeriodMutations';

export function usePeriodsData() {
  const { periods, isLoading, getCurrentPeriod } = usePeriodQueries();
  const { addPeriod, updatePeriod, deletePeriod } = usePeriodMutations();

  return {
    periods,
    isLoading,
    addPeriod,
    updatePeriod,
    deletePeriod,
    getCurrentPeriod
  };
}
