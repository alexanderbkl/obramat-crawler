import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
  RadialBarChart, RadialBar, Legend
} from 'recharts';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowTrendingUpIcon, 
  BuildingStorefrontIcon,
  CubeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { 
  getAnalyticsOverview, 
  getPriceDistribution, 
  getStockLevels, 
  getTopProducts,
  getPriceTimeline,
  getStoreStock,
  getLowStockProducts
} from '../api';
import ChartContainer from '../components/ChartContainer';
import StatCard from '../components/StatCard';
import { PageLoader } from '../components/LoadingSpinner';
import clsx from 'clsx';

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#ec4899'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-lg p-3 border border-white/20">
        <p className="text-sm font-medium text-white">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm text-neutral-300">
            {entry.name}: <span className="text-primary-400 font-medium">
              {typeof entry.value === 'number' && entry.name.toLowerCase().includes('price') 
                ? `€${entry.value.toFixed(2)}` 
                : entry.value}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function Analytics() {
  const [timeRange, setTimeRange] = useState(30);

  const { data: overview, isLoading: loadingOverview } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: getAnalyticsOverview,
  });

  const { data: priceDistribution, isLoading: loadingPrice } = useQuery({
    queryKey: ['price-distribution'],
    queryFn: getPriceDistribution,
  });

  const { data: stockLevels, isLoading: loadingStock } = useQuery({
    queryKey: ['stock-levels'],
    queryFn: getStockLevels,
  });

  const { data: priceTimeline, isLoading: loadingTimeline } = useQuery({
    queryKey: ['price-timeline', timeRange],
    queryFn: () => getPriceTimeline(timeRange),
  });

  const { data: storeStock, isLoading: loadingStoreStock } = useQuery({
    queryKey: ['store-stock'],
    queryFn: getStoreStock,
  });

  const { data: topByPrice } = useQuery({
    queryKey: ['top-products-price'],
    queryFn: () => getTopProducts('price', 10),
  });

  const { data: topByStock } = useQuery({
    queryKey: ['top-products-stock'],
    queryFn: () => getTopProducts('stock', 10),
  });

  if (loadingOverview) return <PageLoader />;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formattedTimeline = priceTimeline?.map(item => ({
    ...item,
    date: format(new Date(item.date), 'MMM dd'),
    avgPrice: parseFloat(item.avgPrice),
    minPrice: parseFloat(item.minPrice),
    maxPrice: parseFloat(item.maxPrice),
  })) || [];

  // Calculate stock distribution for radial chart
  const stockRadialData = stockLevels?.map((item, index) => ({
    name: item.level,
    value: item.count,
    fill: COLORS[index % COLORS.length],
  })) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-neutral-400 mt-2">Detailed insights into your product data</p>
        </div>
        
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(Number(e.target.value))}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500/50"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Products"
          value={overview?.totalProducts || 0}
          icon={CubeIcon}
          color="primary"
        />
        <StatCard
          title="Total Stock Units"
          value={overview?.totalStock?.toLocaleString() || 0}
          icon={BuildingStorefrontIcon}
          color="green"
        />
        <StatCard
          title="Price Records"
          value={overview?.totalPriceRecords || 0}
          icon={ArrowTrendingUpIcon}
          color="blue"
        />
        <StatCard
          title="Avg Stock/Product"
          value={Math.round(overview?.avgStock || 0)}
          icon={ExclamationTriangleIcon}
          color="amber"
        />
      </div>

      {/* Price Timeline */}
      <ChartContainer
        title="Price Trends Over Time"
        subtitle="Average, minimum, and maximum prices"
      >
        {loadingTimeline ? (
          <div className="h-80 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : formattedTimeline.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={formattedTimeline} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <defs>
                <linearGradient id="avgGradient" x1="0" y1="0" x2="0" y2="1">
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
                dataKey="avgPrice" 
                name="Avg Price"
                stroke="#f59e0b" 
                strokeWidth={2}
                fill="url(#avgGradient)"
              />
              <Line 
                type="monotone" 
                dataKey="maxPrice" 
                name="Max Price"
                stroke="#ef4444" 
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="minPrice" 
                name="Min Price"
                stroke="#10b981" 
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-80 flex items-center justify-center text-neutral-500">
            No price timeline data available
          </div>
        )}
      </ChartContainer>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Distribution */}
        <ChartContainer
          title="Price Distribution"
          subtitle="Products grouped by price range"
        >
          {loadingPrice ? (
            <div className="h-72 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priceDistribution} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="range" 
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  axisLine={{ stroke: '#374151' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  axisLine={{ stroke: '#374151' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  name="Products"
                  fill="#f59e0b" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartContainer>

        {/* Stock Levels Pie */}
        <ChartContainer
          title="Stock Level Distribution"
          subtitle="Inventory health overview"
        >
          {loadingStock ? (
            <div className="h-72 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="flex">
              <ResponsiveContainer width="60%" height={300}>
                <PieChart>
                  <Pie
                    data={stockLevels}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="level"
                  >
                    {stockLevels?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 flex flex-col justify-center space-y-2">
                {stockLevels?.map((entry, index) => (
                  <div key={entry.level} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-neutral-300">{entry.level}</span>
                    <span className="text-sm font-medium text-white ml-auto">{entry.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ChartContainer>
      </div>

      {/* Store Stock */}
      {storeStock?.length > 0 && (
        <ChartContainer
          title="Stock by Store"
          subtitle="Inventory distribution across locations"
        >
          {loadingStoreStock ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {storeStock.map((store, index) => (
                <motion.div
                  key={`${store.store_name}-${store.store_city}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-white">{store.store_name}</h4>
                      <p className="text-sm text-neutral-500">{store.store_city}</p>
                    </div>
                    <BuildingStorefrontIcon className="w-5 h-5 text-primary-400" />
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-primary-400">{store.totalStock}</p>
                      <p className="text-xs text-neutral-500">Total Stock</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{store.productCount}</p>
                      <p className="text-xs text-neutral-500">Products</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-emerald-400">{Math.round(store.avgStock)}</p>
                      <p className="text-xs text-neutral-500">Avg Stock</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </ChartContainer>
      )}

      {/* Top Products Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top by Price */}
        <ChartContainer
          title="Top 10 by Price"
          subtitle="Most expensive products"
        >
          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {topByPrice?.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/products/${product.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <span className={clsx(
                    'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                    index === 0 ? 'bg-amber-500 text-black' :
                    index === 1 ? 'bg-neutral-400 text-black' :
                    index === 2 ? 'bg-amber-700 text-white' :
                    'bg-neutral-700 text-neutral-300'
                  )}>
                    {index + 1}
                  </span>
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-neutral-800 overflow-hidden">
                    {product.image_url && (
                      <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{product.title}</p>
                  </div>
                  <span className="text-lg font-bold text-primary-400">
                    {formatCurrency(product.price)}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </ChartContainer>

        {/* Top by Stock */}
        <ChartContainer
          title="Top 10 by Stock"
          subtitle="Products with highest inventory"
        >
          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {topByStock?.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/products/${product.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <span className={clsx(
                    'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                    index === 0 ? 'bg-emerald-500 text-black' :
                    index === 1 ? 'bg-emerald-400 text-black' :
                    index === 2 ? 'bg-emerald-600 text-white' :
                    'bg-neutral-700 text-neutral-300'
                  )}>
                    {index + 1}
                  </span>
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-neutral-800 overflow-hidden">
                    {product.image_url && (
                      <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{product.title}</p>
                  </div>
                  <span className="text-lg font-bold text-emerald-400">
                    {product.stock} units
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </ChartContainer>
      </div>
    </div>
  );
}

export default Analytics;
