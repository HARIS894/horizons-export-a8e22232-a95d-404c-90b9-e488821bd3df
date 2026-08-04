import { createCrudController } from './crudControllerFactory.js';
import { resourceServices } from '../services/resourceServices.js';

export const resourceControllers = Object.fromEntries(
  Object.entries(resourceServices).map(([key, service]) => [key, createCrudController(service)]),
);