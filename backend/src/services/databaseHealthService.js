import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { isSupabaseEnabled, supabaseAdmin } from '../config/supabase.js';

const probeTables = ['users', 'roles', 'enquiries', 'healthcare_library', 'articles'];

export const databaseHealthService = {
  async getStatus() {
    if (!isSupabaseEnabled) {
      return {
        configured: false,
        connected: false,
        schemaReady: false,
        url: null,
        message: 'Supabase environment variables are not configured.',
      };
    }

    const result = {
      configured: true,
      connected: false,
      schemaReady: false,
      url: env.supabaseUrl,
      probes: [],
    };

    for (const table of probeTables) {
      const { error, count } = await supabaseAdmin.from(table).select('id', { head: true, count: 'exact' }).limit(1);
      if (error) {
        result.probes.push({ table, ok: false, error: error.message });
        if (!result.connected) {
          result.connected = true;
        }
        continue;
      }

      result.probes.push({ table, ok: true, count: count ?? 0 });
      result.connected = true;
      result.schemaReady = true;
    }

    if (result.connected) {
      logger.info({ supabaseUrl: env.supabaseUrl, probes: result.probes }, 'Supabase database connectivity verified');
    }

    if (!result.connected) {
      result.message = 'Unable to verify Supabase connectivity.';
    } else if (!result.schemaReady) {
      result.message = 'Supabase is reachable, but the InstantCare schema is not fully available yet.';
    } else {
      result.message = 'Supabase connectivity verified successfully.';
    }

    return result;
  },
};