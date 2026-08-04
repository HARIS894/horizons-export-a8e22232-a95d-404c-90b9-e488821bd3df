import { createCrudService } from './crudServiceFactory.js';
import { resourceModels } from '../models/resourceModels.js';

export const resourceServices = Object.fromEntries(
  Object.entries(resourceModels).map(([key, model]) => [key, createCrudService(model)]),
);