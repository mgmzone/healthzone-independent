import { supabase } from '@/integrations/supabase/client';

export async function adminDeleteUser(userId: string, confirmEmail: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke('admin-delete-user', {
    body: { mode: 'admin', userId, confirmEmail },
  });
  if (error) throw new Error(error.message);
  if (!data?.success) throw new Error(data?.error || 'Failed to delete user');
}

export async function selfDeleteAccount(confirmEmail: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke('admin-delete-user', {
    body: { mode: 'self', confirmEmail },
  });
  if (error) throw new Error(error.message);
  if (!data?.success) throw new Error(data?.error || 'Failed to delete account');
}
