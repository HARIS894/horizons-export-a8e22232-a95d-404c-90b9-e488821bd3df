const normalizeSupabaseUrl = (value) => {
  if (!value) {
    return '';
  }

  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }

  return `https://${value}.supabase.co`;
};

const getDefaultApiBaseUrl = () => {
  if (typeof window === 'undefined') {
    return 'http://localhost:4000/api/v1';
  }

  const { origin, hostname } = window.location;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:4000/api/v1';
  }

  return `${origin}/api/v1`;
};

const normalizeApiBaseUrl = (value) => (value || getDefaultApiBaseUrl()).replace(/\/$/, '');

export const runtimeConfig = {
  supabaseUrl: normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL || ''),
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  apiBaseUrl: normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL || ''),
};

export const isSupabaseConfigured = Boolean(runtimeConfig.supabaseUrl && runtimeConfig.supabaseAnonKey);