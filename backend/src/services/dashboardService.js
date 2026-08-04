import { RESOURCE_DEFINITIONS } from '../config/resourceRegistry.js';
import { resourceServices } from './resourceServices.js';

const getCount = async (key) => {
  const result = await resourceServices[key].list({ page: 1, limit: 1 });
  return result.meta.total;
};

export const dashboardService = {
  async getOverview() {
    const [patients, appointments, enquiries, billing, staff] = await Promise.all([
      getCount('patients'),
      getCount('appointments'),
      getCount('enquiries'),
      getCount('billing'),
      getCount('staff'),
    ]);

    return {
      totalPatients: patients,
      totalAppointments: appointments,
      pendingEnquiries: enquiries,
      billingRecords: billing,
      staffCount: staff,
      mode: 'rest-api-ready',
    };
  },

  async getWidgets() {
    const overview = await this.getOverview();
    return [
      { key: 'patients', label: 'Patients', value: overview.totalPatients },
      { key: 'appointments', label: 'Appointments', value: overview.totalAppointments },
      { key: 'enquiries', label: 'Enquiries', value: overview.pendingEnquiries },
      { key: 'staff', label: 'Staff', value: overview.staffCount },
    ];
  },

  getModules() {
    return RESOURCE_DEFINITIONS.map((resource) => ({
      key: resource.key,
      routePath: `/api/v1/${resource.routePath}`,
      tableName: resource.tableName,
      publicRead: Boolean(resource.publicRead),
    }));
  },
};