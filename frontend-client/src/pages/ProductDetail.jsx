import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ChevronLeftIcon,
  ShoppingCartIcon,
  HeartIcon,
  ShareIcon,
  StarIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { productsApi } from '../api';
import { useCartStore } from '../store/cartStore';
import { formatPrice, getStockStatus } from '../utils/helpers';
import Button from '../components/common/Button';
import { PageLoader } from '../components/common/LoadingSpinner';

function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      // Try slug first, then ID
      try {
        const { data } = await productsApi.getBySlug(slug);
        return data.data;
      } catch (e) {
        const { data } = await productsApi.getById(slug);
        return data.data;
      }
    },
  });

  if (isLoading) {
    return <PageLoader />;
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Product not found
        </h2>
        <Link
          to="/products"
          className="mt-4 inline-flex items-center text-primary-500 hover:text-primary-600"
        >
          <ChevronLeftIcon className="h-5 w-5 mr-1" />
          Back to products
        </Link>
      </div>
    );
  }

  const stockStatus = getStockStatus(product.stock);
  const images = product.images || [];
  const variants = product.variants || [];

  // Group variants by name (e.g., Size, Color)
  const variantGroups = variants.reduce((acc, variant) => {
    if (!acc[variant.name]) {
      acc[variant.name] = [];
    }
    acc[variant.name].push(variant);
    return acc;
  }, {});

  const handleAddToCart = async () => {
    if (product.stock === 0) {
      toast.error('Product is out of stock');
      return;
    }

    setIsAddingToCart(true);
    const result = await addItem(product, quantity, selectedVariant?.id);
    setIsAddingToCart(false);

    if (result.success) {
      toast.success('Added to cart');
    } else {
      toast.error(result.error || 'Failed to add to cart');
    }
  };

  const handleBuyNow = async () => {
    if (product.stock === 0) {
      toast.error('Product is out of stock');
      return;
    }

    setIsAddingToCart(true);
    const result = await addItem(product, quantity, selectedVariant?.id);
    setIsAddingToCart(false);

    if (result.success) {
      navigate('/cart');
    } else {
      toast.error(result.error || 'Failed to add to cart');
    }
  };

  const renderStars = (rating) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) =>
          star <= Math.round(rating) ? (
            <StarIconSolid key={star} className="w-5 h-5 text-yellow-400" />
          ) : (
            <StarIcon
              key={star}
              className="w-5 h-5 text-neutral-300 dark:text-neutral-600"
            />
          )
        )}
        <span className="ml-2 text-neutral-600 dark:text-neutral-400">
          {rating} ({product.reviewCount} reviews)
        </span>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 mb-8">
        <Link to="/" className="hover:text-primary-500">
          Home
        </Link>
        <span>/</span>
        <Link to="/products" className="hover:text-primary-500">
          Products
        </Link>
        {product.category && (
          <>
            <span>/</span>
            <Link
              to={`/products?category=${product.category.slug}`}
              className="hover:text-primary-500"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-neutral-900 dark:text-white truncate max-w-xs">
          {product.name}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <motion.div
            key={selectedImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="aspect-square rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800"
          >
            {images.length > 0 ? (
              <img
                src={images[selectedImage].url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-400">
                No image available
              </div>
            )}
          </motion.div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImage(index)}
                  className={clsx(
                    'flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors',
                    selectedImage === index
                      ? 'border-primary-500'
                      : 'border-transparent hover:border-neutral-300 dark:hover:border-neutral-700'
                  )}
                >
                  <img
                    src={image.url}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            {product.name}
          </h1>

          {/* Rating */}
          {product.averageRating && (
            <div className="mt-4">{renderStars(product.averageRating)}</div>
          )}

          {/* Price */}
          <div className="mt-6 flex items-baseline gap-4">
            <span className="text-3xl font-bold text-primary-500">
              {formatPrice(product.price)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-lg text-neutral-400 line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="mt-4">
            <span className={clsx('text-sm font-medium', stockStatus.color)}>
              {stockStatus.text}
            </span>
          </div>

          {/* Description */}
          {product.description && (
            <p className="mt-6 text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Variants */}
          {Object.keys(variantGroups).length > 0 && (
            <div className="mt-6 space-y-4">
              {Object.entries(variantGroups).map(([name, options]) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    {name}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {options.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        disabled={variant.stock === 0}
                        className={clsx(
                          'px-4 py-2 rounded-lg border text-sm font-medium transition-colors',
                          selectedVariant?.id === variant.id
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400'
                            : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600',
                          variant.stock === 0 && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        {variant.value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quantity */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Quantity
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-lg border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"
              >
                -
              </button>
              <span className="text-lg font-medium w-12 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock}
                className="w-10 h-10 rounded-lg border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50"
              >
                +
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button
              fullWidth
              size="lg"
              onClick={handleAddToCart}
              isLoading={isAddingToCart}
              disabled={product.stock === 0}
            >
              <ShoppingCartIcon className="h-5 w-5 mr-2" />
              Add to Cart
            </Button>
            <Button
              variant="secondary"
              fullWidth
              size="lg"
              onClick={handleBuyNow}
              disabled={product.stock === 0}
            >
              Buy Now
            </Button>
          </div>

          {/* Features */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { icon: TruckIcon, label: 'Free Delivery' },
              { icon: ShieldCheckIcon, label: 'Warranty' },
              { icon: ArrowPathIcon, label: 'Easy Returns' },
            ].map((feature) => (
              <div
                key={feature.label}
                className="flex flex-col items-center p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800"
              >
                <feature.icon className="h-6 w-6 text-primary-500" />
                <span className="mt-2 text-xs text-center text-neutral-600 dark:text-neutral-400">
                  {feature.label}
                </span>
              </div>
            ))}
          </div>

          {/* SKU & Category */}
          <div className="mt-8 pt-8 border-t border-neutral-200 dark:border-neutral-800 space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
            {product.sku && (
              <p>
                <span className="font-medium">SKU:</span> {product.sku}
              </p>
            )}
            {product.category && (
              <p>
                <span className="font-medium">Category:</span>{' '}
                <Link
                  to={`/products?category=${product.category.slug}`}
                  className="text-primary-500 hover:text-primary-600"
                >
                  {product.category.name}
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      {product.reviews && product.reviews.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-8">
            Customer Reviews
          </h2>
          <div className="space-y-6">
            {product.reviews.map((review) => (
              <div
                key={review.id}
                className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center text-primary-600 dark:text-primary-400 font-medium">
                    {review.user.firstName[0]}
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">
                      {review.user.firstName} {review.user.lastName[0]}.
                    </p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIconSolid
                          key={star}
                          className={clsx(
                            'w-4 h-4',
                            star <= review.rating
                              ? 'text-yellow-400'
                              : 'text-neutral-300 dark:text-neutral-600'
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                {review.title && (
                  <h4 className="font-medium text-neutral-900 dark:text-white mb-2">
                    {review.title}
                  </h4>
                )}
                {review.comment && (
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default ProductDetail;
