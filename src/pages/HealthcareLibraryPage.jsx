import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, Activity, BookOpenCheck, FlaskConical, Globe2, HeartPulse, Home, Pill, ShieldCheck, Sparkles, Stethoscope } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { buildWhatsAppUrl, siteContact } from '@/config/siteConfig';
import { articles, getArticleRoute, getLibraryRoute, libraries, libraryBySlug } from '@/data/knowledgeLibrary';
import { KnowledgeArticleCard, KnowledgeCategoryCard } from '@/components/library/KnowledgeLibraryComponents';

const libraryIcons = {
  'healthcare-library': Home,
  'disease-library': HeartPulse,
  'treatment-library': Activity,
  'elder-care-library': ShieldCheck,
  'nri-care-library': Globe2,
  'final-journey-library': BookOpenCheck,
};

const HealthcareLibraryPage = () => {
  const [query, setQuery] = useState('');

  const rootLibrary = libraryBySlug['healthcare-library'];
  const filteredArticles = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return articles;
    return articles.filter((article) => `${article.title} ${article.excerpt} ${article.quickAnswer}`.toLowerCase().includes(needle));
  }, [query]);

  const featuredArticles = useMemo(() => articles.slice(0, 6), []);

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>{rootLibrary.seoTitle}</title>
        <meta name="description" content={rootLibrary.seoDescription} />
        <meta name="keywords" content="healthcare library, home healthcare articles, elder care guidance, NRI care planning, cancer care articles, palliative care support" />
        <link rel="canonical" href={`${siteContact.primaryDomain}/healthcare-library`} />
      </Helmet>

      <Navbar />

      <main className="pt-24 pb-20 sm:pt-28 lg:pt-32">
        <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(124,58,237,0.12),_transparent_35%),linear-gradient(135deg,_rgba(124,58,237,0.06)_0%,_rgba(255,255,255,1)_100%)] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#7C3AED]/20 bg-white/80 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-[#7C3AED] shadow-sm backdrop-blur">
                  <Sparkles className="h-4 w-4" />
                  Healthcare Library
                </div>
                <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                  {rootLibrary.heroTitle}
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-xl">
                  {rootLibrary.heroText}
                </p>
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-2xl font-bold text-gray-900">{libraries.length}</p>
                    <p className="mt-1 text-sm text-gray-600">Library categories</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-2xl font-bold text-gray-900">{articles.length}+</p>
                    <p className="mt-1 text-sm text-gray-600">Reusable article records</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-2xl font-bold text-gray-900">1</p>
                    <p className="mt-1 text-sm text-gray-600">Scalable article template</p>
                  </div>
                </div>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link to="/book">
                    <Button className="rounded-full bg-[#7C3AED] px-7 py-5 text-base font-semibold text-white shadow-[0_10px_25px_rgba(124,58,237,0.25)] hover:bg-[#6D28D9]">
                      Book Care Now
                    </Button>
                  </Link>
                  <a href={buildWhatsAppUrl('Hello InstantCare, I would like help choosing the right healthcare article or service.')} target="_blank" rel="noreferrer">
                    <Button variant="outline" className="rounded-full border-[#7C3AED]/20 bg-white px-7 py-5 text-base font-semibold text-[#7C3AED] hover:bg-purple-50">
                      View Services
                    </Button>
                  </a>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur">
                <div className="rounded-[1.5rem] bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] p-6 text-white">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-purple-100">Why Families Trust Us</p>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                      <p className="text-2xl font-bold">SEO</p>
                      <p className="mt-1 text-sm text-purple-50">Structured article metadata</p>
                    </div>
                    <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                      <p className="text-2xl font-bold">AEO</p>
                      <p className="mt-1 text-sm text-purple-50">Quick answers and FAQs</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#7C3AED]">Explore Our Categories</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Everything you need for trusted home healthcare guidance at scale.
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {libraries.map((library) => {
                const IconComponent = libraryIcons[library.slug] || Pill;
                return (
                  <KnowledgeCategoryCard key={library.slug} library={library} icon={IconComponent} to={getLibraryRoute(library.slug)} />
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-4 py-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)] sm:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#7C3AED]">Search Articles</p>
                <h2 className="mt-2 text-3xl font-bold text-gray-900">Reusable content designed for thousands of future healthcare articles</h2>
              </div>
              <div className="rounded-full bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">{filteredArticles.length} article results</div>
            </div>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search home nursing, stroke recovery, palliative care, NRI parent support..." className="mt-6 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none ring-0" />
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#7C3AED]">Featured Articles</p>
                <h2 className="mt-2 text-3xl font-bold text-gray-900">Start with the articles families need most often</h2>
              </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              {featuredArticles.map((article) => (
                <KnowledgeArticleCard key={`${article.librarySlug}/${article.slug}`} article={article} to={getArticleRoute(article.librarySlug, article.slug)} />
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 lg:grid-cols-3">
              {filteredArticles.map((article) => (
                <KnowledgeArticleCard key={`${article.librarySlug}/${article.slug}-search`} article={article} to={getArticleRoute(article.librarySlug, article.slug)} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HealthcareLibraryPage;
