import { Router } from 'express';
import { RESOURCE_DEFINITIONS } from '../config/resourceRegistry.js';
import { resourceControllers } from '../controllers/resourceControllers.js';
import { authenticate, authorize } from '../middleware/authenticate.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { idParamValidator, listQueryValidator } from '../validators/commonValidators.js';
import { resourceValidators } from '../validators/resourceValidators.js';

const router = Router();

RESOURCE_DEFINITIONS.forEach((definition) => {
  const controller = resourceControllers[definition.key];
  const validators = resourceValidators[definition.key] || { create: [], update: [] };
  const resourceRouter = Router();

  if (definition.publicRead) {
    resourceRouter.get('/', listQueryValidator, validateRequest, controller.list);
    resourceRouter.get('/:id', idParamValidator, validateRequest, controller.getById);
  } else {
    resourceRouter.get('/', authenticate, authorize(...(definition.readRoles || ['admin'])), listQueryValidator, validateRequest, controller.list);
    resourceRouter.get('/:id', authenticate, authorize(...(definition.readRoles || ['admin'])), idParamValidator, validateRequest, controller.getById);
  }

  if (definition.publicCreate) {
    resourceRouter.post('/', validators.create, validateRequest, controller.create);
  } else {
    resourceRouter.post('/', authenticate, authorize(...(definition.writeRoles || ['admin'])), validators.create, validateRequest, controller.create);
  }
  resourceRouter.patch('/:id', authenticate, authorize(...(definition.writeRoles || ['admin'])), [...idParamValidator, ...validators.update], validateRequest, controller.update);
  resourceRouter.delete('/:id', authenticate, authorize(...(definition.writeRoles || ['admin'])), idParamValidator, validateRequest, controller.remove);

  router.use(`/${definition.routePath}`, resourceRouter);
});

export default router;