// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wfttezbhyoxoaiienaau.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmdHRlemJoeW94b2FpaWVuYWF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3Mzg5ODksImV4cCI6MjA2MzMxNDk4OX0.RJHwEkCClP80CWLgbrhaQPeWbAcVj54gcF9-oJFaOIg';

export const supabase = createClient(supabaseUrl, supabaseKey);
