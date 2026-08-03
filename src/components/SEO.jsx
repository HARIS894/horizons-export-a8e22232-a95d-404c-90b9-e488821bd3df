// Task 1: Reusable SEO component
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { generateMetaTags } from '@/utils/seoUtils';

const SEO = ({ 
  title, 
  description, 
  keywords, 
  url, 
  image, 
  type,
  schemas = [] 
}) => {
  const metaTags = generateMetaTags({ title, description, keywords, url, image, type });

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{metaTags.title}</title>
      {metaTags.meta.map((tag, index) => {
        if (tag.name === 'canonical') {
          return <link key={index} rel="canonical" href={tag.href} />;
        }
        if (tag.name) {
          return <meta key={index} name={tag.name} content={tag.content} />;
        }
        if (tag.property) {
          return <meta key={index} property={tag.property} content={tag.content} />;
        }
        return null;
      })}

      {/* Structured Data / Schemas */}
      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;