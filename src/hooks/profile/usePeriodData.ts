
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

interface CurrentPeriod {
  id: string;
  startDate: string;
  endDate?: string;
  projectedEndDate?: string;
  targetWeight: number;
  weightLossPerWeek: number;
  startWeight: number;
}

export const usePeriodData = () => {
  const { profile } = useAuth();
  const [currentPeriod, setCurrentPeriod] = useState<CurrentPeriod | null>(null);
  const [currentAvgWeightLoss, setCurrentAvgWeightLoss] = useState<number | undefined>(undefined);

  // Fetch current period data
  useEffect(() => {
    const fetchCurrentPeriodData = async () => {
      if (!profile?.id) return;

      try {
        // Get current active period
        const { data: periodData, error: periodError } = await supabase
          .rpc('get_current_active_period', { p_user_id: profile.id });

        if (periodError) {
          console.error('Error fetching current period:', periodError);
          return;
        }

        if (periodData && periodData.length > 0) {
          // Get the start_weight from the periods table
          const { data: periodDetails, error: detailsError } = await supabase
            .from('periods')
            .select('start_weight, projected_end_date')
            .eq('id', periodData[0].id)
            .single();

          if (detailsError) {
            console.error('Error fetching period details:', detailsError);
          }

          setCurrentPeriod({
            id: periodData[0].id,
            startDate: periodData[0].start_date,
            endDate: periodData[0].end_date,
            projectedEndDate: periodDetails?.projected_end_date,
            targetWeight: periodData[0].target_weight,
            weightLossPerWeek: periodData[0].weight_loss_per_week,
            startWeight: periodDetails?.start_weight || 0
          });

          // Get average weight loss
          const { data: avgLossData, error: avgLossError } = await supabase
            .rpc('calculate_current_avg_weight_loss', { p_user_id: profile.id });

          if (avgLossError) {
            console.error('Error calculating average weight loss:', avgLossError);
          } else {
            // Make sure negative value represents weight loss
            setCurrentAvgWeightLoss(avgLossData ? -Math.abs(avgLossData) : undefined);
          }
        }
      } catch (error) {
        console.error('Error in fetchCurrentPeriodData:', error);
      }
    };

    fetchCurrentPeriodData();
  }, [profile]);

  return {
    currentPeriod,
    currentAvgWeightLoss
  };
};
