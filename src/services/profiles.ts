import { mapProfileRecord, ProfileRecord } from '../lib/database';
import { supabase } from '../lib/supabase';
import { User } from '../types';

export const getAllProfiles = async (): Promise<User[]> => {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data as ProfileRecord[]).map(mapProfileRecord);
};

export const updateUserRole = async (
  userId: string,
  role: 'customer' | 'admin'
): Promise<void> => {
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  const { error } = await supabase.from('profiles').update({ role }).eq('id', userId);

  if (error) {
    throw error;
  }
};

