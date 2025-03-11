
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { usePeriodsData } from '@/hooks/usePeriodsData';

export function useWeightBase() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { getCurrentPeriod } = usePeriodsData();

  return {
    toast,
    queryClient,
    getCurrentPeriod,
    supabase
  };
}
