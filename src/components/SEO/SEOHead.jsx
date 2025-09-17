import { Helmet } from 'react-helmet-async';

/**
 * SEOHead Component - Handles dynamic meta tags for SEO
 * 
 * This component uses react-helmet-async to dynamically update:
 * - Page title
 * - Meta description
 * - Canonical URL
 * - Open Graph tags
 * - Twitter Card tags
 * 
 * The component automatically handles:
 * - Dynamic content based on props
 * - Fallback values for missing data
 * - Proper URL encoding for canonical links
 */
const SEOHead = ({ 
  title, 
  description, 
  canonicalUrl, 
  image, 
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  keywords = []
}) => {
  // Default values
  const defaultTitle = 'Boating Forum - Marine Community & Resources';
  const defaultDescription = 'Join the boating community. Discover marine products, expert articles, and connect with fellow boaters.';
  const defaultImage = 'https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=1200';
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://mydomain.com';
  
  // Use provided values or fallbacks
  const pageTitle = title ? `${title} | Boating Forum` : defaultTitle;
  const pageDescription = description || defaultDescription;
  const pageImage = image || defaultImage;
  const pageUrl = canonicalUrl ? `${siteUrl}${canonicalUrl}` : siteUrl;
  
  // Generate keywords string
  const keywordsString = keywords.length > 0 ? keywords.join(', ') : 'boating, marine, fishing, boats, boating forum, marine products';

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={keywordsString} />
      <link rel="canonical" href={pageUrl} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Boating Forum" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageImage} />
      
      {/* Article specific meta tags */}
      {type === 'article' && (
        <>
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {author && <meta property="article:author" content={author} />}
        </>
      )}
      
      {/* Additional SEO Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="Boating Forum" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      
      {/* Structured Data for Articles/Blogs */}
      {type === 'article' && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": title,
            "description": pageDescription,
            "image": pageImage,
            "url": pageUrl,
            "author": {
              "@type": "Person",
              "name": author || "Boating Forum"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Boating Forum",
              "logo": {
                "@type": "ImageObject",
                "url": `${siteUrl}/logo.png`
              }
            },
            "datePublished": publishedTime,
            "dateModified": modifiedTime || publishedTime
          })}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;
