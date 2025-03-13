import { supabase } from "@/lib/supabase";
import { transformFastingLogResponse } from './utils';
import { calculateEatingWindowHours } from '@/components/fasting/utils/fastingUtils';

export async function addFastingLog(fastData: {
  startTime: Date;
  endTime?: Date;
  fastingHours?: number;
  eatingWindowHours?: number;
}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const insertData: any = {
    user_id: session.user.id,
    start_time: fastData.startTime.toISOString(),
  };
  
  // For historical fast entries (with both start and end time)
  if (fastData.endTime) {
    insertData.end_time = fastData.endTime.toISOString();
    
    // Calculate fasting hours if not provided
    if (!fastData.fastingHours) {
      const durationInHours = (fastData.endTime.getTime() - fastData.startTime.getTime()) / (1000 * 60 * 60);
      insertData.fasting_hours = parseFloat(durationInHours.toFixed(2));
    } else {
      insertData.fasting_hours = fastData.fastingHours;
    }
    
    // Calculate eating window hours if not provided
    if (!fastData.eatingWindowHours) {
      // Use the utility function to calculate eating window hours
      insertData.eating_window_hours = parseFloat(calculateEatingWindowHours(insertData.fasting_hours).toFixed(2));
    } else {
      insertData.eating_window_hours = fastData.eatingWindowHours;
    }
  } else {
    // For new active fasts, only set what's provided
    if (fastData.fastingHours) {
      insertData.fasting_hours = fastData.fastingHours;
    }
    // Only set eating_window_hours if explicitly provided
    if (fastData.eatingWindowHours) {
      insertData.eating_window_hours = fastData.eatingWindowHours;
    }
  }

  const { data, error } = await supabase
    .from('fasting_logs')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('Error adding fasting log:', error);
    throw error;
  }

  return transformFastingLogResponse(data);
}

export async function updateFastingLog(
  id: string,
  fastData: {
    startTime: Date;
    endTime?: Date;
    fastingHours?: number;
    eatingWindowHours?: number;
  }
) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const updateData: any = {
    start_time: fastData.startTime.toISOString(),
  };

  // Only add end_time if it's provided
  if (fastData.endTime) {
    updateData.end_time = fastData.endTime.toISOString();
    
    // Calculate fasting hours if not provided
    if (!fastData.fastingHours) {
      const durationInHours = (fastData.endTime.getTime() - fastData.startTime.getTime()) / (1000 * 60 * 60);
      updateData.fasting_hours = parseFloat(durationInHours.toFixed(2));
    } else {
      updateData.fasting_hours = fastData.fastingHours;
    }
  } else if (fastData.fastingHours) {
    updateData.fasting_hours = fastData.fastingHours;
  }

  // Only update eatingWindowHours if explicitly provided
  if (fastData.eatingWindowHours) {
    updateData.eating_window_hours = fastData.eatingWindowHours;
  } else if (updateData.fasting_hours && fastData.endTime) {
    // If we have fasting hours and an end time, we can calculate eating window
    updateData.eating_window_hours = parseFloat(calculateEatingWindowHours(updateData.fasting_hours).toFixed(2));
  }

  const { data, error } = await supabase
    .from('fasting_logs')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', session.user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating fasting log:', error);
    throw error;
  }

  return transformFastingLogResponse(data);
}

export async function deleteFastingLog(id: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('fasting_logs')
    .delete()
    .eq('id', id)
    .eq('user_id', session.user.id);

  if (error) {
    console.error('Error deleting fasting log:', error);
    throw error;
  }

  return true;
}
