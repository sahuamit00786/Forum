import { Link } from 'react-router-dom';
import { 
  Anchor, 
  Ship, 
  Wrench, 
  LifeBuoy, 
  Compass, 
  MapPin,
  Star,
  ExternalLink
} from 'lucide-react';

const BoatAdCard = ({ 
  type = 'gear',
  title,
  subtitle,
  description,
  price,
  originalPrice,
  discount,
  rating,
  image,
  ctaText = "Shop Now",
  ctaLink = "#",
  badge,
  className = ""
}) => {
  const getIcon = () => {
    switch (type) {
      case 'gear':
        return <Anchor className="h-5 w-5" />;
      case 'maintenance':
        return <Wrench className="h-5 w-5" />;
      case 'safety':
        return <LifeBuoy className="h-5 w-5" />;
      case 'navigation':
        return <Compass className="h-5 w-5" />;
      case 'boat':
        return <Ship className="h-5 w-5" />;
      default:
        return <Anchor className="h-5 w-5" />;
    }
  };

  const getGradient = () => {
    switch (type) {
      case 'gear':
        return 'from-blue-500 to-cyan-500';
      case 'maintenance':
        return 'from-orange-500 to-red-500';
      case 'safety':
        return 'from-green-500 to-emerald-500';
      case 'navigation':
        return 'from-purple-500 to-indigo-500';
      case 'boat':
        return 'from-teal-500 to-blue-600';
      default:
        return 'from-blue-500 to-cyan-500';
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md ${className}`}>
      {/* Header with gradient */}
      <div className={`bg-gradient-to-r ${getGradient()} p-4 text-white relative`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {getIcon()}
            <span className="font-semibold text-sm">{title}</span>
          </div>
          {badge && (
            <span className="bg-white/20 backdrop-blur-sm text-xs px-2 py-1 rounded-full font-medium">
              {badge}
            </span>
          )}
        </div>
        
        {subtitle && (
          <p className="text-white/90 text-xs">{subtitle}</p>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {image && (
          <div className="mb-3 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
            <img 
              src={image} 
              alt={title}
              className="w-full h-24 object-cover"
            />
          </div>
        )}

        {description && (
          <p className="text-gray-600 dark:text-gray-300 text-xs mb-3 line-clamp-2">
            {description}
          </p>
        )}

        {/* Price and Rating */}
        <div className="flex items-center justify-between mb-3">
          {price && (
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                ${price}
              </span>
              {originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  ${originalPrice}
                </span>
              )}
              {discount && (
                <span className="text-xs bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-1 rounded-full font-medium">
                  {discount}% OFF
                </span>
              )}
            </div>
          )}
          
          {rating && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-500 fill-current" />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {rating}
              </span>
            </div>
          )}
        </div>

        {/* CTA Button */}
        <Link
          to={ctaLink}
          className="w-full bg-lime-500 hover:bg-lime-600 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          {ctaText}
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
};

export default BoatAdCard;
