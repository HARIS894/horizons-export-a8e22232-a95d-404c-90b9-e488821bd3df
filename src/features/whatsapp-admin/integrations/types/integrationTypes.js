export const INTEGRATION_PROVIDERS = {
  WHATSAPP_CLOUD_API: 'WHATSAPP_CLOUD_API',
  GOOGLE_SHEETS: 'GOOGLE_SHEETS',
  GOOGLE_CALENDAR: 'GOOGLE_CALENDAR',
  GOOGLE_APPS_SCRIPT: 'GOOGLE_APPS_SCRIPT',
  RAZORPAY: 'RAZORPAY',
  EMAIL: 'EMAIL',
  WEBHOOKS: 'WEBHOOKS',
  AI_PROVIDER: 'AI_PROVIDER',
};

export const INTEGRATION_CONNECTION_STATUSES = {
  DISCONNECTED: 'DISCONNECTED',
  CONNECTING: 'CONNECTING',
  CONNECTED: 'CONNECTED',
  ERROR: 'ERROR',
  REAUTH_REQUIRED: 'REAUTH_REQUIRED',
  DISABLED: 'DISABLED',
};

export const INTEGRATION_CONNECTION_HEALTH = {
  HEALTHY: 'HEALTHY',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
  UNKNOWN: 'UNKNOWN',
};

export const WEBHOOK_STATUSES = {
  HEALTHY: 'HEALTHY',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
  DISABLED: 'DISABLED',
  UNKNOWN: 'UNKNOWN',
  BACKEND_MANAGED: 'BACKEND_MANAGED',
};

export const CONNECTION_STATUS_META = {
  DISCONNECTED: 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
  CONNECTING: 'border-sky-300 bg-sky-500/10 text-sky-700 dark:border-sky-900 dark:text-sky-200',
  CONNECTED: 'border-emerald-300 bg-emerald-500/10 text-emerald-700 dark:border-emerald-900 dark:text-emerald-200',
  ERROR: 'border-rose-300 bg-rose-500/10 text-rose-700 dark:border-rose-900 dark:text-rose-200',
  REAUTH_REQUIRED: 'border-amber-300 bg-amber-500/10 text-amber-700 dark:border-amber-900 dark:text-amber-200',
  DISABLED: 'border-stone-300 bg-stone-100 text-stone-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200',
};

export const HEALTH_STATUS_META = {
  HEALTHY: 'border-emerald-300 bg-emerald-500/10 text-emerald-700 dark:border-emerald-900 dark:text-emerald-200',
  WARNING: 'border-amber-300 bg-amber-500/10 text-amber-700 dark:border-amber-900 dark:text-amber-200',
  ERROR: 'border-rose-300 bg-rose-500/10 text-rose-700 dark:border-rose-900 dark:text-rose-200',
  UNKNOWN: 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
};

export const WEBHOOK_STATUS_META = {
  HEALTHY: 'border-emerald-300 bg-emerald-500/10 text-emerald-700 dark:border-emerald-900 dark:text-emerald-200',
  WARNING: 'border-amber-300 bg-amber-500/10 text-amber-700 dark:border-amber-900 dark:text-amber-200',
  ERROR: 'border-rose-300 bg-rose-500/10 text-rose-700 dark:border-rose-900 dark:text-rose-200',
  DISABLED: 'border-stone-300 bg-stone-100 text-stone-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200',
  UNKNOWN: 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
  BACKEND_MANAGED: 'border-cyan-300 bg-cyan-500/10 text-cyan-700 dark:border-cyan-900 dark:text-cyan-200',
};

export const INTEGRATION_CATEGORY_OPTIONS = ['All', 'Messaging', 'Google Workspace', 'Payments', 'Communications', 'Infrastructure', 'Automation'];

export const INTEGRATION_VIEW_FILTERS = [
  { key: 'overview', label: 'Overview' },
  { key: 'connected', label: 'Connected' },
  { key: 'needs-attention', label: 'Needs Attention' },
  { key: 'available', label: 'Available' },
];

export const ACTIVITY_LOG_STATUSES = {
  INFO: 'INFO',
  SUCCESS: 'SUCCESS',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
  BLOCKED: 'BLOCKED',
};

export const ACTIVITY_STATUS_META = {
  INFO: 'border-sky-300 bg-sky-500/10 text-sky-700 dark:border-sky-900 dark:text-sky-200',
  SUCCESS: 'border-emerald-300 bg-emerald-500/10 text-emerald-700 dark:border-emerald-900 dark:text-emerald-200',
  WARNING: 'border-amber-300 bg-amber-500/10 text-amber-700 dark:border-amber-900 dark:text-amber-200',
  ERROR: 'border-rose-300 bg-rose-500/10 text-rose-700 dark:border-rose-900 dark:text-rose-200',
  BLOCKED: 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
};

export const PROVIDER_PERMISSION_STATUSES = {
  GRANTED: 'GRANTED',
  PENDING_BACKEND: 'PENDING_BACKEND',
  NOT_GRANTED: 'NOT_GRANTED',
};

export const PAYMENT_EVENT_TYPES = [
  'PAYMENT_CREATED',
  'PAYMENT_AUTHORIZED',
  'PAYMENT_CAPTURED',
  'PAYMENT_FAILED',
  'REFUND_CREATED',
  'REFUND_PROCESSED',
  'ORDER_CREATED',
  'INVOICE_CREATED',
];

export const FLOW_HANDOFF_KINDS = {
  ACTION: 'ACTION',
  TRIGGER: 'TRIGGER',
};
