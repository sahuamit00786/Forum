import SEOHead from './SEOHead';

/**
 * DefaultSEO Component - For static pages
 * 
 * This component provides default SEO meta tags for static pages like:
 * - Home page
 * - Category pages
 * - Static content pages
 * 
 * It uses the base SEOHead component with default values optimized for static content.
 */
const DefaultSEO = ({ 
  title, 
  description, 
  canonicalUrl, 
  image,
  keywords = []
}) => {
  return (
    <SEOHead
      title={title}
      description={description}
      canonicalUrl={canonicalUrl}
      image={image}
      type="website"
      keywords={keywords}
    />
  );
};

export default DefaultSEO;
