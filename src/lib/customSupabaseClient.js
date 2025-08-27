import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lueeptijffpwedouxylf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1ZWVwdGlqZmZwd2Vkb3V4eWxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMTI3OTYsImV4cCI6MjA3MTg4ODc5Nn0.mto26keeUum_7SEN0fYmS80F9LrqeYBbyIMtPx0GNkE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);