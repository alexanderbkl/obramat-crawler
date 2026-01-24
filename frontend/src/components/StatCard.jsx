import { motion } from 'framer-motion';
import clsx from 'clsx';

function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'primary' }) {
  const colorClasses = {
    primary: 'from-primary-500/20 to-primary-600/10 border-primary-500/30',
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
    green: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
    amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/30',
  };

  const iconColorClasses = {
    primary: 'text-primary-400 bg-primary-500/20',
    blue: 'text-blue-400 bg-blue-500/20',
    green: 'text-emerald-400 bg-emerald-500/20',
    purple: 'text-purple-400 bg-purple-500/20',
    amber: 'text-amber-400 bg-amber-500/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={clsx(
        'relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 transition-all duration-300',
        colorClasses[color]
      )}
    >
      {/* Background decoration */}
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
      
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-neutral-400 font-medium">{title}</p>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
          {subtitle && (
            <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>
          )}
          {trend && (
            <p className={clsx(
              'mt-2 text-xs font-medium',
              trend > 0 ? 'text-emerald-400' : 'text-red-400'
            )}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last period
            </p>
          )}
        </div>
        {Icon && (
          <div className={clsx('p-3 rounded-xl', iconColorClasses[color])}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default StatCard;
