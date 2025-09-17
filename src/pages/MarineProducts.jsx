import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Ship, 
  Search, 
  Filter, 
  Star, 
  ExternalLink,
  Heart,
  Anchor,
  Compass,
  Zap,
  Shield,
  Tag,
  Package,
  Battery,
  Clock
} from 'lucide-react';
import { marineProducts, categories, brands, priceRanges } from '../data/marineProducts';

const MarineProducts = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [selectedBrand, setSelectedBrand] = useState('all');

  // Helper function to get icon component
  const getIconComponent = (iconName) => {
    const iconMap = {
      Ship,
      Anchor,
      Shield,
      Zap,
      Compass
    };
    return iconMap[iconName] || Ship;
  };

  // Helper function to generate product URL
  const generateProductUrl = (productName) => {
    return `https://allboatsupplies.com/product/${productName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim()}`;
  };

  const filteredProducts = marineProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.categorySlug === selectedCategory;
    const matchesBrand = selectedBrand === 'all' || product.brand === selectedBrand;
    const matchesPrice = priceRange === 'all' ||
                        (priceRange === 'under-100' && product.price < 100) ||
                        (priceRange === '100-500' && product.price >= 100 && product.price < 500) ||
                        (priceRange === '500-1000' && product.price >= 500 && product.price < 1000) ||
                        (priceRange === '1000-2000' && product.price >= 1000 && product.price < 2000) ||
                        (priceRange === 'over-2000' && product.price >= 2000);
    return matchesSearch && matchesCategory && matchesBrand && matchesPrice;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0; // featured - keep original order
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-1 sm:px-4 lg:px-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4">Marine Products</h1>
        <p className="text-sm sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
          Discover the best marine equipment and accessories for your boating adventures. 
          From seascooters to antifouling systems, find everything you need.
        </p>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {categories.map((category) => {
          const Icon = getIconComponent(category.icon);
          return (
            <button
              key={category.slug}
              onClick={() => setSelectedCategory(category.slug)}
              className={`p-3 sm:p-4 rounded-lg border transition-colors ${
                selectedCategory === category.slug
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white dark:bg-dark-800 border-gray-200 dark:border-dark-700 hover:border-primary-300 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Icon className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-1 sm:mb-2" />
              <span className="text-xs sm:text-sm font-medium">{category.name}</span>
              <span className="text-xs opacity-75">({category.count})</span>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-dark-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-dark-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {/* Search */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
              />
            </div>
          </div>

          {/* Brand Filter */}
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-gray-500 hidden sm:block" />
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full bg-gray-50 dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            >
              <option value="all">All Brands</option>
              {brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500 hidden sm:block" />
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="w-full bg-gray-50 dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            >
              {priceRanges.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-gray-50 dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {sortedProducts.map((product) => (
          <Link 
            key={product.id} 
            to={generateProductUrl(product.name)}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white dark:bg-dark-800 rounded-lg overflow-hidden border border-gray-200 dark:border-dark-700 hover:shadow-lg transition-shadow group cursor-pointer"
          >
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {product.isSponsored && (
                <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                  Sponsored
                </div>
              )}
              {product.discount > 0 && (
                <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                  -{product.discount}%
                </div>
              )}
              {!product.inStock && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span className="text-white font-medium text-sm">Out of Stock</span>
                </div>
              )}
              
              {/* Quick Actions */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={(e) => e.preventDefault()}
                    className="p-2 bg-white dark:bg-dark-800 rounded-full shadow-md hover:bg-gray-50 dark:hover:bg-dark-700"
                  >
                    <Heart className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="p-3 sm:p-4">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">{product.brand}</span>
                <span className="px-2 py-1 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-full text-xs">
                  {product.category}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block">SKU: {product.sku}</span>
              </div>

              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 text-sm sm:text-base">
                {product.name}
              </h3>

              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-3 line-clamp-2">
                {product.description}
              </p>

              {/* Features */}
              <div className="flex flex-wrap gap-1 mb-3">
                {product.features.slice(0, 2).map((feature) => (
                  <span
                    key={feature}
                    className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded text-xs"
                  >
                    {feature}
                  </span>
                ))}
                {product.features.length > 2 && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                    +{product.features.length - 2} more
                  </span>
                )}
              </div>

              {/* Product Details */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  <span>{product.weight} lbs</span>
                </div>
                {product.depth && (
                  <div className="flex items-center gap-1">
                    <span className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs">
                      {product.depth}
                    </span>
                  </div>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 sm:h-4 sm:w-4 ${
                        i < Math.floor(product.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  {product.rating} ({product.reviews})
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                  ${product.price.toLocaleString()}
                </span>
                {product.originalPrice && (
                  <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-through">
                    ${product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>

              {/* View Product Button */}
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors">
                  <span className="text-sm font-medium">View Product</span>
                  <ExternalLink className="h-4 w-4" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {sortedProducts.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <Ship className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">No products found</h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Try adjusting your search or filters
          </p>
        </div>
      )}

      {/* Load More */}
      {sortedProducts.length > 0 && (
        <div className="text-center">
          <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-colors">
            Load More Products
          </button>
        </div>
      )}
    </div>
  );
};

export default MarineProducts;