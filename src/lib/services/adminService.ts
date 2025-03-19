
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/lib/types";

// Re-export everything from the new modular services
export { 
  getUsersWithStats,
  getSystemStats,
  getActivityLogs 
} from './admin';

// Re-export types with the proper 'export type' syntax
export type { 
  UserStats,
  SystemStats,
  ActivityLogItem 
} from './admin';
