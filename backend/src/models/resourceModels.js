import { RESOURCE_DEFINITIONS } from '../config/resourceRegistry.js';
import { BaseModel } from './baseModel.js';

export const resourceModels = Object.fromEntries(
  RESOURCE_DEFINITIONS.map((definition) => [definition.key, new BaseModel(definition)]),
);