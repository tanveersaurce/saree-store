// LoadingSpinner.jsx
import React from 'react';

export default function LoadingSpinner({ fullPage = false, size = 'md' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  const spinner = (
    <div className={`${sizes[size]} border-3 border-saree-blush border-t-saree-rose rounded-full animate-spin`}
      style={{ borderWidth: '3px' }}
    />
  );

  if (fullPage) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-saree-ivory gap-4">
        {spinner}
        <p className="font-accent text-lg text-saree-rose italic animate-pulse-soft">Loading...</p>
      </div>
    );
  }

  return <div className="flex justify-center p-8">{spinner}</div>;
}
