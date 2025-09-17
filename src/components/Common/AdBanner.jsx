
import { ExternalLink, Ship, Waves, MapPin, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdBanner = ({ 
  type = 'hero', 
  title, 
  subtitle, 
  ctaText, 
  image, 
  className = '',
  isDarkMode = false 
}) => {
  
  if (type === 'hero') {
    return (
      <Link
        to="/marine-products"
        className={`relative h-28 md:h-14 my-2 md:my-0 md:mb-4 rounded-xl overflow-hidden shadow-lg border transition-all duration-500 hover:shadow-xl transform hover:scale-[1.01] block group ${className}`}
        style={{
          background: isDarkMode 
            ? 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)'
            : 'linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #14b8a6 100%)'
        }}
      >
        
        {/* Subtle Geometric Pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '20px 20px'
          }}
        />
        
        {/* Floating Elements */}
        <div className="absolute top-2 right-3 opacity-20 group-hover:opacity-30 transition-opacity duration-300">
          <Ship className="h-4 w-4 text-white" />
        </div>
        <div className="absolute bottom-2 left-3 opacity-15 group-hover:opacity-25 transition-opacity duration-300">
          <Waves className="h-3 w-3 text-white" />
        </div>
        
        {/* Main Content */}
        <div className="relative h-full px-4 md:px-6">
          <div className="h-full flex items-center justify-between">
            {/* Left Content */}
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-2 mb-1">
                <Star className="h-3 w-3 text-yellow-300 fill-current" />
                <h2 className="text-sm md:text-base font-bold text-white leading-tight">
                  {title || 'Premium Marine Equipment'}
                </h2>
              </div>
              
              <div className="flex items-center gap-1 text-xs text-white/90">
                <MapPin className="h-3 w-3" />
                <span>{subtitle || 'Professional grade • Fast shipping • Expert support'}</span>
              </div>
            </div>
            
            {/* Call to Action Button */}
            <div className="flex-shrink-0">
              <div className="inline-flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 bg-white text-teal-700 hover:text-teal-800 hover:bg-gray-50">
                <span>{ctaText || 'Explore'}</span>
                <ExternalLink className="h-3 w-3" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Subtle Glow Effects */}
        <div className="absolute top-0 left-1/4 w-16 h-16 bg-white/5 rounded-full blur-xl"></div>
        <div className="absolute bottom-0 right-1/4 w-12 h-12 bg-white/3 rounded-full blur-lg"></div>
      </Link>
    );
  }

  if (type === 'sidebar') {
    return (
      <div className={`relative h-16  rounded-lg overflow-hidden transition-all duration-500 hover:shadow-lg group ${className}`}
        style={{
          background: isDarkMode 
            ? 'linear-gradient(135deg, #374151 0%, #4b5563 100%)'
            : 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)'
        }}
      >
        
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-15">
          <Waves className="absolute top-2 right-2 h-4 w-4 text-white" />
          <Ship className="absolute bottom-2 left-2 h-3 w-3 text-white" />
        </div>
        
        <Link
          to="/marine-products"
          className="block h-full"
        >
          <div className="h-full p-3 text-white flex flex-col justify-center text-center">
            <h3 className="font-bold text-sm mb-1">
              {title || 'Marine Store'}
            </h3>
            {subtitle && (
              <p className="text-xs opacity-90 mb-2 leading-tight">
                {subtitle}
              </p>
            )}
            <div className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-300 hover:scale-105 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30">
              <span>{ctaText || 'Browse'}</span>
              <ExternalLink className="h-3 w-3" />
            </div>
          </div>
        </Link>
      </div>
    );
  }

  return null;
};

export default AdBanner;