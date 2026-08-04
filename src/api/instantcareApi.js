import { runtimeConfig } from '@/lib/runtimeConfig';

const ACCESS_TOKEN_KEY = 'instantcare_access_token';
const REFRESH_TOKEN_KEY = 'instantcare_refresh_token';
const SESSION_KEY = 'instantcare_auth_session';

const buildUrl = (path, query) => {
  const url = new URL(`${runtimeConfig.apiBaseUrl}${path}`);
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
};

const parseJsonSafe = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const setStoredSession = (session) => {
  if (session.accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
  }
  if (session.refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

const getStoredAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
const getStoredRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

const clearStoredSession = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(SESSION_KEY);
};

const refreshAccessToken = async () => {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) {
    clearStoredSession();
    return null;
  }

  const response = await fetch(buildUrl('/auth/refresh'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  const payload = await parseJsonSafe(response);
  if (!response.ok) {
    clearStoredSession();
    return null;
  }

  const session = {
    ...(JSON.parse(localStorage.getItem(SESSION_KEY) || 'null') || {}),
    accessToken: payload.data.accessToken,
    refreshToken: payload.data.refreshToken,
    roles: payload.data.roles || [],
  };
  setStoredSession(session);
  return session;
};

const request = async (path, options = {}, retry = true) => {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getStoredAccessToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path, options.query), {
    method: options.method || 'GET',
    headers,
    body: options.body instanceof FormData || !options.body ? options.body : JSON.stringify(options.body),
  });

  if (response.status === 401 && retry && getStoredRefreshToken()) {
    const refreshed = await refreshAccessToken();
    if (refreshed?.accessToken) {
      return request(path, options, false);
    }
  }

  const payload = await parseJsonSafe(response);
  if (!response.ok) {
    const error = new Error(payload?.error?.message || `Request failed with status ${response.status}`);
    error.details = payload?.error?.details || payload;
    throw error;
  }

  return payload?.data;
};

const mapInquiryPayload = (values, integrationPayload) => ({
  fullName: values.name,
  country: values.country,
  mobileNumber: values.phone,
  whatsappNumber: values.whatsapp,
  email: values.email,
  patientName: values.patientName,
  patientAge: Number(values.patientAge),
  gender: values.gender?.toLowerCase().replace(/\s+/g, '_'),
  city: values.city,
  postalCode: values.pincode,
  manualLocation: values.currentLocation,
  currentLatitude: integrationPayload.location.coordinates?.latitude ? Number(integrationPayload.location.coordinates.latitude) : null,
  currentLongitude: integrationPayload.location.coordinates?.longitude ? Number(integrationPayload.location.coordinates.longitude) : null,
  preferredLanguage: values.preferredLanguage,
  serviceRequired: values.preferredService,
  medicalCondition: values.medicalCondition,
  hospitalName: values.hospitalName || null,
  doctorName: values.doctorName || null,
  preferredDate: values.preferredDate || null,
  preferredTime: values.preferredTime || null,
  additionalNotes: values.additionalNotes || null,
  source: values.source || 'website',
  payload: integrationPayload,
});

export const instantcareApi = {
  getSession() {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
  },

  clearSession() {
    clearStoredSession();
  },

  async login(role, credentials) {
    const data = await request(`/auth/login/${role}`, { method: 'POST', body: credentials }, false);
    const session = {
      user: data.user,
      roles: data.roles || [],
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };
    setStoredSession(session);
    return session;
  },

  async me() {
    const user = await request('/auth/me');
    const current = this.getSession() || {};
    const session = { ...current, user, roles: user.roles || current.roles || [] };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  },

  async logout() {
    const refreshToken = getStoredRefreshToken();
    if (refreshToken) {
      try {
        await request('/auth/logout', { method: 'POST', body: { refreshToken } }, false);
      } catch {
      }
    }
    clearStoredSession();
  },

  async getHealth() {
    return request('/health', {}, false);
  },

  async createInquiry(values, integrationPayload) {
    return request('/enquiries', {
      method: 'POST',
      body: mapInquiryPayload(values, integrationPayload),
    }, false);
  },

  async getDashboardBundle() {
    const [overview, patients, enquiries, staff, hospitals, appointments, insurance, billing, reports, notifications, emailLogs, whatsappLogs] = await Promise.all([
      request('/dashboard/overview'),
      request('/patients', { query: { page: 1, limit: 50, sortBy: 'created_at', sortOrder: 'desc' } }),
      request('/enquiries', { query: { page: 1, limit: 50, sortBy: 'created_at', sortOrder: 'desc' } }),
      request('/staff', { query: { page: 1, limit: 50, sortBy: 'created_at', sortOrder: 'desc' } }),
      request('/hospitals', { query: { page: 1, limit: 50, sortBy: 'created_at', sortOrder: 'desc' } }),
      request('/appointments', { query: { page: 1, limit: 50, sortBy: 'scheduled_start', sortOrder: 'desc' } }),
      request('/insurance', { query: { page: 1, limit: 50, sortBy: 'created_at', sortOrder: 'desc' } }),
      request('/billing', { query: { page: 1, limit: 50, sortBy: 'created_at', sortOrder: 'desc' } }),
      request('/reports', { query: { page: 1, limit: 50, sortBy: 'created_at', sortOrder: 'desc' } }),
      request('/notifications', { query: { page: 1, limit: 50, sortBy: 'created_at', sortOrder: 'desc' } }),
      request('/emails/logs', { query: { page: 1, limit: 50, sortBy: 'created_at', sortOrder: 'desc' } }),
      request('/whatsapp/logs', { query: { page: 1, limit: 50, sortBy: 'created_at', sortOrder: 'desc' } }),
    ]);

    return {
      overview,
      patients: patients.items,
      enquiries: enquiries.items,
      staff: staff.items,
      hospitals: hospitals.items,
      appointments: appointments.items,
      insurance: insurance.items,
      billing: billing.items,
      reports: reports.items,
      notifications: notifications.items,
      emailLogs: emailLogs.items,
      whatsappLogs: whatsappLogs.items,
    };
  },

  async getHealthcareLibraryDataset(search = '') {
    return request('/content/healthcare-library', { query: { search } }, false);
  },

  async searchHealthcareLibrary(query) {
    return request('/content/search', { query: { query } }, false);
  },
};