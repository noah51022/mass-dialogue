import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qdapyqjpuopjjmemppea.supabase.co/';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkYXB5cWpwdW9wamptZW1wcGVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2NDU4ODYsImV4cCI6MjA1NTIyMTg4Nn0.uXbRK35zdJfQfSrB78oL9-q70EZNS-fL15E5Cd85zt8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);