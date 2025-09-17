import { useState, useRef, useEffect } from 'react';
import { Share2, Twitter, Facebook, Linkedin, MessageCircle, Mail, Copy, Check } from 'lucide-react';
import { shareContent, shareToPlatform, generateShareUrl } from '../utils/share';

const ShareButton = ({ type, slug, title, description = '', className = '', url }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef(null);

  const shareUrl = url || generateShareUrl(type, slug);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleShare = async (platform = null) => {
    try {
      let result;
      
      if (platform) {
        result = await shareToPlatform(platform, shareUrl, title, description);
      } else {
        result = await shareContent(type, title, shareUrl, description);
      }

      if (result.success) {
        if (result.method === 'clipboard') {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
        setIsOpen(false);
      } else {
        console.error('Share failed:', result.error);
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setIsOpen(false);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const shareOptions = [
    { name: 'Twitter', icon: Twitter, platform: 'twitter' },
    { name: 'Facebook', icon: Facebook, platform: 'facebook' },
    { name: 'LinkedIn', icon: Linkedin, platform: 'linkedin' },
    { name: 'WhatsApp', icon: MessageCircle, platform: 'whatsapp' },
    { name: 'Email', icon: Mail, platform: 'email' },
  ];

  return (
    <div className={`relative z-[9999999] ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 sm:gap-2 p-1 sm:p-2 text-gray-500 hover:text-primary-600 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700"
        title="Share"
      >
        <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
        <span className="hidden sm:inline text-xs sm:text-sm">Share</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-52 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow-2xl z-[9999999]">
          <div className="p-2">
            {/* Native share button */}
            <button
              onClick={() => handleShare()}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-md transition-colors border-b border-gray-100 dark:border-gray-600"
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>

            {/* Platform-specific share buttons */}
            {shareOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.platform}
                  onClick={() => handleShare(option.platform)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  {option.name}
                </button>
              );
            })}

            {/* Copy link button */}
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-gray-700 rounded-md transition-colors border-t border-gray-100 dark:border-gray-600"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Link
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareButton;
