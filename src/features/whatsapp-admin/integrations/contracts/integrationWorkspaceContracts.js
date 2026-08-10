export const integrationWorkspaceContracts = {
  overview: 'Render a backend-first Integration Control Center without pretending providers are connected when no backend verification exists.',
  controlActions: 'Connect, disconnect, test, manage, and reauthenticate actions are future backend calls only and stay as honest UI placeholders in this phase.',
  security: 'No OAuth tokens, refresh tokens, API keys, webhook secrets, or payment secrets are stored in React state, browser storage, URLs, or source.',
  permissions: 'Permission and scope displays must come from backend/provider responses. Pending backend confirmation must remain visibly pending.',
  webhooks: 'Webhook health, rotation, enable/disable, and delivery history are backend-managed contracts and must never expose secret values.',
};

export const integrationConnectionContractFields = [
  'id',
  'provider',
  'displayName',
  'status',
  'health',
  'accountLabel',
  'externalAccountId',
  'connectedAt',
  'lastCheckedAt',
  'lastSyncAt',
  'permissions',
  'scopes',
  'webhookStatus',
  'errorCode',
  'errorMessage',
  'metadata',
];

export const paymentEventContractFields = [
  'internalEventId',
  'provider',
  'providerEventId',
  'paymentId',
  'orderId',
  'invoiceId',
  'customerId',
  'amount',
  'currency',
  'status',
  'occurredAt',
  'receivedAt',
  'idempotencyKey',
  'metadata',
];

export const webhookContractFields = [
  'provider',
  'endpoint',
  'status',
  'lastReceived',
  'lastSuccessful',
  'lastFailed',
  'failureCount',
  'secretRotationPolicy',
  'enableDisableControl',
];

export const crossModuleConnectionMap = [
  { source: 'WhatsApp Cloud API', target: 'Templates', purpose: 'Only provider-approved templates can be used for production messaging later.' },
  { source: 'WhatsApp Cloud API', target: 'Inbox', purpose: 'Keep conversation delivery backend-managed while the admin center verifies readiness only.' },
  { source: 'Google Sheets', target: 'Contacts', purpose: 'Map import, export, append, and update contracts for CRM workflows.' },
  { source: 'Google Sheets', target: 'Patients', purpose: 'Prepare roster sync, worksheet selection, and column mapping for patient operations.' },
  { source: 'Google Calendar', target: 'Appointments', purpose: 'Prepare read, create, update, and sync contracts for doctor and nurse schedules.' },
  { source: 'Google Apps Script', target: 'Flows', purpose: 'Expose future-safe handoff metadata for server-side automation orchestration.' },
  { source: 'Razorpay', target: 'Payments', purpose: 'Prepare event contracts and idempotent payment webhook handling without live execution.' },
  { source: 'Email', target: 'Export', purpose: 'Deliver secure expiring download links instead of raw sensitive attachments.' },
  { source: 'Webhooks', target: 'Triggers', purpose: 'Prepare provider event ingestion contracts for future trigger routing.' },
  { source: 'AI Provider', target: 'Automation', purpose: 'Reserve a backend-gated inference contract without activating agent execution yet.' },
];

export const templateHandoffRules = {
  allowedTargets: ['Flow', 'Trigger', 'Quick Reply', 'Automation'],
  productionGuardrail: 'Only templates with provider-approved status may be marked usable for production WhatsApp messaging.',
  backendSourceOfTruth: 'Real provider status must be resolved by backend/provider sync rather than imported or mocked frontend values.',
};
