import { BaseModel } from './baseModel.js';

export const healthcareLibraryModel = new BaseModel({
  tableName: 'healthcare_library',
  entityName: 'healthcare library',
  searchFields: ['name', 'slug', 'description'],
});

export const categoriesModel = new BaseModel({
  tableName: 'categories',
  entityName: 'category',
  searchFields: ['name', 'slug', 'description'],
});

export const faqsModel = new BaseModel({
  tableName: 'faqs',
  entityName: 'faq',
  searchFields: ['question', 'answer'],
});

export const articlesModel = new BaseModel({
  tableName: 'articles',
  entityName: 'article',
  searchFields: ['title', 'slug', 'excerpt'],
});