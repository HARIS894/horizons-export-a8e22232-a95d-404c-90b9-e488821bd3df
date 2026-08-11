import { AUTOMATION_HANDOFF_STATES } from '../types/automationTypes';

export const templateIdentityContract = {
  identity: 'Every template has an immutable templateCode used by flows, triggers, and imports instead of display names.',
  providerStatus: 'Imported or mock metaStatus is advisory only and never proof of real Meta approval.',
  flowSelector: 'Executable flows can select only templates that match approved send context, language, and provider constraints.',
};

export const flowExecutionContracts = {
  flowEngine: 'Server-side resolver that loads a flow definition, evaluates entry criteria, and advances node execution safely.',
  triggerEngine: 'Server-side trigger matcher that maps incoming events to trigger codes and linked flow IDs.',
  nodeExecutor: 'Executes a single action, logic, or handoff node using backend-owned provider adapters.',
  templateResolver: 'Resolves Template Code to the latest valid template version and provider-facing metadata.',
  conditionEvaluator: 'Evaluates branch conditions, reply matches, tags, appointment fields, payment states, and patient fields.',
  variableResolver: 'Resolves structured variable references such as patient.name, payment.status, or appointment.date during node execution.',
  waitScheduler: 'Schedules delayed or waiting nodes without relying on the frontend runtime.',
  policyGate: 'Enforces template approval, customer service window, opt-in, and message-type policy before any outbound message action can execute.',
  integrationGateway: 'Invokes backend-owned provider adapters for Sheets, Calendar, Razorpay, Email, Webhooks, and future AI tools.',
  humanHandoffService: 'Transfers automation state to human operators while preserving the existing inbox conversation handling.',
  webhookEvent: 'Normalized event envelope for WhatsApp, payments, scheduling, and external provider callbacks.',
  executionLog: 'Append-only runtime log with flow, trigger, entity, node, timing, and error metadata.',
};

export const integrationAdapterContracts = {
  googleSheets: ['connect', 'disconnect', 'testConnection', 'getStatus', 'readRow', 'appendRow', 'updateRow', 'findRow', 'getLogs'],
  googleCalendar: ['connect', 'disconnect', 'testConnection', 'getStatus', 'findEvent', 'createEvent', 'updateEvent', 'getLogs'],
  razorpay: ['getStatus', 'checkPayment', 'paymentEvent', 'orderStatus', 'getLogs', 'handleWebhook'],
  email: ['prepareExportLink', 'sendEmail', 'getStatus', 'getLogs'],
  webhook: ['sendWebhook', 'testConnection', 'getStatus', 'getLogs'],
};

export const importExportContracts = {
  schemaDriven: 'Every entity import/export uses a fixed schema definition rather than hard-coded component mappings.',
  validation: 'Imports report accepted, rejected, duplicates, and warnings, with downloadable rejected-row reports.',
  security: 'Exports use secure expiring download references delivered by backend email workflows instead of raw sensitive attachments.',
};

export const automationHandoffContracts = {
  states: AUTOMATION_HANDOFF_STATES,
  inboxCompatibility: 'Manual takeover must pause automation state for the conversation while preserving the existing inbox send architecture.',
  conflictPrevention: 'Automation must not send competing messages while a conversation is under human takeover.',
};

export const flowExecutionRecordFields = ['executionId', 'flowId', 'flowCode', 'triggerId', 'contactId', 'patientId', 'startedAt', 'completedAt', 'status', 'currentNodeId', 'failedNodeId', 'error', 'metadata'];

export const nodeExecutionRecordFields = ['executionId', 'nodeId', 'nodeType', 'startedAt', 'completedAt', 'status', 'input', 'output', 'error'];

export const policyGateContract = {
  method: 'canSendMessage',
  input: ['recipient', 'messageType', 'templateCode', 'customerServiceWindow', 'optIn', 'metaStatus'],
  output: ['allowed', 'reason', 'requiresTemplate', 'requiresHuman', 'policyState'],
  note: 'Frontend preview is advisory only. The real backend must enforce final policy decisions.',
};