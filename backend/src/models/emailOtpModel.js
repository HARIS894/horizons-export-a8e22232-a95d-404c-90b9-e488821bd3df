import { BaseModel } from './baseModel.js';

class EmailOtpModel extends BaseModel {
  constructor() {
    super({
      tableName: 'email_otps',
      entityName: 'email otp',
      searchFields: ['email', 'purpose', 'status'],
    });
  }
}

export const emailOtpModel = new EmailOtpModel();