import { createClient } from '@supabase/supabase-js';
import { env, isSupabaseConfigured } from './env.js';

export const supabaseAdmin = isSupabaseConfigured
  ? createClient(env.supabaseUrl, env.supabaseServiceRoleKey || env.supabaseAnonKey)
  : null;

export const isSupabaseEnabled = Boolean(supabaseAdmin);