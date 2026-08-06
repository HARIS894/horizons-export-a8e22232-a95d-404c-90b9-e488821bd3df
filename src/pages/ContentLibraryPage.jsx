import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowRight, BookOpenCheck, Clock3, HeartPulse, Phone, ShieldCheck, Sparkles, Stethoscope } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAQSection from '@/components/FAQSection';
import { Button } from '@/components/ui/button';
import ServiceCard from '@/components/services/ServiceCard';
import { buildWhatsAppUrl, siteContact } from '@/config/siteConfig';
import { ArticleCTA, EmergencySignsCard, KnowledgeArticleCard, KnowledgeSectionCard, KnowledgeTableOfContents } from '@/components/library/KnowledgeLibraryComponents';
import { articlesByLibrary, getArticleByRoute, getArticleRoute, getLibraryRoute, libraryBySlug, resolveArticleReference } from '@/data/knowledgeLibrary';
import { getBreadcrumbSchema, getFAQSchema } from '@/utils/seoUtils';
import { serviceCatalogBySlug } from '@/data/serviceCatalog';

const overviewFaqs = {
  default: [
    { question: 'How should families use this library?', answer: 'Use it to understand symptoms, red flags, home-care expectations and when to seek professional support before booking care.' },
    { question: 'Are these pages medically exhaustive?', answer: 'No. They are practical guidance pages designed to help families prepare better, not replace clinician advice.' },
    { question: 'Can we move from an article directly to a service?', answer: 'Yes. Every article links into related services, consultation actions and emergency support.' },
  ],
};

const libraryIcons = {
  'healthcare-library': BookOpenCheck,
  'disease-library': HeartPulse,
  'treatment-library': Stethoscope,
  'elder-care-library': ShieldCheck,
  'nri-care-library': Sparkles,
  'final-journey-library': AlertTriangle,
};

const ContentLibraryPage = () => {
  const { articleSlug } = useParams();
  const location = useLocation();
  const currentLibrarySlug = location.pathname.split('/').filter(Boolean)[0] || 'healthcare-library';
  const library = libraryBySlug[currentLibrarySlug] || libraryBySlug['healthcare-library'];
  const article = articleSlug ? getArticleByRoute(currentLibrarySlug, articleSlug) : null;
  const libraryArticles = articlesByLibrary[library.slug] || [];
  const readingTime = article ? `${article.readingTime || Math.max(6, Math.ceil((article.overview || '').split(' ').length / 70))} min read` : `${Math.max(4, Math.ceil((library.heroText || '').split(' ').length / 80))} min read`;
  const lastUpdated = article?.lastUpdated || '2026-08-04';
  const relatedServiceCards = (article ? article.relatedServiceSlugs : library.serviceSlugs || []).map((slug) => serviceCatalogBySlug[slug]).filter(Boolean).slice(0, 3);
  const relatedArticles = article ? article.relatedArticleSlugs.map(resolveArticleReference).filter(Boolean) : libraryArticles.slice(0, 4);
  const featuredArticles = library.featuredArticleSlugs.map((slug) => getArticleByRoute(library.slug, slug)).filter(Boolean);

  const articleSections = article ? [
    { id: 'overview', title: 'Overview', eyebrow: 'Overview', value: article.overview, variant: 'paragraph' },
    { id: 'symptoms', title: 'Symptoms', eyebrow: 'Symptoms', value: article.symptoms },
    { id: 'causes', title: 'Causes', eyebrow: 'Causes', value: article.causes },
    { id: 'risk-factors', title: 'Risk Factors', eyebrow: 'Risk Factors', value: article.riskFactors },
    { id: 'prevention', title: 'Prevention', eyebrow: 'Prevention', value: article.prevention },
    { id: 'home-care', title: 'Home Care', eyebrow: 'Home Care', value: article.homeCare },
    { id: 'doctor-advice', title: 'Doctor Advice', eyebrow: 'Doctor Advice', value: article.doctorAdvice },
    { id: 'recovery', title: 'Recovery', eyebrow: 'Recovery', value: article.recovery },
    { id: 'emergency-signs', title: 'Emergency Signs', eyebrow: 'Emergency Signs', value: article.emergencySigns },
    { id: 'faqs', title: 'FAQs', eyebrow: 'FAQs', value: article.faqs },
    { id: 'related-services', title: 'Related Services', eyebrow: 'Related Services', value: article.relatedServiceSlugs },
    { id: 'related-articles', title: 'Related Articles', eyebrow: 'Related Articles', value: article.relatedArticleSlugs },
  ] : [];

  const articleSchema = useMemo(() => {
    if (!article) return null;
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Article',
          headline: article.title,
          description: article.metaDescription,
          dateModified: article.lastUpdated,
          author: { '@type': 'Organization', name: article.reviewedBy },
          publisher: { '@type': 'Organization', name: 'InstantCare', url: siteContact.primaryDomain },
          mainEntityOfPage: `${siteContact.primaryDomain}${getArticleRoute(article.librarySlug, article.slug)}`,
        },
        getFAQSchema(article.faqs),
        getBreadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Healthcare Library', path: '/healthcare-library' },
          { name: library.title, path: getLibraryRoute(library.slug) },
          { name: article.title, path: getArticleRoute(article.librarySlug, article.slug) },
        ]),
      ],
    };
  }, [article, library]);

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>{article ? article.seoTitle : library.seoTitle}</title>
        <meta name="description" content={article ? article.metaDescription : library.seoDescription} />
        <meta name="keywords" content="healthcare article, home healthcare, family care, medical support, healthcare library, InstantCare" />
        <link rel="canonical" href={`${siteContact.primaryDomain}${article ? getArticleRoute(article.librarySlug, article.slug) : getLibraryRoute(library.slug)}`} />
        {articleSchema ? <script type="application/ld+json">{JSON.stringify(articleSchema)}</script> : null}
      </Helmet>

      <Navbar />

      <main className="pt-24 pb-20 sm:pt-28 lg:pt-32">
        <section className="px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-7xl rounded-[2rem] border border-purple-100 bg-[linear-gradient(135deg,_rgba(124,58,237,0.08)_0%,_rgba(255,255,255,1)_100%)] p-8 shadow-[0_25px_80px_rgba(15,23,42,0.07)] sm:p-10 lg:p-14">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#7C3AED]/20 bg-white/80 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-[#7C3AED] shadow-sm backdrop-blur">
                <Sparkles className="h-4 w-4" />
                {article ? article.heroBadge : library.title}
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                <span className="rounded-full bg-white/80 px-3 py-2 shadow-sm">Last Updated: {lastUpdated}</span>
                <span className="rounded-full bg-white/80 px-3 py-2 shadow-sm">Reading Time: {readingTime}</span>
                <span className="rounded-full bg-white/80 px-3 py-2 shadow-sm">Reviewed by {article?.reviewedBy || 'InstantCare Healthcare Team'}</span>
              </div>
            </div>

            <div className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
              <div>
                <h1 className="text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                  {article ? article.title : library.heroTitle}
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
                  {article ? article.excerpt : library.heroText}
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link to="/book">
                    <Button className="rounded-full bg-[#7C3AED] px-7 py-5 text-base font-semibold text-white shadow-[0_10px_25px_rgba(124,58,237,0.25)] hover:bg-[#6D28D9]">
                      {article ? 'Book Consultation' : 'Book Care Support'}
                    </Button>
                  </Link>
                  <a href={buildWhatsAppUrl(`Hello InstantCare, I would like help with ${article ? article.title : library.title}.`)} target="_blank" rel="noreferrer">
                    <Button variant="outline" className="rounded-full border-[#7C3AED]/20 bg-white px-7 py-5 text-base font-semibold text-[#7C3AED] hover:bg-purple-50">
                      <Phone className="mr-2 h-4 w-4" /> WhatsApp Enquiry
                    </Button>
                  </a>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-white/80 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] text-white">
                    {React.createElement(libraryIcons[library.slug] || BookOpenCheck, { className: 'h-6 w-6' })}
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#7C3AED]">Quick Answer</p>
                    <h2 className="text-xl font-bold text-gray-900">{article ? 'AEO Snapshot' : 'Library Snapshot'}</h2>
                  </div>
                </div>
                <p className="mt-5 text-sm leading-7 text-gray-600">{article ? article.quickAnswer : library.focusAreas.join(' ')}</p>
              </div>
            </div>
          </div>
        </section>

        {article ? (
          <>
            <section className="px-4 py-4 sm:px-6 lg:px-8">
              <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.75fr_1.25fr]">
                <KnowledgeTableOfContents items={articleSections} />
                <div className="space-y-6">
                  {articleSections.slice(0, 8).map((section) => (
                    section.id === 'overview' ? (
                      <KnowledgeSectionCard key={section.id} id={section.id} eyebrow={section.eyebrow} title={section.title} items={section.value} variant="paragraph" />
                    ) : (
                      <KnowledgeSectionCard key={section.id} id={section.id} eyebrow={section.eyebrow} title={section.title} items={section.value} />
                    )
                  ))}
                  <EmergencySignsCard items={article.emergencySigns} />
                </div>
              </div>
            </section>

            <section className="px-4 py-16 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-7xl rounded-[1.75rem] border border-gray-100 bg-slate-50 p-8 shadow-[0_16px_40px_rgba(15,23,42,0.05)] sm:p-10">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#7C3AED]">Related Services</p>
                <h2 className="mt-3 text-2xl font-bold text-gray-900">Services that connect directly to this care topic</h2>
                <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {relatedServiceCards.map((service) => (
                    <ServiceCard key={service.slug} service={service} icon={HeartPulse} variant="compact" />
                  ))}
                </div>
              </div>
            </section>

            <section className="px-4 py-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-7xl">
                <FAQSection items={article.faqs} title={`Frequently Asked Questions about ${article.title}`} description="Clear answers for families comparing home healthcare support options." />
              </div>
            </section>

            <section className="px-4 py-16 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-7xl">
                <ArticleCTA cta={article.cta} onWhatsappHref={buildWhatsAppUrl(`Hello InstantCare, I need help after reading ${article.title}.`)} />
              </div>
            </section>

            <section className="px-4 py-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-7xl rounded-[1.75rem] border border-gray-100 bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.05)] sm:p-10">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#7C3AED]">Related Articles</p>
                    <h2 className="mt-3 text-2xl font-bold text-gray-900">Continue exploring the knowledge library</h2>
                  </div>
                  <Link to={getLibraryRoute(library.slug)} className="text-sm font-semibold text-[#7C3AED]">Back to {library.title}</Link>
                </div>
                <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {relatedArticles.map((relatedArticle) => (
                    <KnowledgeArticleCard key={`${relatedArticle.librarySlug}/${relatedArticle.slug}`} article={relatedArticle} to={getArticleRoute(relatedArticle.librarySlug, relatedArticle.slug)} />
                  ))}
                </div>
              </div>
            </section>
          </>
        ) : (
          <>
            <section className="px-4 py-4 sm:px-6 lg:px-8">
              <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                <KnowledgeSectionCard id="focus-areas" eyebrow="Focus Areas" title="What this library helps families understand" items={library.focusAreas} />
                <div className="rounded-[1.5rem] border border-gray-100 bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#7C3AED]">Featured Articles</p>
                  <h2 className="mt-3 text-2xl font-bold text-gray-900">Start with these key guides</h2>
                  <div className="mt-6 space-y-4">
                    {featuredArticles.map((featuredArticle) => (
                      <Link key={featuredArticle.slug} to={getArticleRoute(featuredArticle.librarySlug, featuredArticle.slug)} className="block rounded-2xl border border-purple-100 bg-purple-50/40 p-4 transition-colors hover:bg-purple-100/60">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-gray-900">{featuredArticle.title}</p>
                            <p className="mt-1 text-sm leading-7 text-gray-600">{featuredArticle.excerpt}</p>
                          </div>
                          <ArrowRight className="h-5 w-5 shrink-0 text-[#7C3AED]" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="px-4 py-16 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-7xl rounded-[1.75rem] border border-gray-100 bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.05)] sm:p-10">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#7C3AED]">Article Collection</p>
                    <h2 className="mt-3 text-2xl font-bold text-gray-900">Explore articles in {library.title}</h2>
                  </div>
                  <span className="rounded-full bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">{libraryArticles.length} articles</span>
                </div>
                <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {libraryArticles.map((libraryArticle) => (
                    <KnowledgeArticleCard key={libraryArticle.slug} article={libraryArticle} to={getArticleRoute(libraryArticle.librarySlug, libraryArticle.slug)} />
                  ))}
                </div>
              </div>
            </section>

            <section className="px-4 py-4 sm:px-6 lg:px-8">
              <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
                <div className="rounded-[1.5rem] border border-gray-100 bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#7C3AED]">Related Services</p>
                  <h2 className="mt-3 text-2xl font-bold text-gray-900">Care services linked to this library</h2>
                  <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                    {relatedServiceCards.map((service) => (
                      <ServiceCard key={service.slug} service={service} icon={HeartPulse} variant="compact" />
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-gray-100 bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#7C3AED]">FAQ</p>
                  <h2 className="mt-3 text-2xl font-bold text-gray-900">Common questions families ask before reading deeper</h2>
                  <div className="mt-6">
                    <FAQSection items={overviewFaqs.default} title={`${library.title} FAQs`} description="Practical answers for families comparing articles, services and next steps." showSearch={false} className="border-0 p-0 shadow-none" />
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-[1.75rem] border border-gray-100 bg-slate-50 p-8 shadow-[0_16px_40px_rgba(15,23,42,0.05)] sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#7C3AED]">Related Reading</p>
            <h2 className="mt-3 text-2xl font-bold text-gray-900">Explore more trusted library pages</h2>
            <div className="mt-6 flex flex-wrap gap-3">
              {Object.values(libraryBySlug).filter((item) => item.slug !== library.slug).map((item) => (
                <Link key={item.slug} to={getLibraryRoute(item.slug)} className="rounded-full border border-purple-100 bg-white px-4 py-2 text-sm font-semibold text-[#7C3AED] shadow-sm transition-colors hover:bg-purple-50">
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-[2rem] bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] p-8 text-white shadow-[0_20px_70px_rgba(124,58,237,0.24)] sm:p-10 lg:p-12">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-purple-100">Emergency Support</p>
                <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Need urgent or immediate care help?</h2>
                <p className="mt-4 max-w-2xl text-lg text-purple-50">Our team can help you understand the next step for medical support, transport and home-based care options.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link to="/book">
                  <Button className="rounded-full bg-white px-7 py-5 text-base font-semibold text-[#7C3AED] hover:bg-slate-100">
                    Book Now
                  </Button>
                </Link>
                <a href={buildWhatsAppUrl(`Hello InstantCare, I need urgent help after reading ${article ? article.title : library.title}.`)} target="_blank" rel="noreferrer">
                  <Button variant="outline" className="rounded-full border-white/40 bg-transparent px-7 py-5 text-base font-semibold text-white hover:bg-white/10">
                    <Phone className="mr-2 h-4 w-4" /> WhatsApp Us
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-[1.5rem] border border-gray-100 bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
            <div className="flex items-start gap-3 rounded-2xl bg-amber-50 p-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-700">Medical Disclaimer</p>
                <p className="mt-2 text-sm leading-7 text-gray-700">The information shared here is for educational purposes and general awareness only. It should not replace a clinician’s advice, diagnosis or treatment plan. For urgent medical concerns, seek immediate professional care.</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <span className="rounded-full bg-slate-50 px-3 py-2">Last Updated: {lastUpdated}</span>
              <span className="rounded-full bg-slate-50 px-3 py-2">Reviewed by {article?.reviewedBy || 'InstantCare Healthcare Team'}</span>
              <span className="rounded-full bg-slate-50 px-3 py-2">Reading Time: {readingTime}</span>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ContentLibraryPage;
