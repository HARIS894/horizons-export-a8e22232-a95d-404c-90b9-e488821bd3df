import { supabase } from './customSupabaseClient';

// Exporting the client from customSupabaseClient to ensure we use the correct credentials
// throughout the application where 'src/lib/supabase.js' is imported.
export { supabase };

// Helper to check connection
export const isSupabaseConnected = () => !!supabase;