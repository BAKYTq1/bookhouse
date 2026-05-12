import { createClient } from '@supabase/supabase-js';

const isValidEnvValue = (value: string | undefined): value is string => {
  if (!value) {
    return false;
  }

  const normalized = value.trim();
  return normalized.length > 0 && !normalized.startsWith('your-supabase-');
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured =
  isValidEnvValue(supabaseUrl) && isValidEnvValue(supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : null;
