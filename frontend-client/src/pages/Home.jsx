import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRightIcon,
  ShoppingBagIcon,
  TruckIcon,
  ShieldCheckIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';
import { productsApi } from '../api';
import ProductCard from '../components/product/ProductCard';
import { CardSkeleton, PageLoader } from '../components/common/LoadingSpinner';

const features = [
  {
    icon: TruckIcon,
    title: 'Free Shipping',
    description: 'On orders over €50',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Secure Payment',
    description: '100% secure checkout',
  },
  {
    icon: CreditCardIcon,
    title: 'Easy Returns',
    description: '30-day return policy',
  },
];

function Home() {
  const { data: featuredProducts, isLoading: featuredLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const { data } = await productsApi.getFeatured(8);
      return data.data;
    },
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await productsApi.getCategories();
      return data.data;
    },
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 to-primary-100 dark:from-neutral-900 dark:to-neutral-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-3xl">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-6xl font-bold text-neutral-900 dark:text-white"
            >
              Discover Quality Products at{' '}
              <span className="gradient-text">Great Prices</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-6 text-lg text-neutral-600 dark:text-neutral-400"
            >
              Shop our curated collection of premium products. From electronics to
              fashion, find everything you need in one place.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-8 flex flex-col sm:flex-row gap-4"
            >
              <Link
                to="/products"
                className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-xl transition-colors"
              >
                Shop Now
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/products?isFeatured=true"
                className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-xl transition-colors border border-neutral-200 dark:border-neutral-700"
              >
                View Featured
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Decorative element */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/3 h-full bg-gradient-to-l from-primary-500/10 to-transparent pointer-events-none" />
      </section>

      {/* Features */}
      <section className="border-b border-neutral-200 dark:border-neutral-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="flex-shrink-0 p-3 rounded-xl bg-primary-50 dark:bg-primary-500/10">
                  <feature.icon className="h-6 w-6 text-primary-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Shop by Category
            </h2>
            <Link
              to="/products"
              className="text-primary-500 hover:text-primary-600 font-medium text-sm flex items-center gap-1"
            >
              View All
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          {categoriesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-video rounded-2xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories?.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Link
                    to={`/products?category=${category.slug}`}
                    className="group relative block aspect-video rounded-2xl overflow-hidden"
                  >
                    {category.imageUrl ? (
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <h3 className="text-lg font-semibold text-white">
                        {category.name}
                      </h3>
                      <p className="text-sm text-white/80">
                        {category.productCount} products
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-neutral-50 dark:bg-neutral-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Featured Products
            </h2>
            <Link
              to="/products?isFeatured=true"
              className="text-primary-500 hover:text-primary-600 font-medium text-sm flex items-center gap-1"
            >
              View All
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          {featuredLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts?.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-3xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Subscribe to Our Newsletter
            </h2>
            <p className="mt-4 text-primary-100 max-w-2xl mx-auto">
              Get updates on new products, exclusive deals, and more. No spam, we promise!
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl bg-white/20 text-white placeholder:text-white/60 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button className="px-6 py-3 bg-white text-primary-600 font-medium rounded-xl hover:bg-primary-50 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
