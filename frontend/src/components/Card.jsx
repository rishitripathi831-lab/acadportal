// frontend/src/components/Card.jsx

import React from 'react';

// This component provides a styled card container for displaying information.
const Card = ({ children, className = '' }) => {
  return (
    <div className={`card ${className}`}>
      {children}
    </div>
  );
};

export default Card;