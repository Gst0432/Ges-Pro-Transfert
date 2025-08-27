import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kdlxszgumbdbvybfgigy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI-rQA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);