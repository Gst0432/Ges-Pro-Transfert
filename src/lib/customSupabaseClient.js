import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kdlxszgumbdbvybfgigy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkbHhzemd1bWJkYnZ5YmZnaWd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4OTcwNTMsImV4cCI6MjA3MTQ3MzA1M30.gb-5gr_Wkq8IOjarECsnqyZxa7eG5cWHKurBil9-rQA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);