import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_KEY || '';

export const supabaseMisconfigured = !SUPABASE_URL || !SUPABASE_KEY;

export const supabase = supabaseMisconfigured
  ? null
  : createClient(SUPABASE_URL, SUPABASE_KEY);