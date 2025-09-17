import SEOHead from './SEOHead';

/**
 * ArticleSEO Component - For blog and article detail pages
 * 
 * This component provides enhanced SEO meta tags for article content including:
 * - Article-specific meta tags
 * - Structured data for articles
 * - Author information
 * - Publication dates
 * 
 * It automatically formats dates and handles missing data gracefully.
 */
const ArticleSEO = ({ 
  title, 
  description, 
  canonicalUrl, 
  image,
  author,
  publishedAt,
  updatedAt,
  keywords = [],
  category
}) => {
  // Format dates for meta tags
  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toISOString();
  };

  // Generate enhanced keywords including category
  const enhancedKeywords = [
    ...keywords,
    category,
    'boating',
    'marine',
    'fishing',
    'boats'
  ].filter(Boolean);

  // Generate enhanced description
  const enhancedDescription = description 
    ? `${description.substring(0, 155)}${description.length > 155 ? '...' : ''}`
    : `Read about ${title} on Boating Forum. Expert insights and tips for boaters.`;

  return (
    <SEOHead
      title={title}
      description={enhancedDescription}
      canonicalUrl={canonicalUrl}
      image={image}
      type="article"
      publishedTime={formatDate(publishedAt)}
      modifiedTime={formatDate(updatedAt)}
      author={author}
      keywords={enhancedKeywords}
    />
  );
};

export default ArticleSEO;
