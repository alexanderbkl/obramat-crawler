import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrashIcon,
  MinusIcon,
  PlusIcon,
  ShoppingBagIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { formatPrice } from '../utils/helpers';
import Button from '../components/common/Button';
import { PageLoader } from '../components/common/LoadingSpinner';

function Cart() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const {
    items,
    itemCount,
    subtotal,
    isLoading,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCartStore();

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    const result = await updateQuantity(itemId, newQuantity);
    if (!result.success) {
      toast.error(result.error || 'Failed to update quantity');
    }
  };

  const handleRemoveItem = async (itemId) => {
    const result = await removeItem(itemId);
    if (result.success) {
      toast.success('Item removed');
    } else {
      toast.error(result.error || 'Failed to remove item');
    }
  };

  const handleClearCart = async () => {
    await clearCart();
    toast.success('Cart cleared');
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }
    navigate('/checkout');
  };

  // Calculate totals
  const shippingCost = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.21; // 21% VAT
  const total = subtotal + shippingCost + tax;

  if (isLoading) {
    return <PageLoader />;
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <ShoppingBagIcon className="h-24 w-24 mx-auto text-neutral-300 dark:text-neutral-700" />
        <h2 className="mt-6 text-2xl font-bold text-neutral-900 dark:text-white">
          Your cart is empty
        </h2>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Looks like you haven't added any items to your cart yet.
        </p>
        <Link to="/products">
          <Button className="mt-8">
            Continue Shopping
            <ArrowRightIcon className="h-5 w-5 ml-2" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Shopping Cart
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
        <Button variant="ghost" onClick={handleClearCart}>
          <TrashIcon className="h-5 w-5 mr-2" />
          Clear Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex gap-4 p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
            >
              {/* Image */}
              <Link
                to={`/products/${item.product.slug || item.productId}`}
                className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800"
              >
                {item.product.imageUrl ? (
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBagIcon className="h-8 w-8 text-neutral-400" />
                  </div>
                )}
              </Link>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <Link
                  to={`/products/${item.product.slug || item.productId}`}
                  className="text-lg font-medium text-neutral-900 dark:text-white hover:text-primary-500 line-clamp-2"
                >
                  {item.product.name}
                </Link>

                <div className="mt-2 flex items-center gap-4">
                  <span className="text-lg font-bold text-primary-500">
                    {formatPrice(item.product.price)}
                  </span>
                  {item.product.comparePrice &&
                    item.product.comparePrice > item.product.price && (
                      <span className="text-sm text-neutral-400 line-through">
                        {formatPrice(item.product.comparePrice)}
                      </span>
                    )}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                      className="w-8 h-8 rounded-lg border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50"
                    >
                      <MinusIcon className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity + 1)
                      }
                      disabled={item.quantity >= item.product.stock}
                      className="w-8 h-8 rounded-lg border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Item Total & Remove */}
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold text-neutral-900 dark:text-white">
                      {formatPrice(item.itemTotal || item.product.price * item.quantity)}
                    </span>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">
              Order Summary
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>Shipping</span>
                <span>
                  {shippingCost === 0 ? (
                    <span className="text-green-500">Free</span>
                  ) : (
                    formatPrice(shippingCost)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>Tax (21% VAT)</span>
                <span>{formatPrice(tax)}</span>
              </div>

              <hr className="border-neutral-200 dark:border-neutral-800" />

              <div className="flex justify-between text-lg font-bold text-neutral-900 dark:text-white">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            {subtotal < 50 && (
              <p className="mt-4 text-sm text-neutral-500">
                Add {formatPrice(50 - subtotal)} more to get free shipping!
              </p>
            )}

            <Button fullWidth size="lg" className="mt-6" onClick={handleCheckout}>
              Proceed to Checkout
              <ArrowRightIcon className="h-5 w-5 ml-2" />
            </Button>

            <Link
              to="/products"
              className="mt-4 block text-center text-sm text-primary-500 hover:text-primary-600"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
