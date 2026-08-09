import { BaseModel } from './baseModel.js';
import { isSupabaseEnabled, supabaseAdmin } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';

class WhatsAppContactModel extends BaseModel {
  constructor() {
    super({
      tableName: 'whatsapp_contacts',
      entityName: 'whatsapp contact',
      searchFields: ['name', 'phone_number', 'notes'],
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
        throw new ApiError(500, 'Failed to fetch WhatsApp contact by phone number.', error);
      }

      return data || null;
    }

    const result = await this.list({ page: 1, limit: 100, phone_number: phoneNumber });
    return result.items[0] || null;
  }

  async findManyByIds(ids) {
    const uniqueIds = [...new Set((ids || []).filter(Boolean))];
    if (!uniqueIds.length) {
      return [];
    }

    if (isSupabaseEnabled) {
      const { data, error } = await supabaseAdmin
        .from(this.tableName)
        .select('*')
        .in('id', uniqueIds);

      if (error) {
        throw new ApiError(500, 'Failed to fetch WhatsApp contacts.', error);
      }

      return data || [];
    }

    const result = await this.list({ page: 1, limit: uniqueIds.length * 2 || 10 });
    return result.items.filter((item) => uniqueIds.includes(item.id));
  }
}

export const whatsappContactModel = new WhatsAppContactModel();