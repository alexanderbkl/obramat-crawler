import { motion } from 'framer-motion';

function ChartContainer({ title, subtitle, children, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl border border-white/10 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {subtitle && (
            <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </motion.div>
  );
}

export default ChartContainer;
