import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fmrczfdzjgaryqdtxhle.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtcmN6ZmR6amdhcnlxZHR4aGxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0Mjc0MTUsImV4cCI6MjA2ODAwMzQxNX0.7NM87-MSn6sjKaoDppfl9Wp3vR7aCRiEeqFvsyPK-CE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);