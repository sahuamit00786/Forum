// Share utility functions
export const shareContent = async (type, title, url, description = '') => {
  const shareData = {
    title: title,
    text: description,
    url: url
  };

  try {
    // Check if Web Share API is supported
    if (navigator.share && navigator.canShare(shareData)) {
      await navigator.share(shareData);
      return { success: true, method: 'native' };
    } else {
      // Fallback to copying URL to clipboard
      await navigator.clipboard.writeText(url);
      return { success: true, method: 'clipboard', message: 'URL copied to clipboard!' };
    }
  } catch (error) {
    console.error('Share failed:', error);
    
    // Fallback to copying URL to clipboard
    try {
      await navigator.clipboard.writeText(url);
      return { success: true, method: 'clipboard', message: 'URL copied to clipboard!' };
    } catch (clipboardError) {
      console.error('Clipboard copy failed:', clipboardError);
      return { success: false, error: 'Failed to share content' };
    }
  }
};

// Generate share URL for different content types
export const generateShareUrl = (type, slug) => {
  const baseUrl = window.location.origin;
  
  switch (type) {
    case 'thread':
      return `${baseUrl}/threads/${encodeURIComponent(slug)}`;
    case 'blog':
      return `${baseUrl}/blogs/${encodeURIComponent(slug)}`;
    case 'article':
      return `${baseUrl}/articles/${encodeURIComponent(slug)}`;
    default:
      return baseUrl;
  }
};

// Share to specific platforms
export const shareToPlatform = (platform, url, title, description = '') => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`
  };

  const shareUrl = shareUrls[platform];
  if (shareUrl) {
    window.open(shareUrl, '_blank', 'width=600,height=400');
    return { success: true, method: platform };
  }

  return { success: false, error: 'Platform not supported' };
};
