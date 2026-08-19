import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = React.forwardRef(
  ({ children, variant = 'primary', isLoading = false, className = '', disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-60 disabled:pointer-events-none';
    
    const variants = {
      primary: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm hover:shadow',
      secondary: 'bg-white text-slate-700 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50',
      danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow',
      ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
    };

    return (
      <button
        ref={ref}
        disabled={isLoading || disabled}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
