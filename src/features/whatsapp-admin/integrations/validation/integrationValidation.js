import {
  INTEGRATION_CONNECTION_HEALTH,
  INTEGRATION_CONNECTION_STATUSES,
} from '../types/integrationTypes';

export const matchesIntegrationSearch = (integration, searchValue) => {
  const normalizedSearch = String(searchValue || '').trim().toLowerCase();
  if (!normalizedSearch) {
    return true;
  }

  return [
    integration.displayName,
    integration.description,
    integration.provider,
    integration.category,
    integration.accountLabel,
    integration.errorCode,
    integration.errorMessage,
    ...(integration.metadata?.capabilities || []),
    ...(integration.metadata?.useInFlow || []).map((item) => item.label),
  ].some((value) => String(value || '').toLowerCase().includes(normalizedSearch));
};

export const matchesIntegrationCategory = (integration, category) => category === 'All' || integration.category === category;

export const matchesIntegrationView = (integration, view) => {
  if (view === 'overview') {
    return true;
  }

  if (view === 'connected') {
    return integration.status === INTEGRATION_CONNECTION_STATUSES.CONNECTED;
  }

  if (view === 'needs-attention') {
    return [INTEGRATION_CONNECTION_STATUSES.ERROR, INTEGRATION_CONNECTION_STATUSES.REAUTH_REQUIRED].includes(integration.status)
      || [INTEGRATION_CONNECTION_HEALTH.WARNING, INTEGRATION_CONNECTION_HEALTH.ERROR].includes(integration.health);
  }

  if (view === 'available') {
    return [INTEGRATION_CONNECTION_STATUSES.DISCONNECTED, INTEGRATION_CONNECTION_STATUSES.DISABLED].includes(integration.status);
  }

  return true;
};

export const summarizeIntegrationConnections = (integrations) => {
  const connected = integrations.filter((integration) => integration.status === INTEGRATION_CONNECTION_STATUSES.CONNECTED).length;
  const needsAttention = integrations.filter((integration) => matchesIntegrationView(integration, 'needs-attention')).length;
  const available = integrations.filter((integration) => matchesIntegrationView(integration, 'available')).length;
  const verified = integrations.filter((integration) => integration.health === INTEGRATION_CONNECTION_HEALTH.HEALTHY).length;
  const lastChecked = integrations.find((integration) => integration.lastCheckedAt && integration.lastCheckedAt !== 'Not yet checked')?.lastCheckedAt || 'Not yet checked';

  return [
    { key: 'total', label: 'Overview', value: String(integrations.length), caption: 'Provider cards under backend-first control' },
    { key: 'connected', label: 'Connected', value: String(connected), caption: 'Only backend-verified connections count here' },
    { key: 'needs-attention', label: 'Needs Attention', value: String(needsAttention), caption: 'Warnings, disabled webhooks, or reauth blockers' },
    { key: 'available', label: 'Available', value: String(available), caption: 'Ready for safe backend connection work later' },
    { key: 'verified', label: 'Last Checked', value: lastChecked, caption: `${verified} providers currently show healthy verification` },
  ];
};

export const getConnectionActionState = (integration) => ({
  canDisconnect: integration.status === INTEGRATION_CONNECTION_STATUSES.CONNECTED || integration.status === INTEGRATION_CONNECTION_STATUSES.REAUTH_REQUIRED,
  connectLabel: integration.status === INTEGRATION_CONNECTION_STATUSES.REAUTH_REQUIRED ? 'Reconnect' : 'Connect',
  helperText: integration.status === INTEGRATION_CONNECTION_STATUSES.CONNECTED
    ? 'Backend-confirmed connection'
    : integration.metadata?.connectionHint || 'Backend connection required',
});

export const countGrantedPermissions = (integration) => (integration.permissions || []).filter((permission) => permission.status === 'GRANTED').length;
