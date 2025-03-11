
import { supabase } from "@/lib/supabase";
import { WeighIn } from "@/lib/types";

export async function getWeighIns(limit?: number) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  let query = supabase
    .from('weigh_ins')
    .select('*')
    .eq('user_id', session.user.id)
    .order('date', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching weigh-ins:', error);
    return [];
  }

  return data;
}

export async function addWeighIn(weighInData: Partial<WeighIn>) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('weigh_ins')
    .insert([
      {
        user_id: session.user.id,
        ...weighInData
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error adding weigh-in:', error);
    throw error;
  }

  return data;
}
