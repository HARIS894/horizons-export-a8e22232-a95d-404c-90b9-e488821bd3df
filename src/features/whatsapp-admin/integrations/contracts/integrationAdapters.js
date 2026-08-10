export const integrationAdapterContract = {
  connect: 'Establish a backend-verified connection. Not implemented in this phase.',
  disconnect: 'Revoke a backend-managed connection. Not implemented in this phase.',
  testConnection: 'Run a safe health check against a future backend connector.',
  listResources: 'Enumerate sheets, calendars, scripts, or endpoints after authentication.',
  readData: 'Read provider data through a server-side adapter.',
  writeData: 'Write provider data through a scoped server-side adapter.',
  sync: 'Run controlled synchronization with audit visibility.',
  getStatus: 'Return verified connection and sync state.',
};

export const providerSecurityNotes = [
  'OAuth tokens and API credentials must be handled server-side only.',
  'Do not store provider secrets in localStorage or frontend source code.',
  'Future integrations require scoped permissions, rotation, and audit trails.',
  'Frontend UI remains in demo mode until real backend verification exists.',
];