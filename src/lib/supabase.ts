
import { createClient } from '@supabase/supabase-js';
import { type Database } from '@/integrations/supabase/types';

const supabaseUrl = 'https://kvmvekesxdzwodnfabdr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2bXZla2VzeGR6d29kbmZhYmRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2OTI5NzYsImV4cCI6MjA1NzI2ODk3Nn0.5BYKCiwX_kctm6iYU_zfs4gyytpLhcml5Q53LvGCY9w';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
