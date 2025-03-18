
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/lib/types";

// Re-export everything from the new modular services
export { 
  UserStats,
  SystemStats,
  ActivityLogItem,
  getUsersWithStats,
  getSystemStats,
  getActivityLogs 
} from './admin';
