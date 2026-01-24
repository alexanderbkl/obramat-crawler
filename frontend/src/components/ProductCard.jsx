import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { EyeIcon, CubeIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

function ProductCard({ product, index = 0 }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-2xl glass border border-white/10 hover:border-primary-500/50 transition-all duration-300"
    >
      {/* Image */}
      <div className="aspect-square overflow-hidden bg-neutral-900">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className={clsx(
            "w-full h-full items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900",
            product.image_url ? "hidden" : "flex"
          )}
        >
          <CubeIcon className="w-16 h-16 text-neutral-700" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-white line-clamp-2 group-hover:text-primary-400 transition-colors">
          {product.title}
        </h3>
        
        <div className="mt-3 flex items-center justify-between">
          <p className="text-lg font-bold text-primary-400">
            {formatPrice(product.price)}
          </p>
          {product.current_stock !== null && (
            <span className={clsx(
              'text-xs px-2 py-1 rounded-full font-medium',
              product.current_stock === 0 
                ? 'bg-red-500/20 text-red-400'
                : product.current_stock <= 10
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-emerald-500/20 text-emerald-400'
            )}>
              {product.current_stock} in stock
            </span>
          )}
        </div>

        {product.store_name && (
          <p className="mt-2 text-xs text-neutral-500 truncate">
            📍 {product.store_name}
          </p>
        )}
      </div>

      {/* Hover overlay */}
      <Link
        to={`/products/${product.id}`}
        className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      >
        <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors">
          <EyeIcon className="w-4 h-4" />
          View Details
        </span>
      </Link>
    </motion.div>
  );
}

export default ProductCard;
