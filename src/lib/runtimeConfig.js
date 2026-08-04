const normalizeSupabaseUrl = (value) => {
  if (!value) {
    return '';
  }

  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }

  return `https://${value}.supabase.co`;
};

const normalizeApiBaseUrl = (value) => (value || 'http://localhost:4000/api/v1').replace(/\/$/, '');

export const runtimeConfig = {
  supabaseUrl: normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL || ''),
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  apiBaseUrl: normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1'),
};

export const isSupabaseConfigured = Boolean(runtimeConfig.supabaseUrl && runtimeConfig.supabaseAnonKey);