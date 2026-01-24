import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HomeIcon, 
  CubeIcon, 
  ChartBarIcon,
  Squares2X2Icon 
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Products', href: '/products', icon: CubeIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
];

function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 glass border-r border-white/10">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-white/10">
            <Squares2X2Icon className="w-8 h-8 text-primary-500" />
            <span className="ml-3 text-lg font-semibold gradient-text">Obramat Analytics</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.href !== '/' && location.pathname.startsWith(item.href));
              
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={clsx(
                    'group flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive 
                      ? 'bg-primary-500/20 text-primary-400' 
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  )}
                >
                  <item.icon className={clsx(
                    'w-5 h-5 mr-3 transition-colors',
                    isActive ? 'text-primary-400' : 'text-neutral-500 group-hover:text-neutral-300'
                  )} />
                  {item.name}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400"
                    />
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/10">
            <div className="glass rounded-xl p-4">
              <p className="text-xs text-neutral-500">
                Product data crawler analytics
              </p>
              <p className="text-xs text-neutral-600 mt-1">
                v1.0.0
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64">
        <div className="p-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default Layout;
