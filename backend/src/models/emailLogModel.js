import { BaseModel } from './baseModel.js';

class EmailLogModel extends BaseModel {
  constructor() {
    super({
      tableName: 'email_logs',
      entityName: 'email log',
      searchFields: ['recipient_email', 'subject', 'email_type', 'status'],
    });
  }
}

export const emailLogModel = new EmailLogModel();