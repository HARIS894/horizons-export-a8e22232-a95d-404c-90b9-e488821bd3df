export const FLOW_STATUSES = {
  DRAFT: 'DRAFT',
  VALIDATED: 'VALIDATED',
  PUBLISHED: 'PUBLISHED',
  PAUSED: 'PAUSED',
  ARCHIVED: 'ARCHIVED',
};

export const FLOW_VALIDATION_SEVERITY = {
  PASS: 'PASS',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
};

export const FLOW_NODE_TYPES = {
  TRIGGER: 'TRIGGER',
  ACTION: 'ACTION',
  LOGIC: 'LOGIC',
  AI: 'AI',
  INTEGRATION: 'INTEGRATION',
  OUTPUT: 'OUTPUT',
};

export const FLOW_NODE_CATALOG = {
  trigger: [
    'Incoming WhatsApp Message',
    'Template Reply',
    'Button Click',
    'List Selection',
    'Contact Created',
    'Patient Created',
    'Appointment Created',
    'Appointment Updated',
    'Payment Captured',
    'Payment Failed',
    'Refund Processed',
    'Google Sheet Row Added',
    'Google Sheet Row Updated',
    'Calendar Event Created',
    'Webhook Received',
    'Tag Added',
    'Scheduled Trigger',
    'Manual Trigger',
  ],
  action: [
    'Send Template',
    'Send Text',
    'Send Image',
    'Send Document',
    'Send Video',
    'Send Location',
    'Send Contact',
    'Quick Reply',
    'List Message',
    'CTA',
    'Add Tag',
    'Remove Tag',
    'Check Tag',
    'Human Handoff',
    'End Flow',
  ],
  logic: [
    'Condition',
    'Branch',
    'Wait',
    'Delay',
    'Schedule',
    'Check Tag',
    'Check Patient Field',
    'Check Payment Status',
    'Check Appointment Status',
  ],
  integration: [
    'Google Sheets Read Row',
    'Google Sheets Append Row',
    'Google Sheets Update Row',
    'Google Sheets Find Row',
    'Google Calendar Find Event',
    'Google Calendar Create Event',
    'Google Calendar Update Event',
    'Razorpay Check Payment',
    'Razorpay Payment Event',
    'Razorpay Order Status',
    'Send Webhook',
    'Send Email',
  ],
  ai: [
    'AI Classify',
    'AI Reply',
    'AI Extract Data',
    'AI Search Knowledge',
    'AI Decision',
    'AI Handoff',
  ],
};

export const FLOW_NODE_LIBRARY = [
  { key: 'TRIGGERS', label: 'Triggers', type: FLOW_NODE_TYPES.TRIGGER, items: FLOW_NODE_CATALOG.trigger },
  { key: 'WHATSAPP_ACTIONS', label: 'WhatsApp Actions', type: FLOW_NODE_TYPES.ACTION, items: FLOW_NODE_CATALOG.action.filter((item) => ['Send Template', 'Send Text', 'Send Image', 'Send Document', 'Send Video', 'Send Location', 'Send Contact', 'Quick Reply', 'List Message', 'CTA'].includes(item)) },
  { key: 'TAGS_HANDOFF', label: 'Tags & Handoff', type: FLOW_NODE_TYPES.ACTION, items: FLOW_NODE_CATALOG.action.filter((item) => ['Add Tag', 'Remove Tag', 'Check Tag', 'Human Handoff', 'End Flow'].includes(item)) },
  { key: 'LOGIC', label: 'Conditions & Branches', type: FLOW_NODE_TYPES.LOGIC, items: FLOW_NODE_CATALOG.logic },
  { key: 'INTEGRATIONS', label: 'Integration Contracts', type: FLOW_NODE_TYPES.INTEGRATION, items: FLOW_NODE_CATALOG.integration },
  { key: 'AI', label: 'AI Foundation', type: FLOW_NODE_TYPES.AI, items: FLOW_NODE_CATALOG.ai },
];

export const FLOW_BRANCH_KEYS = {
  YES: 'YES',
  NO: 'NO',
  MAYBE: 'MAYBE',
  DEFAULT: 'DEFAULT',
  FALLBACK: 'FALLBACK',
};

export const WAIT_UNITS = ['seconds', 'minutes', 'hours', 'days'];

export const CONDITION_OPERATORS = ['equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than', 'exists', 'not_exists', 'in', 'not_in'];

export const CONDITION_LOGIC_OPTIONS = ['AND', 'OR'];

export const META_TEMPLATE_READINESS = {
  APPROVED: 'APPROVED',
  PENDING: 'PENDING',
  REJECTED: 'REJECTED',
  PAUSED: 'PAUSED',
  DISABLED: 'DISABLED',
  DRAFT: 'DRAFT',
};

export const CUSTOMER_SERVICE_WINDOW_STATES = {
  OPEN: 'CUSTOMER_SERVICE_WINDOW_OPEN',
  EXPIRED: 'CUSTOMER_SERVICE_WINDOW_EXPIRED',
};

export const POLICY_GATE_STATES = {
  ALLOWED: 'ALLOWED',
  REQUIRES_TEMPLATE: 'REQUIRES_TEMPLATE',
  REQUIRES_HUMAN: 'REQUIRES_HUMAN',
  BLOCKED: 'BLOCKED',
};

export const TEMPLATE_EXECUTION_NODE_TYPES = ['Send Template'];

export const FLOW_VARIABLE_GROUPS = {
  CONTACT: 'contact',
  PATIENT: 'patient',
  APPOINTMENT: 'appointment',
  PAYMENT: 'payment',
  MESSAGE: 'message',
  TRIGGER: 'trigger',
  TAG: 'tag',
};

export const FLOW_VARIABLE_CATALOG = [
  { id: 'var-contact-name', group: FLOW_VARIABLE_GROUPS.CONTACT, path: 'contact.name', label: 'Contact Name', dataType: 'string' },
  { id: 'var-contact-phone', group: FLOW_VARIABLE_GROUPS.CONTACT, path: 'contact.phone', label: 'Contact Phone', dataType: 'string' },
  { id: 'var-contact-email', group: FLOW_VARIABLE_GROUPS.CONTACT, path: 'contact.email', label: 'Contact Email', dataType: 'string' },
  { id: 'var-patient-id', group: FLOW_VARIABLE_GROUPS.PATIENT, path: 'patient.id', label: 'Patient ID', dataType: 'string' },
  { id: 'var-patient-name', group: FLOW_VARIABLE_GROUPS.PATIENT, path: 'patient.name', label: 'Patient Name', dataType: 'string' },
  { id: 'var-patient-doctor', group: FLOW_VARIABLE_GROUPS.PATIENT, path: 'patient.doctor', label: 'Patient Doctor', dataType: 'string' },
  { id: 'var-appointment-id', group: FLOW_VARIABLE_GROUPS.APPOINTMENT, path: 'appointment.id', label: 'Appointment ID', dataType: 'string' },
  { id: 'var-appointment-date', group: FLOW_VARIABLE_GROUPS.APPOINTMENT, path: 'appointment.date', label: 'Appointment Date', dataType: 'date' },
  { id: 'var-appointment-time', group: FLOW_VARIABLE_GROUPS.APPOINTMENT, path: 'appointment.time', label: 'Appointment Time', dataType: 'string' },
  { id: 'var-payment-id', group: FLOW_VARIABLE_GROUPS.PAYMENT, path: 'payment.id', label: 'Payment ID', dataType: 'string' },
  { id: 'var-payment-amount', group: FLOW_VARIABLE_GROUPS.PAYMENT, path: 'payment.amount', label: 'Payment Amount', dataType: 'number' },
  { id: 'var-payment-status', group: FLOW_VARIABLE_GROUPS.PAYMENT, path: 'payment.status', label: 'Payment Status', dataType: 'string' },
  { id: 'var-message-id', group: FLOW_VARIABLE_GROUPS.MESSAGE, path: 'message.id', label: 'Message ID', dataType: 'string' },
  { id: 'var-message-text', group: FLOW_VARIABLE_GROUPS.MESSAGE, path: 'message.text', label: 'Message Text', dataType: 'string' },
  { id: 'var-trigger-type', group: FLOW_VARIABLE_GROUPS.TRIGGER, path: 'trigger.type', label: 'Trigger Type', dataType: 'string' },
  { id: 'var-tag-id', group: FLOW_VARIABLE_GROUPS.TAG, path: 'tag.id', label: 'Tag ID', dataType: 'string' },
  { id: 'var-tag-label', group: FLOW_VARIABLE_GROUPS.TAG, path: 'tag.label', label: 'Tag Label', dataType: 'string' },
];

export const FLOW_NODE_TYPE_META = {
  TRIGGER: { label: 'Trigger', tone: 'border-cyan-300 bg-cyan-500/10 text-cyan-700 dark:border-cyan-900 dark:text-cyan-200' },
  ACTION: { label: 'Action', tone: 'border-emerald-300 bg-emerald-500/10 text-emerald-700 dark:border-emerald-900 dark:text-emerald-200' },
  LOGIC: { label: 'Logic', tone: 'border-amber-300 bg-amber-500/10 text-amber-700 dark:border-amber-900 dark:text-amber-200' },
  AI: { label: 'AI', tone: 'border-fuchsia-300 bg-fuchsia-500/10 text-fuchsia-700 dark:border-fuchsia-900 dark:text-fuchsia-200' },
  INTEGRATION: { label: 'Integration', tone: 'border-indigo-300 bg-indigo-500/10 text-indigo-700 dark:border-indigo-900 dark:text-indigo-200' },
  OUTPUT: { label: 'Output', tone: 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200' },
};

export const TRIGGER_TYPES = [
  'Incoming Message',
  'Template Reply',
  'Button Click',
  'List Selection',
  'Contact Created',
  'Patient Created',
  'Appointment Created',
  'Appointment Updated',
  'Payment Captured',
  'Payment Failed',
  'Refund Processed',
  'Google Sheet Row Added',
  'Google Sheet Row Updated',
  'Calendar Event Created',
  'Webhook Received',
  'Tag Added',
  'Tag Removed',
  'Tag Checked',
  'Scheduled',
  'Manual',
];

export const TRIGGER_STATUSES = {
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  DRAFT: 'DRAFT',
  ERROR: 'ERROR',
};

export const EXECUTION_STATUSES = {
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  SKIPPED: 'SKIPPED',
  WAITING: 'WAITING',
  RUNNING: 'RUNNING',
  PAUSED: 'PAUSED',
};

export const AUTOMATION_HANDOFF_STATES = {
  AUTOMATION_ACTIVE: 'AUTOMATION_ACTIVE',
  AUTOMATION_PAUSED: 'AUTOMATION_PAUSED',
  HUMAN_TAKEOVER: 'HUMAN_TAKEOVER',
  FLOW_COMPLETED: 'FLOW_COMPLETED',
  FLOW_FAILED: 'FLOW_FAILED',
};

export const IMPORT_ENTITY_TYPES = [
  'Contacts',
  'Patients',
  'Staff',
  'Payments',
  'Invoices',
  'Expenses',
  'Templates',
];

export const EXPORT_FORMATS = ['CSV', 'Excel-compatible CSV', 'JSON'];

export const EXPORT_DELIVERY_STATES = {
  PREPARING: 'PREPARING',
  READY: 'READY',
  SENT: 'SENT',
  EXPIRED: 'EXPIRED',
  FAILED: 'FAILED',
};

export const TEMPLATE_SELECTOR_FILTERS = ['name', 'templateCode', 'tags', 'category', 'language', 'metaStatus'];