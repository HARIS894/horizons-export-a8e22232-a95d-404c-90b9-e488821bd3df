export const createCrudService = (model) => ({
  list: (query) => model.list(query),
  create: (payload) => model.create(payload),
  getById: (id) => model.findById(id),
  update: (id, payload) => model.update(id, payload),
  remove: (id) => model.remove(id),
});