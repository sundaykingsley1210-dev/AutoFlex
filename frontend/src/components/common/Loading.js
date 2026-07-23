import React from 'react';
import { FaSpinner } from 'react-icons/fa';

const Loading = ({ size = 'md', text = 'Loading...' }) => {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <FaSpinner className={`${sizes[size]} text-primary-400 animate-spin`} />
      {text && <p className="text-secondary-400 text-sm">{text}</p>}
    </div>
  );
};

export default Loading;
