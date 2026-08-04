import { BaseModel } from './baseModel.js';

class WhatsAppLogModel extends BaseModel {
  constructor() {
    super({
      tableName: 'whatsapp_logs',
      entityName: 'whatsapp log',
      searchFields: ['recipient_phone', 'template_name', 'whatsapp_type', 'status', 'provider_message_id'],
    });
  }
}

export const whatsappLogModel = new WhatsAppLogModel();