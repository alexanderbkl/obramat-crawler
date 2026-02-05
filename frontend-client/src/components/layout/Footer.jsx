import { Link } from 'react-router-dom';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';

function Footer() {
  return (
    <footer className="bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <ShoppingBagIcon className="h-8 w-8 text-primary-500" />
              <span className="text-xl font-bold gradient-text">EShop</span>
            </Link>
            <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
              Your one-stop shop for all your needs. Quality products, great prices,
              and exceptional service.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
              Shop
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  to="/products"
                  className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary-500"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  to="/products?isFeatured=true"
                  className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary-500"
                >
                  Featured
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=electronics"
                  className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary-500"
                >
                  Electronics
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=clothing"
                  className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary-500"
                >
                  Clothing
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
              Account
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  to="/profile"
                  className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary-500"
                >
                  My Profile
                </Link>
              </li>
              <li>
                <Link
                  to="/orders"
                  className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary-500"
                >
                  Order History
                </Link>
              </li>
              <li>
                <Link
                  to="/cart"
                  className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary-500"
                >
                  Shopping Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
              Support
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  Contact Us
                </span>
              </li>
              <li>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  Shipping Info
                </span>
              </li>
              <li>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  Returns & Refunds
                </span>
              </li>
              <li>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  FAQ
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-neutral-200 dark:border-neutral-800">
          <p className="text-sm text-center text-neutral-600 dark:text-neutral-400">
            © {new Date().getFullYear()} EShop. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
