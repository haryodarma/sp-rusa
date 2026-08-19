import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = React.forwardRef(({ label, error, className = '', ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = props.type === 'password';

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <div className="relative flex items-center">
        <input
          ref={ref}
          {...props}
          type={isPasswordType ? (showPassword ? 'text' : 'password') : props.type}
          className={`w-full px-4 py-2.5 bg-white border rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-shadow ${
            isPasswordType ? 'pr-11' : ''
          } ${
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
              : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-100 hover:border-slate-300'
          }`}
        />
        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 text-slate-400 hover:text-slate-600 focus:outline-none flex items-center justify-center cursor-pointer"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
      {error && <span className="text-sm text-red-500 mt-0.5">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
