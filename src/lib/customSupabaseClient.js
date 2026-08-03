import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xuqlhdxzbwtnzbqhcxmp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1cWxoZHh6Ynd0bnpicWhjeG1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNTAzNjcsImV4cCI6MjA4NDgyNjM2N30.at4n00_iXV8Kjp9fuizNB8IEW9tfw29Oh237psXkEgc';

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
