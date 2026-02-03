import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FunnelIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { productsApi } from '../api';
import ProductCard from '../components/product/ProductCard';
import { CardSkeleton } from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import { debounce } from '../utils/helpers';

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  // Get filter values from URL
  const filters = {
    page: parseInt(searchParams.get('page') || '1'),
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc',
    isFeatured: searchParams.get('isFeatured') === 'true' ? true : undefined,
  };

  // Debounced search
  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        updateFilters({ search: value, page: '1' });
      }, 300),
    []
  );

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
    debouncedSearch(e.target.value);
  };

  const updateFilters = (newFilters) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  // Fetch products
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const { data } = await productsApi.getAll({
        ...filters,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
      });
      return data;
    },
    keepPreviousData: true,
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await productsApi.getCategories();
      return data.data;
    },
  });

  const products = data?.data || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1 };

  const hasActiveFilters =
    filters.category ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.search ||
    filters.isFeatured;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Products
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            {pagination.total || 0} products found
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 md:w-80">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchInput}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-colors',
              showFilters
                ? 'bg-primary-50 dark:bg-primary-500/10 border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
            )}
          >
            <FunnelIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-primary-500" />
            )}
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-8 p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => updateFilters({ category: e.target.value, page: '1' })}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Categories</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Min Price
              </label>
              <input
                type="number"
                placeholder="€0"
                value={filters.minPrice}
                onChange={(e) => updateFilters({ minPrice: e.target.value, page: '1' })}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Max Price
              </label>
              <input
                type="number"
                placeholder="€1000"
                value={filters.maxPrice}
                onChange={(e) => updateFilters({ maxPrice: e.target.value, page: '1' })}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Sort By
              </label>
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  updateFilters({ sortBy, sortOrder });
                }}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="createdAt-desc">Newest</option>
                <option value="createdAt-asc">Oldest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-4 flex justify-end">
              <Button variant="ghost" onClick={clearFilters}>
                <XMarkIcon className="h-4 w-4 mr-1" />
                Clear Filters
              </Button>
            </div>
          )}
        </motion.div>
      )}

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            No products found
          </p>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters} className="mt-4">
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className={clsx(
            'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6',
            isFetching && 'opacity-50'
          )}>
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <Button
                variant="outline"
                disabled={pagination.page === 1}
                onClick={() => updateFilters({ page: String(pagination.page - 1) })}
              >
                Previous
              </Button>
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => updateFilters({ page: String(pageNum) })}
                      className={clsx(
                        'w-10 h-10 rounded-lg font-medium transition-colors',
                        pagination.page === pageNum
                          ? 'bg-primary-500 text-white'
                          : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => updateFilters({ page: String(pagination.page + 1) })}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Products;
