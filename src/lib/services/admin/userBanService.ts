import { supabase } from '@/integrations/supabase/client';

export async function setUserBan(userId: string, action: 'suspend' | 'reactivate'): Promise<void> {
  const { data, error } = await supabase.functions.invoke('admin-set-user-ban', {
    body: { userId, action },
  });
  if (error) throw new Error(error.message);
  if (!data?.success) throw new Error(data?.error || 'Failed to update user');
}
