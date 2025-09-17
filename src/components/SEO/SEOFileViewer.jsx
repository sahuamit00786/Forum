import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const SEOFileViewer = () => {
  const location = useLocation();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Determine which SEO file is being requested
  const seoFile = location.pathname.includes('sitemap.xml') ? 'sitemap.xml' : 'robots.txt';

  useEffect(() => {
    const fetchSEOContent = async () => {
      try {
        setLoading(true);
        
        // Fetch from backend API
        const apiUrl = `https://api-boatforum.allboatsupplies.com/${seoFile}`;
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch ${seoFile}: ${response.status}`);
        }

        const data = await response.text();
        setContent(data);
        
        // Set document title
        document.title = `${seoFile} - Boating Forum`;
        
      } catch (err) {
        console.error(`Error fetching ${seoFile}:`, err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSEOContent();
  }, [seoFile]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-green-400 text-lg">Loading {seoFile}...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-red-400 mb-2">Error Loading {seoFile}</h1>
          <p className="text-gray-400 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  // For sitemap.xml - render as raw XML (exactly like backend)
  if (seoFile === 'sitemap.xml') {
    return (
      <div style={{ 
        backgroundColor: 'white', 
        color: 'black', 
        fontFamily: 'monospace', 
        fontSize: '12px',
        padding: '20px',
        whiteSpace: 'pre-wrap',
        overflowX: 'auto'
      }}>
        {content}
      </div>
    );
  }

  // For robots.txt - render as raw text (exactly like backend)
  if (seoFile === 'robots.txt') {
    return (
      <div style={{ 
        backgroundColor: 'white', 
        color: 'black', 
        fontFamily: 'monospace', 
        fontSize: '12px',
        padding: '20px',
        whiteSpace: 'pre-wrap'
      }}>
        {content}
      </div>
    );
  }

  return null;
};

export default SEOFileViewer;
