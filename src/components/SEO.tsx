
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  ogImageAlt?: string;
  keywords?: string[];
  schemaData?: any;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  canonicalUrl,
  ogType = 'website',
  ogImage = 'https://lovable.dev/opengraph-image-p98pqg.png',
  ogImageAlt = 'MedSafe Project logo',
  keywords = [],
  schemaData,
}) => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://medsafeproject.org';
  const fullUrl = canonicalUrl ? canonicalUrl : `${baseUrl}${window.location.pathname}`;
  
  // Default schema data for website
  const defaultSchemaData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": title,
    "description": description,
    "url": fullUrl,
    "isPartOf": {
      "@type": "WebSite",
      "name": "MedSafe Project",
      "url": baseUrl
    }
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={ogImageAlt} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={ogImageAlt} />

      {/* Schema.org structured data */}
      <script type="application/ld+json">
        {JSON.stringify(schemaData || defaultSchemaData)}
      </script>
    </Helmet>
  );
};
