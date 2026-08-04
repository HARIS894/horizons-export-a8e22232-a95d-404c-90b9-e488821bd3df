import { randomUUID } from 'node:crypto';
import { isSupabaseEnabled, supabaseAdmin } from '../config/supabase.js';
import { BaseModel } from './baseModel.js';
import { ApiError } from '../utils/ApiError.js';

const roleStore = [];

const normalizeUser = (user) => {
  if (!user) {
    return null;
  }

  return {
    ...user,
    fullName: user.fullName || user.full_name,
    passwordHash: user.passwordHash || user.password_hash,
    preferredLanguage: user.preferredLanguage || user.preferred_language,
    lastLoginAt: user.lastLoginAt || user.last_login_at,
  };
};

class UserModel extends BaseModel {
  constructor() {
    super({
      tableName: 'users',
      entityName: 'user',
      searchFields: ['email', 'full_name'],
    });
    this.mockUsers = [];
  }

  async findByEmail(email) {
    const normalizedEmail = `${email}`.toLowerCase();

    if (isSupabaseEnabled) {
      const { data, error } = await supabaseAdmin.from(this.tableName).select('*').eq('email', normalizedEmail).maybeSingle();
      if (error) {
        throw new ApiError(500, 'Failed to fetch user by email.', error);
      }

      return normalizeUser(data);
    }

    const { items } = await this.list({ page: 1, limit: 100, email: normalizedEmail });
    const exact = items.find((item) => `${item.email}`.toLowerCase() === normalizedEmail);
    return normalizeUser(exact || null);
  }

  async createUser(payload) {
    const created = await this.create({
      id: payload.id || randomUUID(),
      ...payload,
      email: payload.email.toLowerCase(),
    });

    return normalizeUser(created);
  }

  async updateUser(id, payload) {
    const updated = await this.update(id, payload);
    return normalizeUser(updated);
  }

  async findById(id) {
    const user = await super.findById(id);
    return normalizeUser(user);
  }

  async getUserRoles(userId) {
    if (isSupabaseEnabled) {
      const { data, error } = await supabaseAdmin
        .from('user_roles')
        .select('role_id, roles:role_id (slug, name)')
        .eq('user_id', userId);

      if (error) {
        throw new ApiError(500, 'Failed to load user roles.', error);
      }

      return (data || []).map((row) => row.roles?.slug).filter(Boolean);
    }

    return roleStore.filter((entry) => entry.user_id === userId).map((entry) => entry.role_slug);
  }

  async assignRole(userId, roleSlug) {
    if (isSupabaseEnabled) {
      const { data: role, error: roleError } = await supabaseAdmin.from('roles').select('id, slug').eq('slug', roleSlug).maybeSingle();
      if (roleError) {
        throw new ApiError(500, 'Failed to resolve role.', roleError);
      }
      if (!role) {
        throw new ApiError(404, `Role not found: ${roleSlug}`);
      }

      const { error } = await supabaseAdmin.from('user_roles').upsert({ user_id: userId, role_id: role.id }, { onConflict: 'user_id,role_id' });
      if (error) {
        throw new ApiError(500, 'Failed to assign role.', error);
      }
      return roleSlug;
    }

    const exists = roleStore.some((entry) => entry.user_id === userId && entry.role_slug === roleSlug);
    if (!exists) {
      roleStore.push({ id: randomUUID(), user_id: userId, role_slug: roleSlug });
    }

    return roleSlug;
  }
}

export const userModel = new UserModel();