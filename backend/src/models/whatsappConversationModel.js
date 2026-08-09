import { BaseModel } from './baseModel.js';
import { isSupabaseEnabled, supabaseAdmin } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';

class WhatsAppConversationModel extends BaseModel {
  constructor() {
    super({
      tableName: 'whatsapp_conversations',
      entityName: 'whatsapp conversation',
      searchFields: ['phone_number', 'status'],
    });
  }

  async findByPhoneNumber(phoneNumber) {
    if (isSupabaseEnabled) {
      const { data, error } = await supabaseAdmin
        .from(this.tableName)
        .select('*')
        .eq('phone_number', phoneNumber)
        .maybeSingle();

      if (error) {
        throw new ApiError(500, 'Failed to fetch WhatsApp conversation by phone number.', error);
      }

      return data || null;
    }

    const result = await this.list({ page: 1, limit: 100, phone_number: phoneNumber });
    return result.items[0] || null;
  }
}

export const whatsappConversationModel = new WhatsAppConversationModel();