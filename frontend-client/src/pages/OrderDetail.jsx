import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronLeftIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { ordersApi } from '../api';
import { formatPrice, formatDateTime, getOrderStatusColor } from '../utils/helpers';
import { PageLoader } from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';

const statusSteps = [
  { status: 'PENDING', label: 'Pending', icon: ClockIcon },
  { status: 'PROCESSING', label: 'Processing', icon: ClockIcon },
  { status: 'PAID', label: 'Paid', icon: CheckCircleIcon },
  { status: 'SHIPPED', label: 'Shipped', icon: TruckIcon },
  { status: 'DELIVERED', label: 'Delivered', icon: CheckCircleIcon },
];

function OrderDetail() {
  const { id } = useParams();

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const { data } = await ordersApi.getById(id);
      return data.data;
    },
  });

  if (isLoading) {
    return <PageLoader />;
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Order not found
        </h2>
        <Link
          to="/orders"
          className="mt-4 inline-flex items-center text-primary-500 hover:text-primary-600"
        >
          <ChevronLeftIcon className="h-5 w-5 mr-1" />
          Back to orders
        </Link>
      </div>
    );
  }

  const currentStepIndex = statusSteps.findIndex(
    (s) => s.status === order.status
  );
  const isCancelled = order.status === 'CANCELLED' || order.status === 'REFUNDED';

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/orders"
          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <ChevronLeftIcon className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Order {order.orderNumber}
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Placed on {formatDateTime(order.createdAt)}
          </p>
        </div>
        <span
          className={clsx(
            'ml-auto px-4 py-2 rounded-full text-sm font-medium',
            getOrderStatusColor(order.status)
          )}
        >
          {order.status}
        </span>
      </div>

      {/* Status Timeline */}
      {!isCancelled && (
        <div className="mb-8 p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            {statusSteps.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div key={step.status} className="flex flex-col items-center">
                  <div
                    className={clsx(
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      isCompleted
                        ? 'bg-primary-500 text-white'
                        : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400'
                    )}
                  >
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span
                    className={clsx(
                      'mt-2 text-xs font-medium',
                      isCompleted
                        ? 'text-primary-500'
                        : 'text-neutral-400'
                    )}
                  >
                    {step.label}
                  </span>
                  {index < statusSteps.length - 1 && (
                    <div
                      className={clsx(
                        'absolute h-0.5 w-full',
                        isCompleted ? 'bg-primary-500' : 'bg-neutral-200 dark:bg-neutral-800'
                      )}
                      style={{
                        left: '50%',
                        top: '20px',
                        width: 'calc(100% - 40px)',
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Items */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">
              Order Items
            </h2>

            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl"
                >
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-neutral-200 dark:bg-neutral-700 flex-shrink-0">
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
                  <div className="flex-1">
                    <Link
                      to={`/products/${item.product?.slug || item.productId}`}
                      className="font-medium text-neutral-900 dark:text-white hover:text-primary-500"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-neutral-500">Qty: {item.quantity}</p>
                    <p className="text-sm font-medium text-primary-500">
                      {formatPrice(item.price)} each
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-neutral-900 dark:text-white">
                      {formatPrice(Number(item.price) * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1 space-y-6">
          {/* Totals */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">
              Order Summary
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>Shipping</span>
                <span>
                  {Number(order.shippingCost) === 0 ? (
                    <span className="text-green-500">Free</span>
                  ) : (
                    formatPrice(order.shippingCost)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>Tax</span>
                <span>{formatPrice(order.tax)}</span>
              </div>

              <hr className="border-neutral-200 dark:border-neutral-800" />

              <div className="flex justify-between text-lg font-bold text-neutral-900 dark:text-white">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {order.address && (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
                Shipping Address
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                {order.address.firstName} {order.address.lastName}
                <br />
                {order.address.street}
                <br />
                {order.address.city}, {order.address.state} {order.address.postalCode}
                <br />
                {order.address.country}
                {order.address.phone && (
                  <>
                    <br />
                    {order.address.phone}
                  </>
                )}
              </p>
            </div>
          )}

          {/* Actions */}
          {order.status === 'PENDING' && (
            <Button fullWidth size="lg">
              Pay Now
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;
