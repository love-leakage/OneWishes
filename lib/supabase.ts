import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://arygiubgshkzlqhmdszc.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyeWdpdWJnc2hremxxaG1kc3pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5MTQyODAsImV4cCI6MjEwNTQ5MDI4MH0.a6hQXXa6Ti8JzKrWdGmOjIHm931M9FIvxUWDYWHfIVA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
