import { BaseModel } from './baseModel.js';

class AuthSessionModel extends BaseModel {
  constructor() {
    super({
      tableName: 'auth_sessions',
      entityName: 'auth session',
      searchFields: ['user_id', 'session_type', 'status'],
    });
  }
}

export const authSessionModel = new AuthSessionModel();