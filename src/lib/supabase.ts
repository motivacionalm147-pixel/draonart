import { createClient } from '@supabase/supabase-js';

// As chaves fornecidas pelo usuário
const supabaseUrl = 'https://rtxnjcvjpawtjwzuumwo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0eG5qY3ZqcGF3dGp3enV1bXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNzc0MTAsImV4cCI6MjA5Mzc1MzQxMH0.jJrn-NozdhPFCObR8gF6Cr50HR6LsrxzqpYwJIMeF_I';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
