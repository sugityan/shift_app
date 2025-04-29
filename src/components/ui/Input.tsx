import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  className = "",
  fullWidth = true,
  ...props
}) => {
  const inputClasses = `block px-4 py-3 text-base border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 
    ${
      error
        ? "border-red-300 text-red-900 placeholder-red-300"
        : "border-gray-300"
    } 
    ${fullWidth ? "w-full" : ""} 
    ${className}`;

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-base font-medium text-black mb-2">
          {label}
        </label>
      )}
      <input className={inputClasses} {...props} />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Input;
