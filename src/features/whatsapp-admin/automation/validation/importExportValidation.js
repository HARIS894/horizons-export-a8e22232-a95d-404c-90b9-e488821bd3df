import {
  CONDITION_OPERATORS,
  FLOW_BRANCH_KEYS,
  FLOW_NODE_TYPES,
  FLOW_VALIDATION_SEVERITY,
  META_TEMPLATE_READINESS,
  TEMPLATE_EXECUTION_NODE_TYPES,
} from '../types/automationTypes';

const phonePattern = /^\+?[1-9]\d{7,14}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValidDate = (value) => !Number.isNaN(Date.parse(String(value || '').trim()));

const isEmpty = (value) => value === undefined || value === null || String(value).trim() === '';

export const validateImportRows = (schema, rows = [], uploadedColumns = []) => {
  const columnKeys = (schema?.columns || []).map((column) => column.key);
  const requiredColumns = (schema?.columns || []).filter((column) => column.required).map((column) => column.key);
  const missingColumns = requiredColumns.filter((column) => !uploadedColumns.includes(column));
  const unknownColumns = uploadedColumns.filter((column) => !columnKeys.includes(column));
  const duplicateSet = new Set();
  const rowResults = rows.map((row, index) => {
    const errors = [];
    const warnings = [];

    (schema?.columns || []).forEach((column) => {
      const value = row[column.key];
      if (column.required && isEmpty(value)) {
        errors.push(`Missing required column value: ${column.key}`);
      }

      if (isEmpty(value)) {
        return;
      }

      if (column.type === 'phone' && !phonePattern.test(String(value))) {
        errors.push(`Invalid phone in ${column.key}`);
      }

      if (column.type === 'email' && !emailPattern.test(String(value))) {
        errors.push(`Invalid email in ${column.key}`);
      }

      if (column.type === 'date' && !isValidDate(value)) {
        errors.push(`Invalid date in ${column.key}`);
      }

      if (column.type === 'enum' && Array.isArray(column.allowedValues) && !column.allowedValues.includes(value)) {
        errors.push(`Invalid enum/status in ${column.key}`);
      }
    });

    const duplicateKey = schema?.duplicateKey;
    const duplicateValue = duplicateKey ? row[duplicateKey] : undefined;
    if (!isEmpty(duplicateValue)) {
      if (duplicateSet.has(duplicateValue)) {
        errors.push(`Duplicate record: ${duplicateValue}`);
      }
      duplicateSet.add(duplicateValue);
    }

    if (unknownColumns.length) {
      warnings.push(`Unknown columns present: ${unknownColumns.join(', ')}`);
    }

    return {
      id: `row-${index + 1}`,
      index: index + 1,
      row,
      errors,
      warnings,
      status: errors.length ? 'Rejected' : warnings.length ? 'Warning' : 'Accepted',
    };
  });

  const accepted = rowResults.filter((row) => row.status === 'Accepted').length;
  const warnings = rowResults.filter((row) => row.status === 'Warning').length;
  const rejected = rowResults.filter((row) => row.status === 'Rejected').length;
  const duplicates = rowResults.filter((row) => row.errors.some((error) => error.startsWith('Duplicate record'))).length;

  return {
    missingColumns,
    unknownColumns,
    accepted,
    warnings,
    rejected,
    duplicates,
    rowResults,
  };
};

export const validateFlowDefinition = (flow) => {
  const errors = [];
  const warnings = [];

  const pushError = (code, message, nodeId = '') => errors.push({ code, message, nodeId, severity: FLOW_VALIDATION_SEVERITY.ERROR });
  const pushWarning = (code, message, nodeId = '') => warnings.push({ code, message, nodeId, severity: FLOW_VALIDATION_SEVERITY.WARNING });

  if (!flow?.flowCode) {
    pushError('MISSING_FLOW_CODE', 'Flow Code is required.');
  }

  if (!Array.isArray(flow?.nodes) || !flow.nodes.length) {
    pushError('NO_NODES', 'At least one node is required.');
  }

  if (!Array.isArray(flow?.edges) || !flow.edges.length) {
    pushError('NO_EDGES', 'At least one edge is required.');
  }

  const nodeIds = new Set();
  const triggerNodes = [];
  const inboundEdgeCount = {};
  const outboundEdgeCount = {};

  (flow?.nodes || []).forEach((node) => {
    if (nodeIds.has(node.id)) {
      pushError('DUPLICATE_NODE_ID', `Duplicate node ID detected: ${node.id}`, node.id);
    }

    nodeIds.add(node.id);

    if (node.type === FLOW_NODE_TYPES.TRIGGER) {
      triggerNodes.push(node.id);
    }

    if (TEMPLATE_EXECUTION_NODE_TYPES.includes(node.subtype)) {
      if (!node.config?.templateCode) {
        pushError('MISSING_TEMPLATE', 'Send Template node requires a Template Code.', node.id);
      }

      if (node.config?.metaStatus && node.config.metaStatus !== META_TEMPLATE_READINESS.APPROVED) {
        pushError('TEMPLATE_NOT_APPROVED', 'Only APPROVED templates may be considered executable for production template sends.', node.id);
      }

      if (!node.config?.variableMappings && !node.config?.variableMapping) {
        pushWarning('MISSING_VARIABLE_MAPPING', 'Template variable mappings should be configured as structured data.', node.id);
      }
    }

    if (node.subtype === 'Condition') {
      const rules = node.config?.rules || [];
      if (!rules.length) {
        pushError('MISSING_CONDITION', 'Condition node requires at least one rule.', node.id);
      }

      rules.forEach((rule, index) => {
        if (!rule.fieldRef?.path && !rule.field) {
          pushError('MISSING_CONDITION_FIELD', `Condition rule ${index + 1} requires a field reference.`, node.id);
        }

        if (!CONDITION_OPERATORS.includes(rule.operator)) {
          pushError('INVALID_CONDITION_OPERATOR', `Condition rule ${index + 1} uses an unsupported operator.`, node.id);
        }

        if (!['exists', 'not_exists'].includes(rule.operator) && (rule.value === undefined || rule.value === null || rule.value === '')) {
          pushError('MISSING_CONDITION_VALUE', `Condition rule ${index + 1} requires a value.`, node.id);
        }
      });
    }

    if (node.subtype === 'Quick Reply') {
      const buttons = node.config?.buttons || [];
      if (!buttons.length) {
        pushError('MISSING_QUICK_REPLY_BUTTONS', 'Quick Reply node requires button definitions.', node.id);
      }

      buttons.forEach((button, index) => {
        if (!button.quickReplyId || !button.label || !button.value) {
          pushError('INVALID_QUICK_REPLY', `Quick Reply button ${index + 1} requires quickReplyId, label, and value.`, node.id);
        }
      });
    }

    if (['Wait', 'Delay', 'Schedule'].includes(node.subtype)) {
      if (!node.config?.duration || Number(node.config.duration) <= 0) {
        pushError('INVALID_WAIT_DURATION', `${node.subtype} node requires a positive duration.`, node.id);
      }

      if (!node.config?.unit && node.subtype !== 'Delay') {
        pushError('MISSING_WAIT_UNIT', `${node.subtype} node requires a time unit.`, node.id);
      }
    }

    if (node.subtype === 'Human Handoff' && !node.config?.pauseAutomation) {
      pushWarning('HANDOFF_SHOULD_PAUSE', 'Human Handoff should pause automation to avoid conflicting conversation actions.', node.id);
    }

    if (node.type === FLOW_NODE_TYPES.INTEGRATION && !node.config?.backendExecutionRequired) {
      pushError('MISSING_INTEGRATION_CONTRACT', 'Integration action node must declare backend execution requirement.', node.id);
    }
  });

  if (!triggerNodes.length) {
    pushError('NO_TRIGGER', 'At least one trigger node is required.');
  }

  (flow?.edges || []).forEach((edge) => {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
      pushError('UNKNOWN_NODE_REFERENCE', `Edge ${edge.id} references an unknown node.`);
    }

    if (edge.source === edge.target) {
      pushError('SELF_CONNECTION', `Node ${edge.source} cannot connect to itself.`, edge.source);
    }

    inboundEdgeCount[edge.target] = (inboundEdgeCount[edge.target] || 0) + 1;
    outboundEdgeCount[edge.source] = (outboundEdgeCount[edge.source] || 0) + 1;

    if (!edge.branchKey && !edge.branchLabel) {
      pushWarning('MISSING_BRANCH_METADATA', `Edge ${edge.id} should carry visible branch metadata.`);
    }

    if (edge.branchKey && !Object.values(FLOW_BRANCH_KEYS).includes(edge.branchKey)) {
      pushError('INVALID_BRANCH_KEY', `Edge ${edge.id} uses an invalid branch key.`);
    }
  });

  (flow?.nodes || []).forEach((node) => {
    if (node.type !== FLOW_NODE_TYPES.TRIGGER && !inboundEdgeCount[node.id]) {
      pushError('DISCONNECTED_NODE', `Node ${node.label} is disconnected from any upstream node.`, node.id);
    }

    if (['Condition', 'Branch', 'Quick Reply'].includes(node.subtype) && !outboundEdgeCount[node.id]) {
      pushError('INVALID_BRANCH', `${node.subtype} node requires at least one outgoing branch.`, node.id);
    }
  });

  const hasEndNode = (flow?.nodes || []).some((node) => !outboundEdgeCount[node.id]);
  if (!hasEndNode) {
    pushError('NO_END_NODE', 'Flow requires at least one reachable end state.');
  }

  const severity = errors.length ? FLOW_VALIDATION_SEVERITY.ERROR : warnings.length ? FLOW_VALIDATION_SEVERITY.WARNING : FLOW_VALIDATION_SEVERITY.PASS;

  return {
    isValid: !errors.length,
    canPublish: !errors.length,
    severity,
    errors: errors.map((entry) => entry.message),
    warnings: warnings.map((entry) => entry.message),
    issues: [...errors, ...warnings],
  };
};