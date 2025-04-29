import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success" | "info" | "warning";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  className = "",
  variant = "primary",
  size = "md",
  fullWidth = false,
  ...props
}) => {
  const baseClasses =
    "font-medium rounded-md shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50";

  const variantClasses = {
    primary: "bg-emerald-500 hover:bg-emerald-600 text-white focus:ring-emerald-400",
    secondary:
      "bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 focus:ring-gray-400",
    danger: "bg-red-500 hover:bg-red-600 text-white focus:ring-red-500",
    success: "bg-green-500 hover:bg-green-600 text-white focus:ring-green-500",
    info: "bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500",
    warning: "bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-500"
  };

  // TimeTree-like sizing for all button sizes
  const sizeClasses = {
    sm: "py-2 px-4 text-sm",
    md: "py-2 px-5 text-base",
    lg: "py-3 px-6 text-lg",
  };

  const widthClass = fullWidth ? "w-full" : "";

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`;

  return (
    <button className={buttonClasses} {...props}>
      {children}
    </button>
  );
};

export default Button;
