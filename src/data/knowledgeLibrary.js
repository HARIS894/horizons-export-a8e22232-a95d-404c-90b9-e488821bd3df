import knowledgeLibraryData from '@/data/knowledgeLibraryData.json';

const libraries = knowledgeLibraryData.libraries;
const articles = knowledgeLibraryData.articles;

const libraryBySlug = Object.fromEntries(libraries.map((library) => [library.slug, library]));
const articleByKey = Object.fromEntries(articles.map((article) => [`${article.librarySlug}/${article.slug}`, article]));

const articlesByLibrary = libraries.reduce((accumulator, library) => {
  accumulator[library.slug] = articles.filter((article) => article.librarySlug === library.slug);
  return accumulator;
}, {});

const getLibraryRoute = (librarySlug) => `/${librarySlug}`;
const getArticleRoute = (librarySlug, articleSlug) => `/${librarySlug}/${articleSlug}`;
const getArticleByRoute = (librarySlug, articleSlug) => articleByKey[`${librarySlug}/${articleSlug}`] || null;

const resolveArticleReference = (reference) => {
  if (!reference || typeof reference !== 'string') return null;
  const [librarySlug, articleSlug] = reference.split('/');
  return getArticleByRoute(librarySlug, articleSlug);
};

export {
  articles,
  articlesByLibrary,
  getArticleByRoute,
  getArticleRoute,
  getLibraryRoute,
  libraries,
  libraryBySlug,
  resolveArticleReference,
};