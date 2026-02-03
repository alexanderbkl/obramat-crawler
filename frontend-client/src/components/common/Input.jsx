import { forwardRef } from 'react';
import clsx from 'clsx';

const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      className = '',
      inputClassName = '',
      ...props
    },
    ref
  ) => {
    return (
      <div className={className}>
        {label && (
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={clsx(
            'w-full px-4 py-2.5 rounded-xl border transition-colors duration-200',
            'bg-white dark:bg-neutral-900',
            'text-neutral-900 dark:text-white',
            'placeholder:text-neutral-400 dark:placeholder:text-neutral-500',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-neutral-300 dark:border-neutral-700',
            inputClassName
          )}
          {...props}
        />
        {(error || helperText) && (
          <p
            className={clsx(
              'mt-1 text-sm',
              error ? 'text-red-500' : 'text-neutral-500'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
