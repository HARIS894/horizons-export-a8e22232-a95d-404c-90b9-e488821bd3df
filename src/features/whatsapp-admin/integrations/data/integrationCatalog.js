export const integrationStatuses = {
  DEMO: 'Demo / Not Connected',
  NEEDS_ATTENTION: 'Needs Attention',
  ERROR: 'Error',
  SYNCING: 'Syncing',
};

export const integrationCatalog = [
  {
    id: 'google-sheets',
    name: 'Google Sheets',
    description: 'Plan staff, finance, client, and reporting synchronization with future backend-verified adapters.',
    status: integrationStatuses.DEMO,
    category: 'Operations Data',
    capabilities: ['Resource discovery', 'Sheet mapping', 'Read data', 'Write data', 'Sync test'],
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Prepare appointments, visits, shifts, reminders, and recurring schedule mappings.',
    status: integrationStatuses.DEMO,
    category: 'Scheduling',
    capabilities: ['Calendar selection', 'Event mapping', 'Reminder rules', 'Sync status'],
  },
  {
    id: 'google-apps-script',
    name: 'Google Apps Script',
    description: 'Register external automation endpoints for reports, invoices, salary logic, and scheduled processing.',
    status: integrationStatuses.DEMO,
    category: 'Automation',
    capabilities: ['Script URL', 'Trigger rules', 'Execution audit', 'Validation handshake'],
  },
  {
    id: 'excel-vba',
    name: 'Excel / VBA',
    description: 'Design import, export, CSV interchange, and scheduled desktop sync without executing VBA in-browser.',
    status: integrationStatuses.DEMO,
    category: 'Finance',
    capabilities: ['Excel import', 'Excel export', 'CSV mapping', 'Desktop sync contract'],
  },
  {
    id: 'whatsapp-meta',
    name: 'WhatsApp / Meta',
    description: 'Reserve provider connection settings, template lifecycle sync, and policy status checks for later phases.',
    status: integrationStatuses.DEMO,
    category: 'Messaging',
    capabilities: ['Provider status', 'Template sync', 'Webhook verification', 'Token scope review'],
  },
  {
    id: 'webhooks',
    name: 'Webhooks',
    description: 'Configure outbound and inbound event contracts for triggers, notifications, and external systems.',
    status: integrationStatuses.DEMO,
    category: 'Automation',
    capabilities: ['Endpoint registry', 'Secret placeholder', 'Retry policy', 'Delivery logs'],
  },
  {
    id: 'rest-api',
    name: 'REST API',
    description: 'Document scoped API usage, key lifecycle, rate protections, and future integration onboarding.',
    status: integrationStatuses.DEMO,
    category: 'Platform',
    capabilities: ['API key lifecycle', 'Scopes', 'Rate limits', 'Testing sandbox'],
  },
];

export const sheetsFieldMappings = [
  { field: 'Client Name', column: 'Column A', module: 'Clients' },
  { field: 'Service Date', column: 'Column B', module: 'Clients' },
  { field: 'Assigned Staff', column: 'Column C', module: 'Clients' },
  { field: 'Amount', column: 'Column D', module: 'Finance' },
  { field: 'Payment Status', column: 'Column E', module: 'Finance' },
  { field: 'Salary Due', column: 'Column F', module: 'Staff' },
];

export const triggerArchitecture = [
  {
    label: 'Trigger',
    items: ['Appointment created', 'Payment received', 'Invoice overdue', 'Staff assigned'],
  },
  {
    label: 'Condition',
    items: ['Service type', 'Payment status', 'Patient category', 'Date/time'],
  },
  {
    label: 'Action',
    items: ['Send template', 'Create calendar event', 'Update sheet', 'Notify admin'],
  },
];