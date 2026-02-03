import { forwardRef } from 'react';
import clsx from 'clsx';
import LoadingSpinner from './LoadingSpinner';

const Button = forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      fullWidth = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary:
        'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500',
      secondary:
        'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700 focus:ring-neutral-500',
      outline:
        'border-2 border-neutral-300 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800 focus:ring-neutral-500',
      ghost:
        'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 focus:ring-neutral-500',
      danger:
        'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        className={clsx(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
