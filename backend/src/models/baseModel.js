import { randomUUID } from 'node:crypto';
import { isSupabaseEnabled, supabaseAdmin } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';

const memoryStore = new Map();

const getTableStore = (tableName) => {
  if (!memoryStore.has(tableName)) {
    memoryStore.set(tableName, []);
  }

  return memoryStore.get(tableName);
};

const isReservedQueryKey = (key) => ['page', 'limit', 'search', 'sortBy', 'sortOrder'].includes(key);

export class BaseModel {
  constructor({ tableName, entityName, searchFields = [] }) {
    this.tableName = tableName;
    this.entityName = entityName;
    this.searchFields = searchFields;
  }

  async list(query = {}) {
    if (isSupabaseEnabled) {
      const page = Number(query.page || 1);
      const limit = Number(query.limit || 10);
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      const sortBy = query.sortBy || 'created_at';
      const sortOrder = query.sortOrder === 'asc' ? true : false;

      let request = supabaseAdmin.from(this.tableName).select('*', { count: 'exact' });

      Object.entries(query).forEach(([key, value]) => {
        if (!value || isReservedQueryKey(key)) {
          return;
        }

        request = request.eq(key, value);
      });

      if (query.search && this.searchFields.length) {
        const clause = this.searchFields.map((field) => `${field}.ilike.%${query.search}%`).join(',');
        request = request.or(clause);
      }

      const { data, error, count } = await request.order(sortBy, { ascending: sortOrder }).range(from, to);

      if (error) {
        throw new ApiError(500, `Failed to fetch ${this.entityName} records.`, error);
      }

      return {
        items: data,
        meta: {
          page,
          limit,
          total: count || 0,
        },
      };
    }

    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
    const search = `${query.search || ''}`.toLowerCase();

    let items = [...getTableStore(this.tableName)];

    Object.entries(query).forEach(([key, value]) => {
      if (!value || isReservedQueryKey(key)) {
        return;
      }

      items = items.filter((item) => `${item[key] ?? ''}` === `${value}`);
    });

    if (search && this.searchFields.length) {
      items = items.filter((item) => this.searchFields.some((field) => `${item[field] ?? ''}`.toLowerCase().includes(search)));
    }

    items.sort((left, right) => {
      const first = left[sortBy] ?? '';
      const second = right[sortBy] ?? '';
      return first > second ? sortOrder : -sortOrder;
    });

    const total = items.length;
    const start = (page - 1) * limit;
    const pagedItems = items.slice(start, start + limit);

    return {
      items: pagedItems,
      meta: {
        page,
        limit,
        total,
      },
    };
  }

  async findById(id) {
    if (isSupabaseEnabled) {
      const { data, error } = await supabaseAdmin.from(this.tableName).select('*').eq('id', id).single();

      if (error) {
        throw new ApiError(404, `${this.entityName} not found.`, error);
      }

      return data;
    }

    const record = getTableStore(this.tableName).find((item) => item.id === id);
    if (!record) {
      throw new ApiError(404, `${this.entityName} not found.`);
    }

    return record;
  }

  async create(payload) {
    if (isSupabaseEnabled) {
      const { data, error } = await supabaseAdmin.from(this.tableName).insert(payload).select('*').single();
      if (error) {
        throw new ApiError(500, `Failed to create ${this.entityName}.`, error);
      }

      return data;
    }

    const now = new Date().toISOString();
    const record = {
      id: payload.id || randomUUID(),
      ...payload,
      createdAt: payload.createdAt || now,
      updatedAt: payload.updatedAt || now,
    };

    const table = getTableStore(this.tableName);
    table.unshift(record);
    return record;
  }

  async update(id, payload) {
    if (isSupabaseEnabled) {
      const { data, error } = await supabaseAdmin
        .from(this.tableName)
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        throw new ApiError(500, `Failed to update ${this.entityName}.`, error);
      }

      return data;
    }

    const table = getTableStore(this.tableName);
    const index = table.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new ApiError(404, `${this.entityName} not found.`);
    }

    table[index] = {
      ...table[index],
      ...payload,
      updatedAt: new Date().toISOString(),
    };

    return table[index];
  }

  async remove(id) {
    if (isSupabaseEnabled) {
      const { error } = await supabaseAdmin.from(this.tableName).delete().eq('id', id);
      if (error) {
        throw new ApiError(500, `Failed to delete ${this.entityName}.`, error);
      }

      return { id };
    }

    const table = getTableStore(this.tableName);
    const index = table.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new ApiError(404, `${this.entityName} not found.`);
    }

    const [removed] = table.splice(index, 1);
    return removed;
  }
}