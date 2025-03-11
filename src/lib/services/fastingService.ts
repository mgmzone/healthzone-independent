
import { supabase } from "@/lib/supabase";
import { FastingLog } from "@/lib/types";

export async function getFastingLogs(limit?: number) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  let query = supabase
    .from('fasting_logs')
    .select('*')
    .eq('user_id', session.user.id)
    .order('start_time', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching fasting logs:', error);
    return [];
  }

  // Transform snake_case DB fields to camelCase for our frontend types
  return data.map(item => ({
    id: item.id,
    userId: item.user_id,
    startTime: new Date(item.start_time),
    endTime: item.end_time ? new Date(item.end_time) : undefined,
    fastingHours: item.fasting_hours || undefined,
    eatingWindowHours: item.eating_window_hours || undefined
  }));
}

export async function getCurrentFasting() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from('fasting_logs')
    .select('*')
    .eq('user_id', session.user.id)
    .is('end_time', null)
    .order('start_time', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching current fasting:', error);
    return null;
  }

  if (!data) return null;

  // Transform snake_case DB fields to camelCase for our frontend types
  return {
    id: data.id,
    userId: data.user_id,
    startTime: new Date(data.start_time),
    endTime: data.end_time ? new Date(data.end_time) : undefined,
    fastingHours: data.fasting_hours || undefined,
    eatingWindowHours: data.eating_window_hours || undefined
  };
}

export async function startFasting(fastingHours: number = 16, eatingWindowHours: number = 8) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const now = new Date();
  
  const { data, error } = await supabase
    .from('fasting_logs')
    .insert({
      user_id: session.user.id,
      start_time: now.toISOString(),
      fasting_hours: fastingHours,
      eating_window_hours: eatingWindowHours
    })
    .select()
    .single();

  if (error) {
    console.error('Error starting fasting:', error);
    throw error;
  }

  // Transform the response to our frontend type
  return {
    id: data.id,
    userId: data.user_id,
    startTime: new Date(data.start_time),
    endTime: data.end_time ? new Date(data.end_time) : undefined,
    fastingHours: data.fasting_hours || undefined,
    eatingWindowHours: data.eating_window_hours || undefined
  };
}

export async function endFasting(fastingId: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const now = new Date();
  
  const { data: fastingData } = await supabase
    .from('fasting_logs')
    .select('start_time, fasting_hours')
    .eq('id', fastingId)
    .single();

  if (!fastingData) throw new Error('Fasting log not found');

  const startTime = new Date(fastingData.start_time);
  const durationInHours = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);
  const eatingWindowHours = fastingData.fasting_hours 
    ? 24 - durationInHours 
    : 24 - durationInHours;

  const { data, error } = await supabase
    .from('fasting_logs')
    .update({
      end_time: now.toISOString(),
      fasting_hours: parseFloat(durationInHours.toFixed(2)),
      eating_window_hours: parseFloat(eatingWindowHours.toFixed(2))
    })
    .eq('id', fastingId)
    .eq('user_id', session.user.id)
    .select()
    .single();

  if (error) {
    console.error('Error ending fasting:', error);
    throw error;
  }

  // Transform the response to our frontend type
  return {
    id: data.id,
    userId: data.user_id,
    startTime: new Date(data.start_time),
    endTime: data.end_time ? new Date(data.end_time) : undefined,
    fastingHours: data.fasting_hours || undefined,
    eatingWindowHours: data.eating_window_hours || undefined
  };
}

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
    // For historical fasts, we base it on the next fast's start time if available
    if (!fastData.eatingWindowHours) {
      // For now we'll use default logic: 24 - fasting_hours
      // This can be improved later to look up the next fast
      insertData.eating_window_hours = parseFloat((24 - insertData.fasting_hours).toFixed(2));
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

  return {
    id: data.id,
    userId: data.user_id,
    startTime: new Date(data.start_time),
    endTime: data.end_time ? new Date(data.end_time) : undefined,
    fastingHours: data.fasting_hours || undefined,
    eatingWindowHours: data.eating_window_hours || undefined
  };
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
    updateData.eating_window_hours = parseFloat((24 - updateData.fasting_hours).toFixed(2));
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

  return {
    id: data.id,
    userId: data.user_id,
    startTime: new Date(data.start_time),
    endTime: data.end_time ? new Date(data.end_time) : undefined,
    fastingHours: data.fasting_hours || undefined,
    eatingWindowHours: data.eating_window_hours || undefined
  };
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
