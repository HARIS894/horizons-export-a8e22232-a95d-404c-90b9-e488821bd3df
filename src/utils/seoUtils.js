// Task 5: SEO utility functions for meta tags and schema markup

export const generateMetaTags = ({ title, description, keywords, url, image, type = 'website' }) => {
  const siteName = 'InstantCare';
  const defaultImage = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
  const currentUrl = url || window.location.href;

  return {
    title: title ? `${title} | ${siteName}` : siteName,
    meta: [
      { name: 'description', content: description },
      { name: 'keywords', content: keywords },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:type', content: type },
      { property: 'og:url', content: currentUrl },
      { property: 'og:image', content: image || defaultImage },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image || defaultImage },
      { name: 'canonical', href: currentUrl }
    ]
  };
};

export const getOrganizationSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "InstantCare",
    "url": "https://www.instantcare.com",
    "logo": "https://horizons-cdn.hostinger.com/a8e22232-a95d-404c-90b9-e488821bd3df/0ade293812baad459ed0d6d3e5262b8d.jpg",
    "sameAs": [
      "https://www.facebook.com/instantcare",
      "https://www.twitter.com/instantcare",
      "https://www.instagram.com/instantcare",
      "https://www.linkedin.com/company/instantcare"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-12345-67890",
      "contactType": "customer service",
      "areaServed": "IN",
      "availableLanguage": ["en", "hi"]
    }
  };
};

export const getLocalBusinessSchema = (city, address) => {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": `InstantCare ${city}`,
    "image": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    "telephone": "+91-12345-67890",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": address || "Local Hub",
      "addressLocality": city,
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "20.5937",
      "longitude": "78.9629" 
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
      ],
      "opens": "00:00",
      "closes": "23:59"
    },
    "priceRange": "$$"
  };
};

export const getServiceSchema = (name, description, providerName = "InstantCare") => {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": name,
    "provider": {
      "@type": "Organization",
      "name": providerName
    },
    "description": description,
    "areaServed": {
      "@type": "Country",
      "name": "India"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Home Healthcare Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": name
          }
        }
      ]
    }
  };
};

export const getFAQSchema = (faqs) => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
};

export const getBreadcrumbSchema = (items) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `https://www.instantcare.com${item.path}`
    }))
  };
};

export const getAggregateRatingSchema = (ratingValue, reviewCount) => {
  return {
    "@context": "https://schema.org",
    "@type": "AggregateRating",
    "itemReviewed": {
      "@type": "Organization",
      "name": "InstantCare"
    },
    "ratingValue": ratingValue,
    "reviewCount": reviewCount,
    "bestRating": "5",
    "worstRating": "1"
  };
};