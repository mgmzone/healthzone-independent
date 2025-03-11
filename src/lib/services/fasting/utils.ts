
import { FastingLog } from "@/lib/types";

export function transformFastingLogResponse(data: any): FastingLog {
  return {
    id: data.id,
    userId: data.user_id,
    startTime: new Date(data.start_time),
    endTime: data.end_time ? new Date(data.end_time) : undefined,
    fastingHours: data.fasting_hours || undefined,
    eatingWindowHours: data.eating_window_hours || undefined
  };
}
