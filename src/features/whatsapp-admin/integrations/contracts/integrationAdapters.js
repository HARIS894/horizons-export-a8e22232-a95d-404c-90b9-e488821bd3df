export const integrationAdapterContract = {
  connect: 'Begin a backend-owned connection handshake. The frontend never stores OAuth tokens, refresh tokens, API secrets, or webhook secrets.',
  disconnect: 'Revoke a backend-owned integration connection and invalidate remote trust safely.',
  getStatus: 'Fetch the verified IntegrationConnection snapshot from the backend before showing Connected.',
  testConnection: 'Run a safe backend connection test and return health, permissions, and error metadata without exposing secrets.',
  refreshConnection: 'Trigger backend reauthentication or credential refresh without leaking tokens to the browser.',
  getAccountInfo: 'Return account labels, external ids, environment labels, and granted metadata that are safe to render.',
  getPermissions: 'Return provider-approved scopes and permission state; the UI must not invent them.',
};

export const adapterCatalog = {
  WhatsAppCloudAdapter: ['connect', 'disconnect', 'getStatus', 'testConnection', 'refreshConnection', 'getAccountInfo', 'getPermissions'],
  GoogleSheetsAdapter: ['connect', 'disconnect', 'getStatus', 'testConnection', 'refreshConnection', 'getAccountInfo', 'getPermissions'],
  GoogleCalendarAdapter: ['connect', 'disconnect', 'getStatus', 'testConnection', 'refreshConnection', 'getAccountInfo', 'getPermissions'],
  GoogleAppsScriptAdapter: ['connect', 'disconnect', 'getStatus', 'testConnection', 'refreshConnection', 'getAccountInfo', 'getPermissions'],
  RazorpayAdapter: ['connect', 'disconnect', 'getStatus', 'testConnection', 'refreshConnection', 'getAccountInfo', 'getPermissions'],
  EmailAdapter: ['connect', 'disconnect', 'getStatus', 'testConnection', 'refreshConnection', 'getAccountInfo', 'getPermissions'],
  WebhookCenterAdapter: ['getStatus', 'testConnection', 'refreshConnection', 'getAccountInfo', 'getPermissions'],
  AiProviderAdapter: ['connect', 'disconnect', 'getStatus', 'testConnection', 'refreshConnection', 'getAccountInfo', 'getPermissions'],
};

export const providerSecurityNotes = [
  'OAuth tokens, access tokens, refresh tokens, API keys, webhook secrets, and payment secrets must remain server-side only.',
  'The browser may render masked account labels and backend-confirmed scopes, but never raw credentials or secret material.',
  'Connected must only appear after a backend-verified status response. Not connected must remain the default otherwise.',
  'Webhook secret rotation, payment event idempotency, and provider audit trails must be handled on the backend.',
  'WhatsApp production send logic, webhook processing, and provider credentials are explicitly outside this frontend foundation phase.',
];

export const providerActionLabels = {
  connect: 'Connect',
  disconnect: 'Disconnect',
  getStatus: 'Get Status',
  testConnection: 'Test Connection',
  refreshConnection: 'Reauthenticate',
  getAccountInfo: 'Account Info',
  getPermissions: 'Permissions',
};