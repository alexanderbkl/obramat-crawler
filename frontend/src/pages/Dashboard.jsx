import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  CubeIcon, 
  CurrencyEuroIcon, 
  ArchiveBoxIcon,
  BuildingStorefrontIcon,
  ArrowRightIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from 'recharts';
import { getAnalyticsOverview, getPriceDistribution, getStockLevels, getTopProducts, getLowStockProducts } from '../api';
import StatCard from '../components/StatCard';
import ChartContainer from '../components/ChartContainer';
import { PageLoader } from '../components/LoadingSpinner';
import { motion } from 'framer-motion';

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#ec4899'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-lg p-3 border border-white/20">
        <p className="text-sm font-medium text-white">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm text-neutral-300">
            {entry.name}: <span className="text-primary-400 font-medium">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function Dashboard() {
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

  const { data: topProducts, isLoading: loadingTop } = useQuery({
    queryKey: ['top-products'],
    queryFn: () => getTopProducts('price', 5),
  });

  const { data: lowStockProducts, isLoading: loadingLowStock } = useQuery({
    queryKey: ['low-stock'],
    queryFn: () => getLowStockProducts(15),
  });

  if (loadingOverview) return <PageLoader />;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-neutral-400 mt-2">Welcome back! Here's an overview of your product data.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Products"
          value={overview?.totalProducts || 0}
          subtitle="In database"
          icon={CubeIcon}
          color="primary"
        />
        <StatCard
          title="Average Price"
          value={formatCurrency(overview?.avgPrice || 0)}
          subtitle={`Range: ${formatCurrency(overview?.minPrice || 0)} - ${formatCurrency(overview?.maxPrice || 0)}`}
          icon={CurrencyEuroIcon}
          color="blue"
        />
        <StatCard
          title="Total Stock"
          value={overview?.totalStock?.toLocaleString() || 0}
          subtitle={`Avg: ${Math.round(overview?.avgStock || 0)} per product`}
          icon={ArchiveBoxIcon}
          color="green"
        />
        <StatCard
          title="Inventory Value"
          value={formatCurrency(overview?.totalInventoryValue || 0)}
          subtitle={`${overview?.uniqueStores || 0} stores`}
          icon={BuildingStorefrontIcon}
          color="purple"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Distribution */}
        <ChartContainer
          title="Price Distribution"
          subtitle="Products by price range"
        >
          {loadingPrice ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={priceDistribution} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="range" 
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  axisLine={{ stroke: '#374151' }}
                />
                <YAxis 
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  axisLine={{ stroke: '#374151' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  fill="#f59e0b" 
                  radius={[4, 4, 0, 0]}
                  name="Products"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartContainer>

        {/* Stock Levels */}
        <ChartContainer
          title="Stock Levels"
          subtitle="Inventory distribution"
        >
          {loadingStock ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
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
                  label={({ level, count }) => `${level}: ${count}`}
                  labelLine={{ stroke: '#6b7280' }}
                >
                  {stockLevels?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartContainer>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products by Price */}
        <ChartContainer
          title="Top Products by Price"
          subtitle="Highest priced items"
          action={
            <Link 
              to="/products?sortBy=price&sortOrder=desc"
              className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
            >
              View all <ArrowRightIcon className="w-4 h-4" />
            </Link>
          }
        >
          {loadingTop ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts?.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link 
                    to={`/products/${product.id}`}
                    className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-neutral-800 overflow-hidden">
                      {product.image_url && (
                        <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{product.title}</p>
                      <p className="text-xs text-neutral-500">{product.stock || 0} in stock</p>
                    </div>
                    <span className="flex-shrink-0 text-lg font-bold text-primary-400">
                      {formatCurrency(product.price)}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </ChartContainer>

        {/* Low Stock Alert */}
        <ChartContainer
          title="Low Stock Alert"
          subtitle="Products running low"
          action={
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-500/20 text-amber-400">
              {lowStockProducts?.length || 0} items
            </span>
          }
        >
          {loadingLowStock ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {lowStockProducts?.slice(0, 8).map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link 
                    to={`/products/${product.id}`}
                    className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-neutral-800 overflow-hidden">
                      {product.image_url && (
                        <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{product.title}</p>
                      <p className="text-xs text-neutral-500">{product.store_name}</p>
                    </div>
                    <span className={`flex-shrink-0 px-2 py-1 text-xs font-bold rounded-full ${
                      product.stock === 0 
                        ? 'bg-red-500/20 text-red-400' 
                        : product.stock <= 5 
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {product.stock} left
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </ChartContainer>
      </div>
    </div>
  );
}

export default Dashboard;
