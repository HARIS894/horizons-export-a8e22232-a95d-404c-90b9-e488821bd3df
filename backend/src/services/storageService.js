import { isSupabaseEnabled, supabaseAdmin } from '../config/supabase.js';
import { env } from '../config/env.js';

export const storageService = {
  async uploadFile(path, fileBuffer, options = {}) {
    if (!isSupabaseEnabled) {
      return {
        path,
        bucket: env.supabaseStorageBucket,
        mock: true,
        contentType: options.contentType || 'application/octet-stream',
      };
    }

    const { data, error } = await supabaseAdmin.storage.from(env.supabaseStorageBucket).upload(path, fileBuffer, options);
    if (error) {
      throw error;
    }

    return data;
  },

  async deleteFile(path) {
    if (!isSupabaseEnabled) {
      return { path, deleted: true, mock: true };
    }

    const { error } = await supabaseAdmin.storage.from(env.supabaseStorageBucket).remove([path]);
    if (error) {
      throw error;
    }

    return { path, deleted: true };
  },

  async createSignedUrl(path, expiresIn = 3600) {
    if (!isSupabaseEnabled) {
      return { signedUrl: `/mock-storage/${path}`, expiresIn, mock: true };
    }

    const { data, error } = await supabaseAdmin.storage.from(env.supabaseStorageBucket).createSignedUrl(path, expiresIn);
    if (error) {
      throw error;
    }

    return data;
  },
};