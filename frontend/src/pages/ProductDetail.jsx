import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeftIcon, 
  DocumentIcon, 
  MapPinIcon,
  CubeIcon,
  ArrowTopRightOnSquareIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { format } from 'date-fns';
import { getProduct, getProductPriceHistory, getProductStockHistory } from '../api';
import ChartContainer from '../components/ChartContainer';
import { PageLoader } from '../components/LoadingSpinner';
import clsx from 'clsx';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-lg p-3 border border-white/20">
        <p className="text-sm font-medium text-white">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm text-neutral-300">
            {entry.name}: <span className="text-primary-400 font-medium">
              {entry.name === 'Price' ? `€${entry.value}` : entry.value}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function ProductDetail() {
  const { id } = useParams();
  const [currentImage, setCurrentImage] = useState(0);
  const [historyDays, setHistoryDays] = useState(90);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProduct(id),
  });

  const { data: priceHistory, isLoading: loadingPrice } = useQuery({
    queryKey: ['product-price-history', id, historyDays],
    queryFn: () => getProductPriceHistory(id, historyDays),
  });

  const { data: stockHistory, isLoading: loadingStock } = useQuery({
    queryKey: ['product-stock-history', id, historyDays],
    queryFn: () => getProductStockHistory(id, historyDays),
  });

  if (isLoading) return <PageLoader />;

  if (!product) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-white">Product not found</h2>
        <Link to="/products" className="mt-4 inline-flex items-center gap-2 text-primary-400 hover:text-primary-300">
          <ArrowLeftIcon className="w-4 h-4" />
          Back to products
        </Link>
      </div>
    );
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const formattedPriceHistory = priceHistory?.map(item => ({
    ...item,
    date: format(new Date(item.recorded_at), 'MMM dd'),
    Price: parseFloat(item.price)
  })) || [];

  const formattedStockHistory = stockHistory?.map(item => ({
    ...item,
    date: format(new Date(item.recorded_at), 'MMM dd HH:mm'),
    Stock: item.stock
  })) || [];

  const images = product.images || [];
  const hasImages = images.length > 0;

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <Link 
        to="/products" 
        className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to products
      </Link>

      {/* Product Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative aspect-square rounded-2xl overflow-hidden glass border border-white/10"
          >
            {hasImages ? (
              <>
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImage}
                    src={images[currentImage]?.url}
                    alt={product.title}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full object-contain bg-neutral-900"
                  />
                </AnimatePresence>
                
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                    >
                      <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                    >
                      <ChevronRightIcon className="w-6 h-6" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImage(index)}
                          className={clsx(
                            'w-2 h-2 rounded-full transition-colors',
                            index === currentImage ? 'bg-primary-500' : 'bg-white/30 hover:bg-white/50'
                          )}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-neutral-900">
                <CubeIcon className="w-24 h-24 text-neutral-700" />
              </div>
            )}
          </motion.div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setCurrentImage(index)}
                  className={clsx(
                    'flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors',
                    index === currentImage ? 'border-primary-500' : 'border-transparent hover:border-white/30'
                  )}
                >
                  <img src={image.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-2xl font-bold text-white">{product.title}</h1>
            
            <div className="mt-4 flex items-baseline gap-4">
              <span className="text-4xl font-bold text-primary-400">
                {formatPrice(product.price)}
              </span>
              <span className="text-neutral-500">{product.currency}</span>
            </div>
          </motion.div>

          {/* Availability */}
          {product.availability?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-xl border border-white/10 p-4"
            >
              <h3 className="text-sm font-medium text-neutral-400 mb-3 flex items-center gap-2">
                <MapPinIcon className="w-4 h-4" />
                Store Availability
              </h3>
              <div className="space-y-2">
                {product.availability.map((avail) => (
                  <div key={avail.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{avail.store_name}</p>
                      <p className="text-sm text-neutral-500">{avail.store_city}</p>
                    </div>
                    <span className={clsx(
                      'px-3 py-1 rounded-full text-sm font-medium',
                      avail.stock === 0 
                        ? 'bg-red-500/20 text-red-400'
                        : avail.stock <= 10
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-emerald-500/20 text-emerald-400'
                    )}>
                      {avail.stock} in stock
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-xl border border-white/10 p-4"
          >
            <h3 className="text-sm font-medium text-neutral-400 mb-3">Description</h3>
            <p className="text-neutral-300 text-sm leading-relaxed">
              {product.description || 'No description available'}
            </p>
          </motion.div>

          {/* Documents */}
          {product.documents?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-xl border border-white/10 p-4"
            >
              <h3 className="text-sm font-medium text-neutral-400 mb-3 flex items-center gap-2">
                <DocumentIcon className="w-4 h-4" />
                Documents
              </h3>
              <div className="space-y-2">
                {product.documents.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <DocumentIcon className="w-5 h-5 text-primary-400" />
                    <span className="text-sm text-white truncate flex-1">Technical Document</span>
                    <ArrowTopRightOnSquareIcon className="w-4 h-4 text-neutral-500" />
                  </a>
                ))}
              </div>
            </motion.div>
          )}

          {/* Source Link */}
          <a
            href={product.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500/10 border border-primary-500/30 text-primary-400 hover:bg-primary-500/20 transition-colors"
          >
            View on Obramat
            <ArrowTopRightOnSquareIcon className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* History Charts */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Historical Data</h2>
          <select
            value={historyDays}
            onChange={(e) => setHistoryDays(Number(e.target.value))}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500/50"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last year</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Price History */}
          <ChartContainer
            title="Price History"
            subtitle={`${formattedPriceHistory.length} records`}
          >
            {loadingPrice ? (
              <div className="h-64 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : formattedPriceHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={formattedPriceHistory} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    axisLine={{ stroke: '#374151' }}
                  />
                  <YAxis 
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    axisLine={{ stroke: '#374151' }}
                    tickFormatter={(v) => `€${v}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="Price" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    fill="url(#priceGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-neutral-500">
                No price history available
              </div>
            )}
          </ChartContainer>

          {/* Stock History */}
          <ChartContainer
            title="Stock History"
            subtitle={`${formattedStockHistory.length} records`}
          >
            {loadingStock ? (
              <div className="h-64 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : formattedStockHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={formattedStockHistory} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <defs>
                    <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    axisLine={{ stroke: '#374151' }}
                  />
                  <YAxis 
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    axisLine={{ stroke: '#374151' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="stepAfter" 
                    dataKey="Stock" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fill="url(#stockGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-neutral-500">
                No stock history available
              </div>
            )}
          </ChartContainer>
        </div>
      </div>

      {/* Metadata */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-xl border border-white/10 p-4"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-neutral-500">Product ID</p>
            <p className="text-white font-mono">{product.id}</p>
          </div>
          <div>
            <p className="text-neutral-500">Created At</p>
            <p className="text-white">{format(new Date(product.created_at), 'PPp')}</p>
          </div>
          <div>
            <p className="text-neutral-500">Last Updated</p>
            <p className="text-white">{format(new Date(product.updated_at), 'PPp')}</p>
          </div>
          <div>
            <p className="text-neutral-500">Images</p>
            <p className="text-white">{images.length}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default ProductDetail;
