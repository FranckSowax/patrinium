import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variables VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY requises dans .env');
}

// Debug temporaire — a retirer apres verification
console.log('[Supabase] URL:', supabaseUrl);
console.log('[Supabase] Key (10 premiers chars):', supabaseAnonKey?.substring(0, 10) + '...');

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
