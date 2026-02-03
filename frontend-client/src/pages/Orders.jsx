import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ClipboardDocumentListIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { ordersApi } from '../api';
import { formatPrice, formatDate, getOrderStatusColor } from '../utils/helpers';
import { PageLoader } from '../components/common/LoadingSpinner';

function Orders() {
  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data } = await ordersApi.getAll({ limit: 50 });
      return data;
    },
  });

  const orders = data?.data || [];

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-8">
        Order History
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <ClipboardDocumentListIcon className="h-24 w-24 mx-auto text-neutral-300 dark:text-neutral-700" />
          <h2 className="mt-6 text-2xl font-bold text-neutral-900 dark:text-white">
            No orders yet
          </h2>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            When you place orders, they will appear here.
          </p>
          <Link
            to="/products"
            className="inline-block mt-8 px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={`/orders/${order.id}`}
                className="block bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 hover:border-primary-500/50 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold text-neutral-900 dark:text-white">
                        {order.orderNumber}
                      </span>
                      <span
                        className={clsx(
                          'px-3 py-1 rounded-full text-xs font-medium',
                          getOrderStatusColor(order.status)
                        )}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary-500">
                        {formatPrice(order.total)}
                      </p>
                      <p className="text-sm text-neutral-500">
                        {order.items.length}{' '}
                        {order.items.length === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                    <ChevronRightIcon className="h-5 w-5 text-neutral-400" />
                  </div>
                </div>

                {/* Preview items */}
                <div className="mt-4 flex items-center gap-2 overflow-x-auto">
                  {order.items.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex-shrink-0"
                    >
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs">
                          No img
                        </div>
                      )}
                    </div>
                  ))}
                  {order.items.length > 4 && (
                    <span className="text-sm text-neutral-500">
                      +{order.items.length - 4} more
                    </span>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;
