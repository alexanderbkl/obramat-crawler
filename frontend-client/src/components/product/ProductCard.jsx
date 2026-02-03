import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingCartIcon, CubeIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import { formatPrice, getStockStatus } from '../../utils/helpers';
import { useCartStore } from '../../store/cartStore';
import toast from 'react-hot-toast';

function ProductCard({ product, index = 0 }) {
  const addItem = useCartStore((state) => state.addItem);

  const stockStatus = getStockStatus(product.stock);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.stock === 0) {
      toast.error('Product is out of stock');
      return;
    }

    const result = await addItem(product, 1);
    if (result.success) {
      toast.success('Added to cart');
    } else {
      toast.error(result.error || 'Failed to add to cart');
    }
  };

  const renderStars = (rating) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          star <= Math.round(rating) ? (
            <StarIconSolid key={star} className="w-4 h-4 text-yellow-400" />
          ) : (
            <StarIcon key={star} className="w-4 h-4 text-neutral-300 dark:text-neutral-600" />
          )
        ))}
        <span className="ml-1 text-sm text-neutral-500">({rating})</span>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group relative overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-primary-500/50 transition-all duration-300 card-hover"
    >
      <Link to={`/products/${product.slug || product.id}`}>
        {/* Image */}
        <div className="aspect-square overflow-hidden bg-neutral-100 dark:bg-neutral-800">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            className={clsx(
              'w-full h-full items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900',
              product.imageUrl ? 'hidden' : 'flex'
            )}
          >
            <CubeIcon className="w-16 h-16 text-neutral-300 dark:text-neutral-700" />
          </div>
        </div>

        {/* Badge */}
        {product.comparePrice && product.comparePrice > product.price && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
            Sale
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          <h3 className="text-sm font-medium text-neutral-900 dark:text-white line-clamp-2 group-hover:text-primary-500 transition-colors min-h-[40px]">
            {product.name}
          </h3>

          {/* Rating */}
          {product.averageRating && (
            <div className="mt-2">
              {renderStars(product.averageRating)}
            </div>
          )}

          <div className="mt-3 flex items-center justify-between">
            <div className="flex flex-col">
              <p className="text-lg font-bold text-primary-500">
                {formatPrice(product.price)}
              </p>
              {product.comparePrice && product.comparePrice > product.price && (
                <p className="text-sm text-neutral-400 line-through">
                  {formatPrice(product.comparePrice)}
                </p>
              )}
            </div>
            <span className={clsx('text-xs font-medium', stockStatus.color)}>
              {stockStatus.text}
            </span>
          </div>

          {product.category && (
            <p className="mt-2 text-xs text-neutral-500 truncate">
              {product.category.name}
            </p>
          )}
        </div>
      </Link>

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={product.stock === 0}
        className={clsx(
          'absolute bottom-4 right-4 p-2 rounded-full transition-all duration-300',
          'bg-primary-500 text-white hover:bg-primary-600',
          'opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0',
          product.stock === 0 && 'opacity-50 cursor-not-allowed'
        )}
      >
        <ShoppingCartIcon className="w-5 h-5" />
      </button>
    </motion.div>
  );
}

export default ProductCard;
