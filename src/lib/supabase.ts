import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  // Graceful fallback to avoid app crashing during initial builds before keys are provided
  if (typeof window !== 'undefined') {
    console.warn(
      'Lacre SaaS: Supabase credentials are missing. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file.'
    );
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
