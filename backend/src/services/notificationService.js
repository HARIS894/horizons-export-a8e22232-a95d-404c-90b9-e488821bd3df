import { resourceServices } from './resourceServices.js';

const baseService = resourceServices.notifications;

export const notificationService = {
  list: (query) => baseService.list(query),
  create: (payload) => baseService.create(payload),
  getById: (id) => baseService.getById(id),
  update: (id, payload) => baseService.update(id, payload),
  remove: (id) => baseService.remove(id),
  markAsRead: async (id) => baseService.update(id, { status: 'read' }),
};