import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zycqibjgtqfuzbuapyoa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5Y3FpYmpndHFmdXpidWFweW9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNzMxNTMsImV4cCI6MjA3MTY0OTE1M30.NbtnrYt4aZAB8e7Owg8WhFl6Vf31A11-wmM5GsIKVnQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);