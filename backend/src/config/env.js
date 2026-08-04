import dotenv from 'dotenv';

dotenv.config();

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeSupabaseUrl = (value) => {
  if (!value) {
    return '';
  }

  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }

  return `https://${value}.supabase.co`;
};

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: toNumber(process.env.PORT, 4000),
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  logLevel: process.env.LOG_LEVEL || 'info',
  jwtSecret: process.env.JWT_SECRET || 'change-this-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'change-this-refresh-secret-in-production',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  passwordResetOtpExpiresMinutes: toNumber(process.env.PASSWORD_RESET_OTP_EXPIRES_MINUTES, 15),
  supabaseUrl: normalizeSupabaseUrl(process.env.SUPABASE_URL || ''),
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  supabaseStorageBucket: process.env.SUPABASE_STORAGE_BUCKET || 'instantcare-media',
  resendApiKey: process.env.RESEND_API_KEY || '',
  emailFrom: process.env.EMAIL_FROM || 'InstantCare <support@instantcare.in>',
  emailReplyTo: process.env.EMAIL_REPLY_TO || 'support@instantcare.in',
  supportEmail: process.env.SUPPORT_EMAIL || 'support@instantcare.in',
  emailMaxRetries: toNumber(process.env.EMAIL_MAX_RETRIES, 3),
  emailRetryDelayMinutes: toNumber(process.env.EMAIL_RETRY_DELAY_MINUTES, 15),
  whatsappAccessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
  whatsappPhoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
  whatsappBusinessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
  whatsappApiVersion: process.env.WHATSAPP_API_VERSION || 'v20.0',
  whatsappWebhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || '',
  whatsappMaxRetries: toNumber(process.env.WHATSAPP_MAX_RETRIES, 3),
  whatsappRetryDelayMinutes: toNumber(process.env.WHATSAPP_RETRY_DELAY_MINUTES, 10),
  demoAdminEmail: process.env.DEMO_ADMIN_EMAIL || 'admin@instantcare.com',
  demoAdminPassword: process.env.DEMO_ADMIN_PASSWORD || 'admin123',
};

export const isSupabaseConfigured = Boolean(env.supabaseUrl && (env.supabaseServiceRoleKey || env.supabaseAnonKey));