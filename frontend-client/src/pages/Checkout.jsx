import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  CreditCardIcon,
  TruckIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { ordersApi } from '../api';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { formatPrice } from '../utils/helpers';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

function Checkout() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { items, subtotal, clearCart } = useCartStore();

  const [step, setStep] = useState(1);
  const [address, setAddress] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'ES',
    phone: '',
  });
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  const shippingCost = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.21;
  const total = subtotal + shippingCost + tax;

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      const { data } = await ordersApi.create({ address, notes });
      return data;
    },
    onSuccess: (data) => {
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/orders/${data.data.id}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create order');
    },
  });

  const validateAddress = () => {
    const newErrors = {};
    if (!address.firstName) newErrors.firstName = 'First name is required';
    if (!address.lastName) newErrors.lastName = 'Last name is required';
    if (!address.street) newErrors.street = 'Street is required';
    if (!address.city) newErrors.city = 'City is required';
    if (!address.postalCode) newErrors.postalCode = 'Postal code is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleContinue = () => {
    if (step === 1 && validateAddress()) {
      setStep(2);
    }
  };

  const handlePlaceOrder = () => {
    createOrderMutation.mutate();
  };

  if (!isAuthenticated) {
    navigate('/login', { state: { from: { pathname: '/checkout' } } });
    return null;
  }

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-8">
        Checkout
      </h1>

      {/* Steps */}
      <div className="flex items-center justify-center mb-12">
        {[
          { num: 1, label: 'Shipping', icon: TruckIcon },
          { num: 2, label: 'Payment', icon: CreditCardIcon },
        ].map((s, i) => (
          <div key={s.num} className="flex items-center">
            <div
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-full',
                step >= s.num
                  ? 'bg-primary-500 text-white'
                  : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
              )}
            >
              {step > s.num ? (
                <CheckCircleIcon className="h-5 w-5" />
              ) : (
                <s.icon className="h-5 w-5" />
              )}
              <span className="font-medium">{s.label}</span>
            </div>
            {i < 1 && (
              <div
                className={clsx(
                  'w-16 h-0.5 mx-2',
                  step > s.num
                    ? 'bg-primary-500'
                    : 'bg-neutral-200 dark:bg-neutral-800'
                )}
              />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {step === 1 && (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">
                Shipping Address
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="First Name"
                  name="firstName"
                  value={address.firstName}
                  onChange={handleAddressChange}
                  error={errors.firstName}
                />
                <Input
                  label="Last Name"
                  name="lastName"
                  value={address.lastName}
                  onChange={handleAddressChange}
                  error={errors.lastName}
                />
                <Input
                  label="Street Address"
                  name="street"
                  value={address.street}
                  onChange={handleAddressChange}
                  error={errors.street}
                  className="md:col-span-2"
                />
                <Input
                  label="City"
                  name="city"
                  value={address.city}
                  onChange={handleAddressChange}
                  error={errors.city}
                />
                <Input
                  label="State/Province"
                  name="state"
                  value={address.state}
                  onChange={handleAddressChange}
                />
                <Input
                  label="Postal Code"
                  name="postalCode"
                  value={address.postalCode}
                  onChange={handleAddressChange}
                  error={errors.postalCode}
                />
                <Input
                  label="Phone (optional)"
                  name="phone"
                  value={address.phone}
                  onChange={handleAddressChange}
                />
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Order Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Any special instructions for delivery..."
                />
              </div>

              <Button
                fullWidth
                size="lg"
                className="mt-6"
                onClick={handleContinue}
              >
                Continue to Payment
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">
                Payment
              </h2>

              <div className="p-6 bg-neutral-50 dark:bg-neutral-800 rounded-xl mb-6">
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  <strong>Note:</strong> This is a demo checkout. In production, you would
                  be redirected to Stripe Checkout to complete your payment securely.
                </p>
                <div className="flex items-center gap-4 text-neutral-500">
                  <CreditCardIcon className="h-8 w-8" />
                  <span>Stripe Checkout Integration (Coming Soon)</span>
                </div>
              </div>

              {/* Shipping Summary */}
              <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-xl mb-6">
                <h3 className="font-medium text-neutral-900 dark:text-white mb-2">
                  Shipping Address
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {address.firstName} {address.lastName}
                  <br />
                  {address.street}
                  <br />
                  {address.city}, {address.state} {address.postalCode}
                  <br />
                  {address.country}
                </p>
                <button
                  onClick={() => setStep(1)}
                  className="mt-2 text-sm text-primary-500 hover:text-primary-600"
                >
                  Edit Address
                </button>
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button
                  fullWidth
                  size="lg"
                  onClick={handlePlaceOrder}
                  isLoading={createOrderMutation.isPending}
                >
                  Place Order
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">
              Order Summary
            </h2>

            {/* Items */}
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex-shrink-0">
                    {item.product.imageUrl && (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                      {item.product.name}
                    </p>
                    <p className="text-sm text-neutral-500">
                      Qty: {item.quantity}
                    </p>
                    <p className="text-sm font-medium text-primary-500">
                      {formatPrice(item.itemTotal || item.product.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <hr className="my-6 border-neutral-200 dark:border-neutral-800" />

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
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
