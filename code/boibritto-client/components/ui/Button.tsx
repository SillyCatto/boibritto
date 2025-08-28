// Simple themed Button component
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({ children, className = '', ...props }) => {
  return (
    <button
      className={`px-4 py-2 rounded font-semibold transition-colors focus:outline-none focus:ring ${props.disabled ? 'opacity-60 cursor-not-allowed' : ''} bg-primary text-white hover:bg-primary-dark ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
