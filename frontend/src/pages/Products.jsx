import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Squares2X2Icon,
  ListBulletIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { getProducts } from '../api';
import ProductCard from '../components/ProductCard';
import { PageLoader, CardSkeleton } from '../components/LoadingSpinner';

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  const page = parseInt(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || '';
  const sortBy = searchParams.get('sortBy') || 'updated_at';
  const sortOrder = searchParams.get('sortOrder') || 'desc';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['products', { page, search, sortBy, sortOrder, minPrice, maxPrice }],
    queryFn: () => getProducts({ page, search, sortBy, sortOrder, minPrice, maxPrice, limit: 12 }),
    keepPreviousData: true,
  });

  const updateParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    if (!updates.page) newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const form = e.target;
    const searchValue = form.search.value;
    updateParams({ search: searchValue, page: '1' });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Products</h1>
          <p className="text-neutral-400 mt-1">
            {data?.pagination?.total || 0} products in database
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={clsx(
              'p-2 rounded-lg transition-colors',
              viewMode === 'grid' 
                ? 'bg-primary-500/20 text-primary-400' 
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            )}
          >
            <Squares2X2Icon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={clsx(
              'p-2 rounded-lg transition-colors',
              viewMode === 'list' 
                ? 'bg-primary-500/20 text-primary-400' 
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            )}
          >
            <ListBulletIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="glass rounded-2xl border border-white/10 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Search products..."
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
            </div>
          </form>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={clsx(
              'flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors',
              showFilters 
                ? 'border-primary-500/50 bg-primary-500/10 text-primary-400' 
                : 'border-white/10 text-neutral-400 hover:text-white hover:bg-white/5'
            )}
          >
            <FunnelIcon className="w-5 h-5" />
            Filters
          </button>
        </div>

        {/* Expanded Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Sort By */}
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => updateParams({ sortBy: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500/50"
                  >
                    <option value="updated_at">Last Updated</option>
                    <option value="created_at">Date Added</option>
                    <option value="price">Price</option>
                    <option value="title">Name</option>
                  </select>
                </div>

                {/* Sort Order */}
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">Order</label>
                  <select
                    value={sortOrder}
                    onChange={(e) => updateParams({ sortOrder: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500/50"
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>

                {/* Min Price */}
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">Min Price (€)</label>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => updateParams({ minPrice: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-primary-500/50"
                  />
                </div>

                {/* Max Price */}
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">Max Price (€)</label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => updateParams({ maxPrice: e.target.value })}
                    placeholder="999"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-primary-500/50"
                  />
                </div>
              </div>

              {/* Clear Filters */}
              {(search || minPrice || maxPrice || sortBy !== 'updated_at') && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setSearchParams({})}
                    className="text-sm text-neutral-400 hover:text-white transition-colors"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Products Grid/List */}
      {isLoading ? (
        <div className={clsx(
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
        )}>
          {[...Array(8)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          <div className={clsx(
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4',
            isFetching && 'opacity-60'
          )}>
            {data?.data?.map((product, index) => (
              viewMode === 'grid' ? (
                <ProductCard key={product.id} product={product} index={index} />
              ) : (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <a
                    href={`/products/${product.id}`}
                    className="flex items-center gap-4 p-4 glass rounded-xl border border-white/10 hover:border-primary-500/50 transition-all"
                  >
                    <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-neutral-800 overflow-hidden">
                      {product.image_url && (
                        <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium truncate">{product.title}</h3>
                      <p className="text-sm text-neutral-500">{product.store_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary-400">{formatPrice(product.price)}</p>
                      <p className="text-sm text-neutral-500">{product.current_stock} in stock</p>
                    </div>
                  </a>
                </motion.div>
              )
            ))}
          </div>

          {/* Empty State */}
          {data?.data?.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto rounded-full bg-neutral-800 flex items-center justify-center mb-4">
                <MagnifyingGlassIcon className="w-8 h-8 text-neutral-600" />
              </div>
              <h3 className="text-lg font-medium text-white">No products found</h3>
              <p className="text-neutral-500 mt-2">Try adjusting your search or filters</p>
            </div>
          )}

          {/* Pagination */}
          {data?.pagination && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-white/10">
              <p className="text-sm text-neutral-500">
                Showing {((page - 1) * 12) + 1} to {Math.min(page * 12, data.pagination.total)} of {data.pagination.total} products
              </p>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateParams({ page: String(page - 1) })}
                  disabled={page <= 1}
                  className="p-2 rounded-lg border border-white/10 text-neutral-400 hover:text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, data.pagination.totalPages))].map((_, i) => {
                    let pageNum;
                    if (data.pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= data.pagination.totalPages - 2) {
                      pageNum = data.pagination.totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => updateParams({ page: String(pageNum) })}
                        className={clsx(
                          'w-10 h-10 rounded-lg text-sm font-medium transition-colors',
                          pageNum === page
                            ? 'bg-primary-500 text-white'
                            : 'text-neutral-400 hover:text-white hover:bg-white/5'
                        )}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => updateParams({ page: String(page + 1) })}
                  disabled={page >= data.pagination.totalPages}
                  className="p-2 rounded-lg border border-white/10 text-neutral-400 hover:text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Products;
