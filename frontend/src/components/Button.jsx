// frontend/src/components/Button.jsx

import React from 'react';

// This component provides a styled button with support for different types and click handlers.
const Button = ({ children, onClick, type = 'button', className = '', ...props }) => {
  return (
    <button type={type} onClick={onClick} className={`btn ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;