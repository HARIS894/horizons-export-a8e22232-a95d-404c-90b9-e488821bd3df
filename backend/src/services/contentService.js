import { articlesModel, categoriesModel, faqsModel, healthcareLibraryModel } from '../models/contentModels.js';
import { resourceServices } from './resourceServices.js';

const normalizeLibrary = (library) => ({
  id: library.id,
  title: library.name,
  slug: library.slug,
  description: library.description || '',
  heroTitle: library.metadata?.heroTitle || library.name,
  heroText: library.metadata?.heroText || library.description || '',
  seoTitle: library.metadata?.seoTitle || library.name,
  seoDescription: library.metadata?.seoDescription || library.description || '',
  focusAreas: library.metadata?.focusAreas || [],
  featuredArticleSlugs: library.metadata?.featuredArticleSlugs || [],
  serviceSlugs: library.metadata?.serviceSlugs || [],
});

const normalizeArticle = (article) => ({
  id: article.id,
  librarySlug: article.metadata?.librarySlug || article.metadata?.library_slug || 'healthcare-library',
  categorySlug: article.metadata?.categorySlug || article.metadata?.category_slug || null,
  slug: article.slug,
  title: article.title,
  excerpt: article.excerpt || '',
  quickAnswer: article.metadata?.quickAnswer || article.excerpt || '',
  overview: article.metadata?.overview || article.excerpt || '',
  symptoms: article.metadata?.symptoms || [],
  causes: article.metadata?.causes || [],
  riskFactors: article.metadata?.riskFactors || [],
  prevention: article.metadata?.prevention || [],
  homeCare: article.metadata?.homeCare || [],
  doctorAdvice: article.metadata?.doctorAdvice || [],
  recovery: article.metadata?.recovery || [],
  emergencySigns: article.metadata?.emergencySigns || [],
  faqs: article.metadata?.faqs || [],
  relatedServiceSlugs: article.metadata?.relatedServiceSlugs || [],
  relatedArticleSlugs: article.metadata?.relatedArticleSlugs || [],
  cta: article.metadata?.cta || null,
  heroBadge: article.metadata?.heroBadge || 'Healthcare Library',
  seoTitle: article.seo_title || article.title,
  metaDescription: article.seo_description || article.excerpt || '',
  reviewedBy: article.metadata?.reviewedBy || 'InstantCare Healthcare Team',
  readingTime: article.metadata?.readingTime || 6,
  lastUpdated: article.updated_at || article.updatedAt || null,
});

export const contentService = {
  async getLibraryDataset(query = {}) {
    const [libraries, categories, articles, faqs] = await Promise.all([
      healthcareLibraryModel.list({ page: 1, limit: 100, sortBy: 'created_at', sortOrder: 'asc' }),
      categoriesModel.list({ page: 1, limit: 500, sortBy: 'sort_order', sortOrder: 'asc' }),
      articlesModel.list({ page: 1, limit: 500, search: query.search || '', sortBy: 'published_at', sortOrder: 'desc' }),
      faqsModel.list({ page: 1, limit: 500, sortBy: 'sort_order', sortOrder: 'asc' }),
    ]);

    return {
      libraries: libraries.items.map(normalizeLibrary),
      categories: categories.items,
      articles: articles.items.map(normalizeArticle),
      faqs: faqs.items,
    };
  },

  async search(query) {
    const [articles, services, faqs] = await Promise.all([
      articlesModel.list({ page: 1, limit: 12, search: query, sortBy: 'published_at', sortOrder: 'desc' }),
      resourceServices.services.list({ page: 1, limit: 8, search: query, sortBy: 'created_at', sortOrder: 'desc' }),
      faqsModel.list({ page: 1, limit: 8, search: query, sortBy: 'created_at', sortOrder: 'desc' }),
    ]);

    return {
      query,
      articles: articles.items.map(normalizeArticle),
      services: services.items,
      faqs: faqs.items,
    };
  },
};