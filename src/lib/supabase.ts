
// Re-export the centralized Supabase client that uses environment variables.
// This avoids duplicating client configuration and ensures consistent auth/session storage.
export { supabase } from '@/integrations/supabase/client';
